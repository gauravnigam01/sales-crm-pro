import Lead from "../models/Lead.js";
import {
  getAutomationSettings,
} from "../services/leadAssignmentService.js";

// ======================================
// Get Automation Settings
// ======================================

export const getSettings = async (req, res) => {
  try {
    const settings = await getAutomationSettings();

    const populated = await settings.populate(
      "sourceRules.assignTo",
      "fullName"
    );

    res.status(200).json({
      success: true,
      settings: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Automation Stats (Active Rules / Total Triggered / WA Sent)
// ======================================

export const getStats = async (req, res) => {
  try {
    const settings = await getAutomationSettings();

    const activeSourceRules = settings.sourceRules.filter(
      (r) => r.active
    ).length;

    const activeTriggerRules = settings.triggerRules.filter(
      (r) => r.active
    ).length;

    const activeRulesCount =
      activeSourceRules +
      activeTriggerRules +
      (settings.roundRobinEnabled ? 1 : 0);

    const sourceRulesTriggered = settings.sourceRules.reduce(
      (sum, r) => sum + r.triggerCount,
      0
    );

    const triggerRulesTriggered = settings.triggerRules.reduce(
      (sum, r) => sum + r.triggerCount,
      0
    );

    const totalTriggered =
      sourceRulesTriggered +
      triggerRulesTriggered +
      settings.roundRobinTriggerCount;

    const waSentCount = await Lead.countDocuments({
      whatsappSent: true,
    });

    res.status(200).json({
      success: true,
      stats: {
        activeRulesCount,
        totalTriggered,
        waSentCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Toggle Round Robin
// ======================================

export const toggleRoundRobin = async (req, res) => {
  try {
    const settings = await getAutomationSettings();

    settings.roundRobinEnabled = !settings.roundRobinEnabled;

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Round Robin ${
        settings.roundRobinEnabled ? "Enabled" : "Disabled"
      }`,
      roundRobinEnabled: settings.roundRobinEnabled,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Inactivity Threshold
// ======================================

export const updateInactivityDays = async (req, res) => {
  try {
    const { inactivityDays } = req.body;

    const settings = await getAutomationSettings();

    settings.inactivityDays = inactivityDays;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Inactivity Threshold Updated",
      inactivityDays: settings.inactivityDays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Add Source Rule
// ======================================

export const addSourceRule = async (req, res) => {
  try {
    const { source, assignTo } = req.body;

    if (!source || !assignTo) {
      return res.status(400).json({
        success: false,
        message: "Source and Assignee are Required",
      });
    }

    const settings = await getAutomationSettings();

    settings.sourceRules.push({ source, assignTo, active: true });

    await settings.save();

    const populated = await settings.populate(
      "sourceRules.assignTo",
      "fullName"
    );

    res.status(201).json({
      success: true,
      message: "Rule Added Successfully",
      settings: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Toggle / Delete Source Rule
// ======================================

export const toggleSourceRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    const settings = await getAutomationSettings();

    const rule = settings.sourceRules.id(ruleId);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Rule Not Found",
      });
    }

    rule.active = !rule.active;

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Rule ${rule.active ? "Enabled" : "Disabled"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSourceRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    const settings = await getAutomationSettings();

    settings.sourceRules = settings.sourceRules.filter(
      (r) => r._id.toString() !== ruleId
    );

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Rule Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Add Trigger Rule (event-based automation)
// ======================================

export const addTriggerRule = async (req, res) => {
  try {
    const { name, trigger, action, messageTemplate } = req.body;

    if (!name || !trigger || !action) {
      return res.status(400).json({
        success: false,
        message: "Name, Trigger and Action are Required",
      });
    }

    const settings = await getAutomationSettings();

    settings.triggerRules.push({
      name,
      trigger,
      action,
      messageTemplate: messageTemplate || "",
      active: true,
    });

    await settings.save();

    res.status(201).json({
      success: true,
      message: "Automation Added Successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Toggle / Delete Trigger Rule
// ======================================

export const toggleTriggerRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    const settings = await getAutomationSettings();

    const rule = settings.triggerRules.id(ruleId);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Automation Not Found",
      });
    }

    rule.active = !rule.active;

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Automation ${rule.active ? "Enabled" : "Disabled"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTriggerRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    const settings = await getAutomationSettings();

    settings.triggerRules = settings.triggerRules.filter(
      (r) => r._id.toString() !== ruleId
    );

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Automation Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Inactive Leads
// ======================================

export const getInactiveLeads = async (req, res) => {
  try {
    const settings = await getAutomationSettings();

    const threshold = new Date();
    threshold.setDate(threshold.getDate() - settings.inactivityDays);

    const leads = await Lead.find({
      status: { $nin: ["Closed Won", "Closed Lost"] },
      updatedAt: { $lt: threshold },
    })
      .populate("assignedTo", "fullName")
      .sort({ updatedAt: 1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      inactivityDays: settings.inactivityDays,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
