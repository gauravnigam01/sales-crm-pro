import mongoose from "mongoose";
import createNotification from "../utils/createNotification.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import {
  resolveLeadAssignment,
  fireTriggerRules,
} from "../services/leadAssignmentService.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
import { buildScopeFilter, isUserInScope } from "../utils/teamScope.js";

// ======================================
// Can the requesting user access this specific lead?
// admin: always. caller: only if it's assigned to them.
// manager: only if it's assigned to someone in their team (or themselves).
// ======================================

const canAccessLead = async (user, lead) => {
  if (user.role === "admin") return true;

  // assignedTo may be a populated doc or a raw ObjectId depending on the query
  const assignedToId = lead.assignedTo?._id || lead.assignedTo;

  if (user.role === "caller") {
    return assignedToId?.toString() === user._id.toString();
  }

  return isUserInScope(user, assignedToId);
};

// ======================================
// ======================================
// Create Lead
// ======================================

export const createLead = async (req, res) => {
  try {

    let { assignedTo, initialNote, force, ...leadData } = req.body;

    // Callers may only ever create leads for themselves; managers may only
    // assign to a member of their own team (or themselves) — data isolation
    // must hold at creation time, not just on later reads.
    if (req.user?.role === "caller") {
      assignedTo = req.user._id.toString();
    } else if (req.user?.role === "manager" && assignedTo) {
      const allowed = await isUserInScope(req.user, assignedTo);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You can only assign leads to members of your team",
        });
      }
    }

    if (leadData.phone && !force) {
      const last10 = leadData.phone.replace(/\D/g, "").slice(-10);

      const duplicate = await Lead.findOne({
        phone: { $regex: last10 },
      }).populate("assignedTo", "fullName");

      if (duplicate) {
        return res.status(409).json({
          success: false,
          duplicate: true,
          message: "A lead with this phone number already exists",
          existingLead: {
            _id: duplicate._id,
            customerName: duplicate.customerName,
            status: duplicate.status,
            assignedTo: duplicate.assignedTo?.fullName || "Unassigned",
            createdAt: duplicate.createdAt,
          },
        });
      }
    }

    let caller = null;

    if (assignedTo) {
      // Manual assignment always wins
      caller = await User.findById(assignedTo);

      if (!caller) {
        return res.status(400).json({
          success: false,
          message: "Assigned User Not Found",
        });
      }
    } else {
      // Automation rules -> round robin -> unassigned
      caller = await resolveLeadAssignment(leadData.source || "Manual");
    }

    const timeline = [
      {
        action: "Lead Created",
        performedBy: req.user?._id || null,
      },
    ];

    if (caller) {
      timeline.push({
        action: `Lead Assigned to ${caller.fullName}`,
        performedBy: req.user?._id || null,
      });
    }

    const notes = initialNote
      ? [{ text: initialNote, addedBy: req.user?._id || null }]
      : [];

    const lead = await Lead.create({
      ...leadData,

      assignedTo: caller?._id || null,
      assignedBy: req.user?._id || null,

      timeline,
      notes,
    });

    // ==============================
    // Create Notification
    // ==============================

    await createNotification(
      "New Lead Added",
      caller
        ? `${lead.customerName} has been added and assigned to ${caller.fullName}.`
        : `${lead.customerName} has been added and is unassigned.`,
      "lead"
    );

    // Fire "New Lead" automation trigger rules
    await fireTriggerRules("newLead", lead);

    if (caller) {
      await User.findByIdAndUpdate(caller._id, {
        $inc: {
          assignedLeads: 1,
        },
      });
    }

    // ==============================
    // Auto WhatsApp Notifications (best-effort — must never block lead creation)
    // ==============================

    try {
      if (lead.phone) {
        await sendWhatsAppMessage(
          lead.phone,
          `Hi ${lead.customerName}, thank you for reaching out! Our team has received your enquiry and will connect with you shortly.`,
          req.user?._id,
          lead._id
        );

        lead.whatsappSent = true;
        lead.timeline.push({
          action: "WhatsApp Sent (Auto - Client)",
          performedBy: req.user?._id || null,
        });
      }
    } catch (error) {
      console.log("Auto WhatsApp to client failed:", error.message);
    }

    try {
      if (caller?.phone) {
        await sendWhatsAppMessage(
          caller.phone,
          `New Lead Assigned 🔔\nName: ${lead.customerName}\nPhone: ${lead.phone}\nSource: ${lead.source || "Manual"}\nPlease follow up soon.`,
          req.user?._id,
          lead._id
        );

        lead.timeline.push({
          action: "WhatsApp Sent (Auto - Caller)",
          performedBy: req.user?._id || null,
        });
      }
    } catch (error) {
      console.log("Auto WhatsApp to caller failed:", error.message);
    }

    if (lead.isModified()) {
      await lead.save();
    }

    res.status(201).json({
      success: true,
      message: "Lead Created & Assigned Successfully",
      assignedTo: caller?.fullName || "Unassigned",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Import Leads (Bulk / CSV)
// ======================================

export const importLeads = async (req, res) => {
  try {
    const { leads, region } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Leads Provided",
      });
    }

    const created = [];
    const failed = [];

    for (const row of leads) {
      try {
        if (!row.customerName || !row.phone) {
          failed.push({ row, reason: "Missing customerName or phone" });
          continue;
        }

        const last10 = row.phone.replace(/\D/g, "").slice(-10);

        const duplicate = await Lead.findOne({
          phone: { $regex: last10 },
        });

        if (duplicate) {
          failed.push({
            row,
            reason: `Duplicate: lead already exists for ${duplicate.customerName}`,
          });
          continue;
        }

        const caller = await resolveLeadAssignment(row.source || "Manual");

        const timeline = [
          {
            action: "Lead Created (Imported)",
            performedBy: req.user?._id || null,
          },
        ];

        if (caller) {
          timeline.push({
            action: `Lead Assigned to ${caller.fullName}`,
            performedBy: req.user?._id || null,
          });
        }

        const lead = await Lead.create({
          customerName: row.customerName,
          email: row.email || "",
          phone: row.phone,
          company: row.company || "",
          source: row.source || "Manual",
          status: row.status || "New",
          priority: row.priority || "Medium",
          leadValue: row.leadValue || 0,
          region: row.region || region || "Not Specified",
          assignedTo: caller?._id || null,
          assignedBy: req.user?._id || null,
          timeline,
        });

        if (caller) {
          await User.findByIdAndUpdate(caller._id, {
            $inc: { assignedLeads: 1 },
          });
        }

        await fireTriggerRules("newLead", lead);

        created.push(lead);
      } catch (err) {
        failed.push({ row, reason: err.message });
      }
    }

    if (created.length > 0) {
      await createNotification(
        "Leads Imported",
        `${created.length} lead(s) imported successfully.`,
        "lead"
      );
    }

    res.status(201).json({
      success: true,
      message: `${created.length} Lead(s) Imported, ${failed.length} Failed`,
      createdCount: created.length,
      failedCount: failed.length,
      failed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get My Leads
// ======================================

export const getMyLeads = async (req, res) => {
  try {

    const leads = await Lead.find({
      assignedTo: req.user._id,
    })
      .populate(
        "assignedTo",
        "fullName email phone"
      )
      .populate(
        "timeline.performedBy",
        "fullName role"
      )
      .populate(
        "notes.addedBy",
        "fullName"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Update Lead Status
// ======================================

export const updateLeadStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const oldStatus = lead.status;

    lead.status = status;

    lead.timeline.push({
      action: `Status Changed from ${oldStatus} to ${status}`,
      performedBy: req.user._id,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead Status Updated Successfully",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Add Note
// ======================================

export const addLeadNote = async (req, res) => {
  try {

    const { id } = req.params;
    const { text } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    lead.notes.push({
      text,
      addedBy: req.user._id,
    });

    lead.timeline.push({
      action: `Note Added : ${text}`,
      performedBy: req.user._id,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Note Added Successfully",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Set Follow Up
// ======================================

export const setFollowUp = async (req, res) => {

  try {

    const { id } = req.params;
    const { followUpDate } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    lead.followUpDate = followUpDate;

    lead.timeline.push({
      action: `Follow-up Scheduled for ${new Date(
        followUpDate
      ).toLocaleString("en-IN")}`,
      performedBy: req.user._id,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Follow-up Scheduled Successfully",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Admin Update Lead
// ======================================

export const updateLead = async (req, res) => {
  try {

    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    // Managers may only reassign within their own team; callers may never
    // reassign at all (they have no route reason to send assignedTo, but
    // block it defensively regardless of what the client sends).
    if (req.body.assignedTo) {
      if (req.user.role === "caller") {
        delete req.body.assignedTo;
      } else if (req.user.role === "manager") {
        const allowed = await isUserInScope(req.user, req.body.assignedTo);

        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: "You can only assign leads to members of your team",
          });
        }
      }
    }

    // Store old values
    const oldStatus = lead.status;
    const oldPriority = lead.priority;
    const oldCompany = lead.company;
    const oldAssignedTo = lead.assignedTo?.toString();

    // Update fields
    lead.customerName =
      req.body.customerName || lead.customerName;

    lead.email =
      req.body.email || lead.email;

    lead.phone =
      req.body.phone || lead.phone;

    lead.company =
      req.body.company || lead.company;

    lead.status =
      req.body.status || lead.status;

    lead.priority =
      req.body.priority || lead.priority;

    lead.leadValue =
      req.body.leadValue || lead.leadValue;

    lead.region =
      req.body.region || lead.region;

    if (req.body.followUpDate) {
      lead.followUpDate = req.body.followUpDate;
    }

    if (req.body.nextCallDate) {
      lead.nextCallDate = req.body.nextCallDate;
    }

    if (req.body.assignedTo) {
      lead.assignedTo = req.body.assignedTo;
    }

    // ==========================
    // Timeline Entries
    // ==========================

    lead.timeline.push({
      action: "Lead Updated",
      performedBy: req.user._id,
    });

    if (oldStatus !== lead.status) {
      lead.timeline.push({
        action: `Status Changed from ${oldStatus} to ${lead.status}`,
        performedBy: req.user._id,
      });
    }

    if (oldPriority !== lead.priority) {
      lead.timeline.push({
        action: `Priority Changed from ${oldPriority} to ${lead.priority}`,
        performedBy: req.user._id,
      });
    }

    if (oldCompany !== lead.company) {
      lead.timeline.push({
        action: `Company Changed from ${oldCompany} to ${lead.company}`,
        performedBy: req.user._id,
      });
    }

    if (
      req.body.assignedTo &&
      oldAssignedTo !== req.body.assignedTo
    ) {
      const newUser = await User.findById(
        req.body.assignedTo
      );

      if (newUser) {
        lead.timeline.push({
          action: `Lead Assigned to ${newUser.fullName}`,
          performedBy: req.user._id,
        });
      }
    }

    if (req.body.followUpDate) {
      lead.timeline.push({
        action: `Follow-up Updated (${new Date(
          req.body.followUpDate
        ).toLocaleDateString("en-IN")})`,
        performedBy: req.user._id,
      });
    }

    await lead.save();

    // Fire "Hot Lead" automation trigger rules when priority newly becomes High
    if (oldPriority !== "High" && lead.priority === "High") {
      await fireTriggerRules("hotLead", lead);
    }

    res.status(200).json({
      success: true,
      message: "Lead Updated Successfully",
      lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Get All Leads (Admin)
// ======================================

export const getAllLeads = async (req, res) => {
  try {

    let filter = {};

    const requestedAssignedTo =
      req.query.assignedTo &&
      typeof req.query.assignedTo === "string" &&
      mongoose.Types.ObjectId.isValid(req.query.assignedTo)
        ? req.query.assignedTo
        : null;

    if (req.user.role === "caller") {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === "manager") {
      // Managers only ever see their own team's leads; a requested
      // assignedTo filter is only honored if it's within that team.
      filter = await buildScopeFilter(req.user, "assignedTo");

      if (requestedAssignedTo && (await isUserInScope(req.user, requestedAssignedTo))) {
        filter.assignedTo = requestedAssignedTo;
      }
    } else if (requestedAssignedTo) {
      filter.assignedTo = requestedAssignedTo;
    }

    const leads = await Lead.find(filter)
      .populate(
        "assignedTo",
        "fullName email phone"
      )
      .populate(
        "timeline.performedBy",
        "fullName role"
      )
      .populate(
        "notes.addedBy",
        "fullName"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Single Lead
// ======================================

export const getLeadById = async (req, res) => {
  try {

    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "fullName email phone")
      .populate("assignedBy", "fullName")
      .populate("timeline.performedBy", "fullName role")
      .populate("notes.addedBy", "fullName");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Log Quick Activity (Call Done / WhatsApp Sent / Meeting Done)
// ======================================

export const logLeadActivity = async (req, res) => {
  try {

    const { id } = req.params;
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is Required",
      });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    if (action === "WhatsApp Sent") {
      lead.whatsappSent = true;
    }

    lead.timeline.push({
      action,
      performedBy: req.user._id,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Activity Logged Successfully",
      lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Delete Lead
// ======================================
// ======================================
// Delete Lead
// ======================================

export const deleteLead = async (req, res) => {
  try {

    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!(await canAccessLead(req.user, lead))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await Lead.findByIdAndDelete(id);

    // ==============================
    // Create Notification
    // ==============================

    await createNotification(
      "Lead Deleted",
      `${lead.customerName} has been deleted successfully.`,
      "lead"
    );

    res.status(200).json({
      success: true,
      message: "Lead Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get Follow-Ups (leads with a followUpDate set)
// ======================================

export const getFollowUps = async (req, res) => {
  try {
    let filter = { followUpDate: { $ne: null } };

    if (req.user.role === "caller") {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === "manager") {
      filter = { ...filter, ...(await buildScopeFilter(req.user, "assignedTo")) };
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "fullName")
      .sort({ followUpDate: 1 });

    const now = new Date();

    const overdue = leads.filter((l) => new Date(l.followUpDate) < now);
    const upcoming = leads.filter((l) => new Date(l.followUpDate) >= now);

    res.status(200).json({
      success: true,
      count: leads.length,
      overdue,
      upcoming,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Call Logs (aggregated "Call Done" timeline entries)
// ======================================

export const getCallLogs = async (req, res) => {
  try {
    let filter = {
      timeline: { $elemMatch: { action: "Call Done" } },
    };

    if (req.user.role === "caller") {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === "manager") {
      filter = { ...filter, ...(await buildScopeFilter(req.user, "assignedTo")) };
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "fullName")
      .populate("timeline.performedBy", "fullName")
      .select("customerName phone company status assignedTo timeline");

    const calls = [];

    for (const lead of leads) {
      for (const entry of lead.timeline) {
        if (entry.action === "Call Done") {
          calls.push({
            _id: entry._id,
            leadId: lead._id,
            customerName: lead.customerName,
            phone: lead.phone,
            company: lead.company,
            status: lead.status,
            assignedTo: lead.assignedTo,
            performedBy: entry.performedBy,
            createdAt: entry.createdAt,
          });
        }
      }
    }

    calls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: calls.length,
      calls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};