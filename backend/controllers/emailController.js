import EmailMessage from "../models/EmailMessage.js";
import Lead from "../models/Lead.js";
import {
  getEmailStatus,
  connectEmail,
  sendEmailMessage,
  disconnectEmail,
} from "../services/emailService.js";

// ======================================
// Get Connection Status
// ======================================

export const getStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      ...getEmailStatus(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Connect (tests IMAP + SMTP, then persists)
// ======================================

export const connect = async (req, res) => {
  try {
    const { emailAddress, imapHost, smtpHost, appPassword } = req.body;

    if (!emailAddress || !imapHost || !smtpHost || !appPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, IMAP Host, SMTP Host and App Password are Required",
      });
    }

    const result = await connectEmail({
      emailAddress,
      imapHost,
      smtpHost,
      appPassword,
    });

    res.status(200).json({
      success: true,
      message: "Email Connected Successfully",
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Send Email
// ======================================

export const sendMessage = async (req, res) => {
  try {
    const { to, subject, text, relatedLeadId } = req.body;

    if (!to || !text) {
      return res.status(400).json({
        success: false,
        message: "Recipient and Message are Required",
      });
    }

    if (req.user.role === "caller") {
      const lead = relatedLeadId
        ? await Lead.findById(relatedLeadId)
        : await Lead.findOne({ email: to.toLowerCase() });

      if (!lead || lead.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only email leads assigned to you",
        });
      }
    }

    const saved = await sendEmailMessage(
      to,
      subject || "(No Subject)",
      text,
      req.user?._id,
      relatedLeadId
    );

    res.status(201).json({
      success: true,
      message: "Email Sent Successfully",
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
// Get Conversations (grouped by contact email)
// ======================================

export const getConversations = async (req, res) => {
  try {
    const conversations = await EmailMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$contactEmail",
          lastSubject: { $first: "$subject" },
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

    await EmailMessage.populate(conversations, {
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
// Get Messages For a Contact Email
// ======================================

export const getMessagesByContact = async (req, res) => {
  try {
    const { email } = req.params;

    const contactEmail = email.toLowerCase();

    const messages = await EmailMessage.find({ contactEmail }).sort({
      createdAt: 1,
    });

    await EmailMessage.updateMany(
      { contactEmail, direction: "inbound" },
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
// Disconnect
// ======================================

export const disconnect = async (req, res) => {
  try {
    await disconnectEmail();

    res.status(200).json({
      success: true,
      message: "Email Disconnected Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
