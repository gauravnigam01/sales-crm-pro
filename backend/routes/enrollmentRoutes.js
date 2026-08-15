import express from "express";

import {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollmentController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "manager"));

router.get("/", getAllEnrollments);
router.post("/", createEnrollment);
router.get("/:id", getEnrollmentById);
router.put("/:id", updateEnrollment);
router.delete("/:id", deleteEnrollment);

export default router;
