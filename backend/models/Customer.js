import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
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

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "India",
    },

    customerType: {
      type: String,
      enum: [
        "Regular",
        "Premium",
        "VIP",
      ],
      default: "Regular",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
      ],
      default: "Active",
    },

    revenue: {
      type: Number,
      default: 0,
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

const Customer = mongoose.model(
  "Customer",
  customerSchema
);

export default Customer;