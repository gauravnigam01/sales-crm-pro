import express from "express";

import {
  getTeamPerformance,
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/teamController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Team/Teams is manager+admin territory only — hard-blocked for callers
// regardless of any permission toggle.
router.use(protect, authorize("admin", "manager"));

router.get(
  "/performance",
  requirePermission("viewReports"),
  getTeamPerformance
);

// Sales Teams (groups)
router.get("/groups", requirePermission("viewReports"), getAllTeams);
router.get(
  "/groups/:id",
  requirePermission("viewReports"),
  getTeamById
);
router.post("/groups", protect, authorize("admin"), createTeam);
router.put("/groups/:id", protect, authorize("admin"), updateTeam);
router.delete("/groups/:id", protect, authorize("admin"), deleteTeam);

export default router;
