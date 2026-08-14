import mongoose from "mongoose";

const whatsappMessageSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },

    body: {
      type: String,
      default: "",
    },

    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed", "received"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

whatsappMessageSchema.index({ phone: 1, createdAt: 1 });

const WhatsAppMessage = mongoose.model(
  "WhatsAppMessage",
  whatsappMessageSchema
);

export default WhatsAppMessage;
