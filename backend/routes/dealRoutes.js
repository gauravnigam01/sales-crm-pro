import express from "express";

import {
  createDeal,
  getAllDeals,
  getDealById,
  updateDeal,
  deleteDeal,
  addDealNote,
  changeDealStage,
} from "../controllers/dealController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Deals/Pipeline is manager+admin territory only — hard-blocked for
// callers regardless of any permission toggle (spec: caller must never
// see Deals/Pipeline at all).
router.use(protect, authorize("admin", "manager"));

// ===============================
// Get All Deals
// ===============================

router.get("/", requirePermission("viewDeals"), getAllDeals);

// ===============================
// Get Single Deal
// ===============================

router.get("/:id", requirePermission("viewDeals"), getDealById);

// ===============================
// Create Deal
// ===============================

router.post("/", requirePermission("createDeal"), createDeal);

// ===============================
// Update Deal
// ===============================

router.put("/:id", requirePermission("editDeal"), updateDeal);

// ===============================
// Delete Deal
// ===============================

router.delete("/:id", requirePermission("deleteDeal"), deleteDeal);

// ===============================
// Add Deal Note
// ===============================

router.post("/:id/note", requirePermission("editDeal"), addDealNote);

// ===============================
// Change Deal Stage
// ===============================

router.put("/:id/stage", requirePermission("editDeal"), changeDealStage);

export default router;
