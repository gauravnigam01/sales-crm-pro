import express from "express";
import {
  getAllUsers,
  createCaller,
} from "../controllers/userController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// Admin Routes
// ===============================

// Get All Users
router.get("/", protect, authorize("admin"), getAllUsers);

// Create Caller
router.post(
  "/create-caller",
  protect,
  authorize("admin"),
  createCaller
);

export default router;