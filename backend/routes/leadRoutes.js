import express from "express";
import {
  createLead,
  importLeads,
  getMyLeads,
  getAllLeads,
  getLeadById,
  logLeadActivity,
  updateLeadStatus,
  addLeadNote,
  setFollowUp,
  updateLead,
  deleteLead,
  getFollowUps,
  getCallLogs,
} from "../controllers/leadController.js";
import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// My Leads
router.get(
  "/my-leads",
  protect,
  authorize("caller"),
  getMyLeads
);
// Follow-Ups (must be registered before /:id)
router.get(
  "/follow-ups",
  protect,
  requirePermission("viewLeads"),
  getFollowUps
);

// Call Logs (must be registered before /:id)
router.get(
  "/call-logs",
  protect,
  requirePermission("viewLeads"),
  getCallLogs
);

// Get All Leads
router.get(
  "/",
  protect,
  requirePermission("viewLeads"),
  getAllLeads
);
// Create Lead
router.post(
  "/",
  protect,
  requirePermission("createLead"),
  createLead
);

// Import Leads (Bulk / CSV) — bulk import is a manager/admin action, not
// something a caller should be able to trigger even if createLead is on.
router.post(
  "/import",
  protect,
  authorize("admin", "manager"),
  requirePermission("createLead"),
  importLeads
);

// Get Single Lead
router.get(
  "/:id",
  protect,
  requirePermission("viewLeads"),
  getLeadById
);

// Log Quick Activity
router.post(
  "/:id/activity",
  protect,
  logLeadActivity
);

// Update Lead Status (ownership/team check happens in the controller so
// admin, manager and caller can all reach this for leads they can access)
router.put(
  "/:id/status",
  protect,
  updateLeadStatus
);
router.put(
  "/:id",
  protect,
  requirePermission("editLead"),
  updateLead
);
// Add Note
router.post(
  "/:id/note",
  protect,
  addLeadNote
);

// Set Follow-up
router.put(
  "/:id/followup",
  protect,
  setFollowUp
);

router.delete(
  "/:id",
  protect,
  requirePermission("deleteLead"),
  deleteLead
);
export default router;
