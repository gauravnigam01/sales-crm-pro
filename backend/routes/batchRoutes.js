import express from "express";

import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} from "../controllers/batchController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "manager"));

router.get("/", getAllBatches);
router.post("/", createBatch);
router.get("/:id", getBatchById);
router.put("/:id", updateBatch);
router.delete("/:id", deleteBatch);

export default router;
