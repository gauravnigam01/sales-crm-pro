import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// ======================================
// Attach enrolledStudents / availableSeats (derived from Enrollment records,
// not stored on the course itself, so they can never drift out of sync)
// ======================================

const withSeatStats = async (courses) => {
  const isArray = Array.isArray(courses);
  const list = isArray ? courses : [courses];

  if (list.length === 0) return isArray ? [] : null;

  const counts = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: list.map((c) => c._id) },
        enrollmentStatus: { $ne: "Cancelled" },
      },
    },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  const result = list.map((c) => {
    const obj = c.toObject ? c.toObject() : c;
    const enrolledStudents = countMap[c._id.toString()] || 0;

    return {
      ...obj,
      enrolledStudents,
      availableSeats: Math.max((obj.totalSeats || 0) - enrolledStudents, 0),
    };
  });

  return isArray ? result : result[0];
};

// ======================================
// Create Course
// ======================================

export const createCourse = async (req, res) => {
  try {
    const courseFee = Number(req.body.courseFee) || 0;
    const discount = Number(req.body.discount) || 0;

    const course = await Course.create({
      ...req.body,
      courseFee,
      discount,
      finalFee: Math.max(courseFee - discount, 0),
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Course Created Successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Courses
// ======================================

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    const withStats = await withSeatStats(courses);

    res.status(200).json({
      success: true,
      count: withStats.length,
      courses: withStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Course
// ======================================

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course Not Found",
      });
    }

    const withStats = await withSeatStats(course);

    res.status(200).json({
      success: true,
      course: withStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Course
// ======================================

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course Not Found",
      });
    }

    const editableFields = [
      "courseName",
      "category",
      "description",
      "duration",
      "mode",
      "trainer",
      "courseFee",
      "discount",
      "installmentAvailable",
      "installmentAmount",
      "startDate",
      "endDate",
      "totalSeats",
      "status",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    course.finalFee = Math.max(
      (Number(course.courseFee) || 0) - (Number(course.discount) || 0),
      0
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course Updated Successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Course
// ======================================

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course Not Found",
      });
    }

    const activeEnrollments = await Enrollment.countDocuments({
      course: course._id,
      enrollmentStatus: { $ne: "Cancelled" },
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a course with active enrollments. Cancel or move those enrollments first.",
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
