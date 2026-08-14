import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
      ],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
      ],
      default: "Pending",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Task",
  taskSchema
);