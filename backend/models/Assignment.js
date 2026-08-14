import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    lastAssignedCaller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;