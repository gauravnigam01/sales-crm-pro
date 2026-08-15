import { useState } from "react";
import { toast } from "react-toastify";

import { deleteCourse } from "../services/courseService";

import ViewCourseModal from "./ViewCourseModal";
import EditCourseModal from "./EditCourseModal";
import ConfirmDialog from "./ConfirmDialog";

function CourseTable({ courses, refreshCourses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = (course) => {
    setDeleteTarget(course);
  };

  const confirmDelete = async () => {
    try {
      await deleteCourse(deleteTarget._id);
      toast.success("Course Deleted Successfully");
      refreshCourses();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete Failed");
    }

    setDeleteTarget(null);
  };

  return (
    <div className="course-table-container">
      <table className="course-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Category</th>
            <th>Duration</th>
            <th>Mode</th>
            <th>Trainer</th>
            <th>Course Fee</th>
            <th>Discount</th>
            <th>Final Fee</th>
            <th>Enrolled</th>
            <th>Available Seats</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td colSpan="12" className="no-data">
                No Courses Found
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course._id}>
                <td>
                  <strong>{course.courseName}</strong>
                </td>
                <td>{course.category || "-"}</td>
                <td>{course.duration || "-"}</td>
                <td>
                  <span className={`mode-badge ${course.mode?.toLowerCase()}`}>
                    {course.mode}
                  </span>
                </td>
                <td>{course.trainer || "-"}</td>
                <td>₹{(course.courseFee || 0).toLocaleString("en-IN")}</td>
                <td>₹{(course.discount || 0).toLocaleString("en-IN")}</td>
                <td>₹{(course.finalFee || 0).toLocaleString("en-IN")}</td>
                <td>{course.enrolledStudents ?? 0}</td>
                <td>{course.availableSeats ?? course.totalSeats ?? 0}</td>
                <td>
                  <span
                    className={`status ${course.status?.toLowerCase()}`}
                  >
                    {course.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => setSelectedCourse(course)}
                    >
                      View
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => setEditCourse(course)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(course)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ViewCourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />

      <EditCourseModal
        course={editCourse}
        onClose={() => setEditCourse(null)}
        onSuccess={refreshCourses}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.courseName}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CourseTable;
