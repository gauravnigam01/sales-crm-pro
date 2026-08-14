import express from "express";

import {
  getDashboardStats,
  getRecentLeads,
  getRecentActivity,
} from "../controllers/dashboardController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard Stats — every role can see their own dashboard; the
// controller itself scopes callers down to their own assigned data.
router.get("/stats", protect, getDashboardStats);

// Recent Leads
router.get("/recent-leads", protect, getRecentLeads);

// Recent Activity
router.get("/recent-activity", protect, getRecentActivity);

export default router;