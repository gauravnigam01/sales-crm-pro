import express from "express";

import {
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/calendarController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ======================================
// Calendar Routes
// ======================================

// Get All Events
router.get("/", protect, requirePermission("viewCalendar"), getAllEvents);

// Get Upcoming Events
router.get(
  "/upcoming",
  protect,
  requirePermission("viewCalendar"),
  getUpcomingEvents
);

// Get Single Event
router.get("/:id", protect, requirePermission("viewCalendar"), getEventById);

// Create Event
router.post("/", protect, requirePermission("manageCalendar"), createEvent);

// Update Event
router.put("/:id", protect, requirePermission("manageCalendar"), updateEvent);

// Delete Event
router.delete("/:id", protect, requirePermission("manageCalendar"), deleteEvent);

export default router;
