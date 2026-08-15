import express from "express";

import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Courses is manager+admin territory (business/revenue operations),
// consistent with how Deals/Pipeline are gated in this app.
router.use(protect, authorize("admin", "manager"));

router.get("/", getAllCourses);
router.post("/", createCourse);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
