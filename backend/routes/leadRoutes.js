import express from "express";
import { createLead } from "../controllers/leadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected Route
router.post("/", protect, createLead);

export default router;