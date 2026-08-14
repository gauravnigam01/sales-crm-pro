import express from "express";

import {
  uploadDocument,
  getAllDocuments,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ======================================
// Document Routes
// ======================================

// Get All Documents
router.get("/", protect, requirePermission("viewDocuments"), getAllDocuments);

// Upload Document
router.post(
  "/",
  protect,
  requirePermission("uploadDocument"),
  upload.single("file"),
  uploadDocument
);

// Download Document
router.get(
  "/:id/download",
  protect,
  requirePermission("viewDocuments"),
  downloadDocument
);

// Delete Document
router.delete("/:id", protect, requirePermission("deleteDocument"), deleteDocument);

export default router;
