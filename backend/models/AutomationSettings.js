import mongoose from "mongoose";

const automationSettingsSchema = new mongoose.Schema(
  {
    roundRobinEnabled: {
      type: Boolean,
      default: true,
    },

    roundRobinTriggerCount: {
      type: Number,
      default: 0,
    },

    inactivityDays: {
      type: Number,
      default: 3,
    },

    sourceRules: [
      {
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
          required: true,
        },

        assignTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        active: {
          type: Boolean,
          default: true,
        },

        triggerCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    triggerRules: [
      {
        name: {
          type: String,
          required: true,
        },

        trigger: {
          type: String,
          enum: ["newLead", "hotLead"],
          required: true,
        },

        action: {
          type: String,
          enum: ["whatsapp", "managerAlert"],
          required: true,
        },

        messageTemplate: {
          type: String,
          default: "",
        },

        active: {
          type: Boolean,
          default: true,
        },

        triggerCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AutomationSettings = mongoose.model(
  "AutomationSettings",
  automationSettingsSchema
);

export default AutomationSettings;
