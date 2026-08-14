import express from "express";

import {
  getStatus,
  connect,
  sendMessage,
  getConversations,
  getMessagesByPhone,
  disconnect,
} from "../controllers/whatsappController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", protect, getStatus);
router.post("/connect", protect, authorize("admin"), connect);
router.post("/send", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/messages/:phone", protect, getMessagesByPhone);
router.post("/disconnect", protect, authorize("admin"), disconnect);

export default router;
