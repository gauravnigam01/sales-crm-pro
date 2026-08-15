import Batch from "../models/Batch.js";
import Enrollment from "../models/Enrollment.js";

// ======================================
// Attach enrolledStudents / availableSeats (derived from Enrollment records)
// ======================================

const withSeatStats = async (batches) => {
  const isArray = Array.isArray(batches);
  const list = isArray ? batches : [batches];

  if (list.length === 0) return isArray ? [] : null;

  const counts = await Enrollment.aggregate([
    {
      $match: {
        batch: { $in: list.map((b) => b._id) },
        enrollmentStatus: { $ne: "Cancelled" },
      },
    },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id?.toString()] = c.count;
  });

  const result = list.map((b) => {
    const obj = b.toObject ? b.toObject() : b;
    const enrolledStudents = countMap[b._id.toString()] || 0;

    return {
      ...obj,
      enrolledStudents,
      availableSeats: Math.max((obj.totalSeats || 0) - enrolledStudents, 0),
    };
  });

  return isArray ? result : result[0];
};

// ======================================
// Create Batch
// ======================================

export const createBatch = async (req, res) => {
  try {
    const batch = await Batch.create({
      ...req.body,
      createdBy: req.user?._id || null,
    });

    await batch.populate("course", "courseName");

    res.status(201).json({
      success: true,
      message: "Batch Created Successfully",
      batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Batches
// ======================================

export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("course", "courseName")
      .sort({ createdAt: -1 });

    const withStats = await withSeatStats(batches);

    res.status(200).json({
      success: true,
      count: withStats.length,
      batches: withStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Batch
// ======================================

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      "course",
      "courseName"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch Not Found",
      });
    }

    const withStats = await withSeatStats(batch);

    res.status(200).json({
      success: true,
      batch: withStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Batch
// ======================================

export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("course", "courseName");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch Updated Successfully",
      batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Batch
// ======================================

export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch Not Found",
      });
    }

    const activeEnrollments = await Enrollment.countDocuments({
      batch: batch._id,
      enrollmentStatus: { $ne: "Cancelled" },
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a batch with active enrollments. Cancel or move those enrollments first.",
      });
    }

    await Batch.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Batch Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
