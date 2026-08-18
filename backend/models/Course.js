import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    syllabus: {
      type: [String],
      default: [],
    },

    prerequisites: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },

    trainer: {
      type: String,
      default: "",
    },

    courseFee: {
      type: Number,
      required: true,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    finalFee: {
      type: Number,
      default: 0,
    },

    installmentAvailable: {
      type: Boolean,
      default: false,
    },

    installmentAmount: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    totalSeats: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Upcoming", "Completed", "Inactive"],
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

const Course = mongoose.model("Course", courseSchema);

export default Course;
