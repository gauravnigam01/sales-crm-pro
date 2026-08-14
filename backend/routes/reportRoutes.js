import express from "express";

import {
  getSalesReport,
  getLeadReport,
  getAgentReport,
  getTaskReport,
} from "../controllers/reportController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ======================================
// Report Routes — manager+admin only, hard-blocked for callers
// regardless of any permission toggle (spec: caller must never see
// Reports/Analytics/Finance).
// ======================================

router.use(protect, authorize("admin", "manager"));

router.get("/sales", requirePermission("viewReports"), getSalesReport);

router.get("/leads", requirePermission("viewReports"), getLeadReport);

router.get("/agents", requirePermission("viewReports"), getAgentReport);

router.get("/tasks", requirePermission("viewReports"), getTaskReport);

export default router;
