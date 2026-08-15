import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    enrollmentDate: {
      type: Date,
      default: Date.now,
    },

    totalFee: {
      type: Number,
      required: true,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    enrollmentStatus: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },

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

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
