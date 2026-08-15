import { useState } from "react";
import { toast } from "react-toastify";

import { deleteBatch } from "../services/batchService";

import EditBatchModal from "./EditBatchModal";
import ConfirmDialog from "./ConfirmDialog";

function BatchTable({ batches, refreshBatches }) {
  const [editBatch, setEditBatch] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    try {
      await deleteBatch(deleteTarget._id);
      toast.success("Batch Deleted Successfully");
      refreshBatches();
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
            <th>Batch Name</th>
            <th>Course</th>
            <th>Trainer</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Class Timing</th>
            <th>Total Seats</th>
            <th>Enrolled</th>
            <th>Available Seats</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan="11" className="no-data">
                No Batches Found
              </td>
            </tr>
          ) : (
            batches.map((batch) => (
              <tr key={batch._id}>
                <td>
                  <strong>{batch.batchName}</strong>
                </td>
                <td>{batch.course?.courseName || "-"}</td>
                <td>{batch.trainer || "-"}</td>
                <td>
                  {batch.startDate
                    ? new Date(batch.startDate).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>
                  {batch.endDate
                    ? new Date(batch.endDate).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>{batch.classTiming || "-"}</td>
                <td>{batch.totalSeats ?? 0}</td>
                <td>{batch.enrolledStudents ?? 0}</td>
                <td>{batch.availableSeats ?? batch.totalSeats ?? 0}</td>
                <td>
                  <span className={`status ${batch.status?.toLowerCase()}`}>
                    {batch.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => setEditBatch(batch)}>
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => setDeleteTarget(batch)}
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

      <EditBatchModal
        batch={editBatch}
        onClose={() => setEditBatch(null)}
        onSuccess={refreshBatches}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Batch"
        message={`Are you sure you want to delete "${deleteTarget?.batchName}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default BatchTable;
