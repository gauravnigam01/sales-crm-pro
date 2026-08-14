import express from "express";

import {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==============================
// Notification Routes
// ==============================

// Get All Notifications
router.get("/", protect, getNotifications);

// Create Notification (admin-only — real notifications come from server-side business logic)
router.post("/", protect, authorize("admin"), createNotification);

// Mark As Read
router.put("/:id/read", protect, markAsRead);

// Delete Notification
router.delete("/:id", protect, deleteNotification);

export default router;