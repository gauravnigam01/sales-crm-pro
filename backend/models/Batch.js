import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    trainer: {
      type: String,
      default: "",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    classTiming: {
      type: String,
      default: "",
    },

    totalSeats: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
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

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
