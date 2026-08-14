import mongoose from "mongoose";

const emailMessageSchema = new mongoose.Schema(
  {
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },

    subject: {
      type: String,
      default: "",
    },

    body: {
      type: String,
      default: "",
    },

    messageId: {
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
      enum: ["sent", "failed", "received"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

emailMessageSchema.index({ contactEmail: 1, createdAt: 1 });
emailMessageSchema.index({ messageId: 1 });

const EmailMessage = mongoose.model("EmailMessage", emailMessageSchema);

export default EmailMessage;
