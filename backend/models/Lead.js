import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      enum: [
        "Meta Ads",
        "Google Ads",
        "Website",
        "WhatsApp",
        "Referral",
        "Manual",
      ],
      default: "Manual",
    },

    metaLeadgenId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "New",
        "Assigned",
        "Contacted",
        "Interested",
        "Follow Up",
        "Qualified",
        "Closed Won",
        "Closed Lost",
      ],
      default: "New",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    temperature: {
      type: String,
      enum: ["Cold", "Warm", "Hot"],
      default: "Warm",
    },

    leadValue: {
      type: Number,
      default: 0,
    },

    region: {
      type: String,
      enum: ["North", "South", "East", "West", "Central", "Not Specified"],
      default: "Not Specified",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    followUpDate: {
      type: Date,
    },

    nextCallDate: {
      type: Date,
    },
timeline: [
  {
    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],
   
    notes: [
      {
        text: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    whatsappSent: {
      type: Boolean,
      default: false,
    },

    notificationSent: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ phone: 1 });
leadSchema.index({ assignedTo: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;