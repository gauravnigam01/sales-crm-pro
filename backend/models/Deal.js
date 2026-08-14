import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(

  {

    title: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    stage: {
      type: String,
      enum: [
        "New",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost",
      ],
      default: "New",
    },

    probability: {
      type: Number,
      default: 10,
    },

    expectedClosingDate: {
      type: Date,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

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

    timeline: [
      {
        action: String,

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

  },

  {

    timestamps: true,

  }

);

export default mongoose.model(
  "Deal",
  dealSchema
);