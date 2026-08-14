import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["meta", "whatsapp", "email"],
      unique: true,
      required: true,
    },

    appId: {
      type: String,
      default: "",
    },

    pageAccessToken: {
      type: String,
      default: "",
    },

    // WhatsApp Business API (Meta Cloud API)
    phoneNumberId: {
      type: String,
      default: "",
    },

    // Email (IMAP/SMTP)
    emailAddress: {
      type: String,
      default: "",
    },

    emailAppPassword: {
      type: String,
      default: "",
    },

    imapHost: {
      type: String,
      default: "",
    },

    smtpHost: {
      type: String,
      default: "",
    },

    connected: {
      type: Boolean,
      default: false,
    },

    connectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Integration = mongoose.model("Integration", integrationSchema);

export default Integration;
