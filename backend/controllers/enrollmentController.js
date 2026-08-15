import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// ======================================
// Attach pendingAmount / paymentStatus (derived, never stored, so it can
// never drift from the actual paidAmount)
// ======================================

const withComputed = (enrollment) => {
  const obj = enrollment.toObject ? enrollment.toObject() : enrollment;

  const pendingAmount = Math.max(
    (obj.totalFee || 0) - (obj.paidAmount || 0),
    0
  );

  const paymentStatus =
    pendingAmount <= 0 ? "Paid" : obj.paidAmount > 0 ? "Partial" : "Pending";

  return { ...obj, pendingAmount, paymentStatus };
};

// ======================================
// Create Enrollment
// ======================================

export const createEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.body.course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course Not Found",
      });
    }

    const enrollment = await Enrollment.create({
      ...req.body,
      totalFee:
        req.body.totalFee !== undefined && req.body.totalFee !== ""
          ? Number(req.body.totalFee)
          : course.finalFee,
      paidAmount: Number(req.body.paidAmount) || 0,
      createdBy: req.user?._id || null,
    });

    await enrollment.populate([
      { path: "course", select: "courseName" },
      { path: "batch", select: "batchName" },
    ]);

    res.status(201).json({
      success: true,
      message: "Enrollment Created Successfully",
      enrollment: withComputed(enrollment),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Enrollments
// ======================================

export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("course", "courseName")
      .populate("batch", "batchName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments: enrollments.map(withComputed),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Enrollment
// ======================================

export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("course", "courseName")
      .populate("batch", "batchName");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment Not Found",
      });
    }

    res.status(200).json({
      success: true,
      enrollment: withComputed(enrollment),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Enrollment
// ======================================

export const updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("course", "courseName")
      .populate("batch", "batchName");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment Updated Successfully",
      enrollment: withComputed(enrollment),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Enrollment
// ======================================

export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment Not Found",
      });
    }

    await Enrollment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Enrollment Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
