import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import AutomationSettings from "../models/AutomationSettings.js";
import createNotification from "../utils/createNotification.js";

// ======================================
// Get Active Callers
// ======================================

export const getActiveCallers = async () => {
  try {
    const callers = await User.find({
      role: "caller",
      status: "active",
    }).sort({ createdAt: 1 });

    return callers;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ======================================
// Round Robin Lead Assignment
// ======================================

export const assignLeadRoundRobin = async () => {
  try {
    // Get Active Callers
    const callers = await getActiveCallers();

    if (callers.length === 0) {
      throw new Error("No Active Caller Found");
    }

    // Get Assignment Record
    let assignment = await Assignment.findOne();

    // First Lead
    if (!assignment) {
      assignment = await Assignment.create({
        lastAssignedCaller: callers[0]._id,
      });

      return callers[0];
    }

    // Find Last Assigned Caller
    const lastIndex = callers.findIndex(
      (caller) =>
        caller._id.toString() === assignment.lastAssignedCaller?.toString()
    );

    // Next Caller Index
    let nextIndex = lastIndex + 1;

    if (nextIndex >= callers.length) {
      nextIndex = 0;
    }

    // Update Assignment Record
    assignment.lastAssignedCaller = callers[nextIndex]._id;

    await assignment.save();

    return callers[nextIndex];
  } catch (error) {
    throw new Error(error.message);
  }
};

// ======================================
// Get Automation Settings (singleton)
// ======================================

export const getAutomationSettings = async () => {
  let settings = await AutomationSettings.findOne();

  if (!settings) {
    settings = await AutomationSettings.create({
      triggerRules: [
        {
          name: "New Lead - Instant WhatsApp",
          trigger: "newLead",
          action: "whatsapp",
          messageTemplate:
            "Hi {name}! We've received your inquiry. An agent will call you within 30 minutes.",
          active: true,
        },
        {
          name: "Hot Lead - Manager Alert",
          trigger: "hotLead",
          action: "managerAlert",
          messageTemplate: "Hot Lead: {name} - call immediately!",
          active: true,
        },
      ],
    });
  }

  return settings;
};

// ======================================
// Resolve Assignment (source rule -> round robin -> null)
// ======================================

export const resolveLeadAssignment = async (source) => {
  const settings = await getAutomationSettings();

  // 1. Check for an active source-based rule
  const rule = settings.sourceRules.find(
    (r) => r.source === source && r.active
  );

  if (rule) {
    const user = await User.findById(rule.assignTo);

    if (user && user.status === "active") {
      rule.triggerCount += 1;
      await settings.save();

      return user;
    }
  }

  // 2. Fall back to round robin if enabled
  if (settings.roundRobinEnabled) {
    const caller = await assignLeadRoundRobin();

    settings.roundRobinTriggerCount += 1;
    await settings.save();

    return caller;
  }

  // 3. No rule matched and round robin is off
  return null;
};

// ======================================
// Fire Event-Based Trigger Rules (newLead / hotLead)
// ======================================

export const fireTriggerRules = async (triggerType, lead) => {
  const settings = await getAutomationSettings();

  const rules = settings.triggerRules.filter(
    (r) => r.trigger === triggerType && r.active
  );

  if (rules.length === 0) return;

  for (const rule of rules) {
    rule.triggerCount += 1;

    const message = rule.messageTemplate
      .replace(/{name}/g, lead.customerName || "Customer")
      .replace(/{budget}/g, lead.leadValue ? `₹${lead.leadValue}` : "N/A");

    if (rule.action === "managerAlert") {
      await createNotification(
        `🔥 ${rule.name}`,
        message,
        "lead"
      );
    } else if (rule.action === "whatsapp") {
      await createNotification(
        `💬 WhatsApp Ready — ${lead.customerName}`,
        message,
        "lead"
      );
    }
  }

  await settings.save();
};