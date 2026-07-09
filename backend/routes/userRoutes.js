import express from "express";
import {
  getAllUsers,
  createCaller,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// =======================================
// Admin Routes
// =======================================

// Get All Users
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);

// Create Caller
router.post(
  "/create-caller",
  protect,
  authorize("admin"),
  createCaller
);

// Update User
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateUser
);
// Delete User
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);
export default router;