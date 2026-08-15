import { useState } from "react";
import { toast } from "react-toastify";

import { deleteEnrollment } from "../services/enrollmentService";

import EditEnrollmentModal from "./EditEnrollmentModal";
import ConfirmDialog from "./ConfirmDialog";

function EnrollmentTable({ enrollments, refreshEnrollments }) {
  const [editEnrollment, setEditEnrollment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    try {
      await deleteEnrollment(deleteTarget._id);
      toast.success("Enrollment Deleted Successfully");
      refreshEnrollments();
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
            <th>Student Name</th>
            <th>Course</th>
            <th>Enrollment Date</th>
            <th>Batch</th>
            <th>Total Fee</th>
            <th>Paid Amount</th>
            <th>Pending Amount</th>
            <th>Payment Status</th>
            <th>Enrollment Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {enrollments.length === 0 ? (
            <tr>
              <td colSpan="10" className="no-data">
                No Enrollments Found
              </td>
            </tr>
          ) : (
            enrollments.map((enrollment) => (
              <tr key={enrollment._id}>
                <td>
                  <strong>{enrollment.studentName}</strong>
                </td>
                <td>{enrollment.course?.courseName || "-"}</td>
                <td>
                  {enrollment.enrollmentDate
                    ? new Date(enrollment.enrollmentDate).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>{enrollment.batch?.batchName || "-"}</td>
                <td>₹{(enrollment.totalFee || 0).toLocaleString("en-IN")}</td>
                <td>₹{(enrollment.paidAmount || 0).toLocaleString("en-IN")}</td>
                <td>₹{(enrollment.pendingAmount || 0).toLocaleString("en-IN")}</td>
                <td>
                  <span
                    className={`status ${enrollment.paymentStatus?.toLowerCase()}`}
                  >
                    {enrollment.paymentStatus}
                  </span>
                </td>
                <td>
                  <span
                    className={`status ${enrollment.enrollmentStatus?.toLowerCase()}`}
                  >
                    {enrollment.enrollmentStatus}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => setEditEnrollment(enrollment)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => setDeleteTarget(enrollment)}
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

      <EditEnrollmentModal
        enrollment={editEnrollment}
        onClose={() => setEditEnrollment(null)}
        onSuccess={refreshEnrollments}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Enrollment"
        message={`Are you sure you want to delete the enrollment for "${deleteTarget?.studentName}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default EnrollmentTable;
