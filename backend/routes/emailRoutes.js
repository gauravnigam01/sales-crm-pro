import express from "express";

import {
  getStatus,
  connect,
  sendMessage,
  getConversations,
  getMessagesByContact,
  disconnect,
} from "../controllers/emailController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", protect, getStatus);
router.post("/connect", protect, authorize("admin"), connect);
router.post("/send", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/messages/:email", protect, getMessagesByContact);
router.post("/disconnect", protect, authorize("admin"), disconnect);

export default router;
