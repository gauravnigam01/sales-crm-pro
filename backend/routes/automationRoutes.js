import express from "express";
import {
  getSettings,
  getStats,
  toggleRoundRobin,
  updateInactivityDays,
  addSourceRule,
  toggleSourceRule,
  deleteSourceRule,
  addTriggerRule,
  toggleTriggerRule,
  deleteTriggerRule,
  getInactiveLeads,
} from "../controllers/automationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/settings", protect, authorize("admin"), getSettings);
router.get("/stats", protect, authorize("admin"), getStats);
router.put(
  "/settings/round-robin",
  protect,
  authorize("admin"),
  toggleRoundRobin
);
router.put(
  "/settings/inactivity-days",
  protect,
  authorize("admin"),
  updateInactivityDays
);

router.post("/rules", protect, authorize("admin"), addSourceRule);
router.put("/rules/:ruleId/toggle", protect, authorize("admin"), toggleSourceRule);
router.delete("/rules/:ruleId", protect, authorize("admin"), deleteSourceRule);

router.post("/triggers", protect, authorize("admin"), addTriggerRule);
router.put(
  "/triggers/:ruleId/toggle",
  protect,
  authorize("admin"),
  toggleTriggerRule
);
router.delete(
  "/triggers/:ruleId",
  protect,
  authorize("admin"),
  deleteTriggerRule
);

router.get("/inactive-leads", protect, authorize("admin"), getInactiveLeads);

export default router;
