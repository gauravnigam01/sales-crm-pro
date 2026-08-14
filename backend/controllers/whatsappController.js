import WhatsAppMessage from "../models/WhatsAppMessage.js";
import Lead from "../models/Lead.js";
import {
  getWhatsAppStatus,
  initWhatsApp,
  sendWhatsAppMessage,
  logoutWhatsApp,
} from "../services/whatsappService.js";

// ======================================
// Get Connection Status
// ======================================

export const getStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      ...getWhatsAppStatus(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Start Connection (generates QR if not linked)
// ======================================

export const connect = async (req, res) => {
  try {
    await initWhatsApp();

    res.status(200).json({
      success: true,
      message: "WhatsApp Connection Initiated",
      ...getWhatsAppStatus(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Send Message
// ======================================

export const sendMessage = async (req, res) => {
  try {
    const { phone, text, relatedLeadId } = req.body;

    if (!phone || !text) {
      return res.status(400).json({
        success: false,
        message: "Phone and Text are Required",
      });
    }

    if (req.user.role === "caller") {
      const last10 = phone.replace(/\D/g, "").slice(-10);

      const lead = relatedLeadId
        ? await Lead.findById(relatedLeadId)
        : await Lead.findOne({ phone: { $regex: last10 } });

      if (!lead || lead.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only WhatsApp leads assigned to you",
        });
      }
    }

    const saved = await sendWhatsAppMessage(
      phone,
      text,
      req.user?._id,
      relatedLeadId
    );

    res.status(201).json({
      success: true,
      message: "Message Sent Successfully",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Conversations (grouped by phone)
// ======================================

export const getConversations = async (req, res) => {
  try {
    const conversations = await WhatsAppMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$phone",
          lastMessage: { $first: "$body" },
          lastDirection: { $first: "$direction" },
          lastAt: { $first: "$createdAt" },
          relatedLead: { $first: "$relatedLead" },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$direction", "inbound"] },
                    { $ne: ["$status", "read"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    await WhatsAppMessage.populate(conversations, {
      path: "relatedLead",
      select: "customerName",
    });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Messages For a Phone Number
// ======================================

export const getMessagesByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const messages = await WhatsAppMessage.find({
      phone: { $regex: phone.slice(-10) },
    }).sort({ createdAt: 1 });

    await WhatsAppMessage.updateMany(
      { phone: { $regex: phone.slice(-10) }, direction: "inbound" },
      { status: "read" }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Logout / Disconnect
// ======================================

export const disconnect = async (req, res) => {
  try {
    await logoutWhatsApp();

    res.status(200).json({
      success: true,
      message: "WhatsApp Disconnected Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
