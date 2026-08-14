import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Contract", "Invoice", "Proposal", "ID Proof", "Other"],
      default: "Other",
    },

    fileName: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    relatedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    relatedDeal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
