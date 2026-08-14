import express from "express";

import {
  getMetaIntegration,
  saveMetaIntegration,
  getWhatsappIntegration,
  saveWhatsappIntegration,
  getEmailIntegration,
  saveEmailIntegration,
} from "../controllers/integrationController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Integration Routes (Admin Only)
// ======================================

router.get("/meta", protect, authorize("admin"), getMetaIntegration);
router.put("/meta", protect, authorize("admin"), saveMetaIntegration);

router.get("/whatsapp", protect, authorize("admin"), getWhatsappIntegration);
router.put("/whatsapp", protect, authorize("admin"), saveWhatsappIntegration);

router.get("/email", protect, authorize("admin"), getEmailIntegration);
router.put("/email", protect, authorize("admin"), saveEmailIntegration);

export default router;
