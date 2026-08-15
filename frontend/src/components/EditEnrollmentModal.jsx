import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { updateEnrollment } from "../services/enrollmentService";
import { getAllBatches } from "../services/batchService";

function EditEnrollmentModal({ enrollment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    studentName: "",
    batch: "",
    totalFee: "",
    paidAmount: "",
    enrollmentStatus: "Active",
  });

  const [batches, setBatches] = useState([]);

  useEffect(() => {
    (async () => {
      if (!enrollment) return;

      setFormData({
        studentName: enrollment.studentName || "",
        batch: enrollment.batch?._id || "",
        totalFee: enrollment.totalFee ?? "",
        paidAmount: enrollment.paidAmount ?? "",
        enrollmentStatus: enrollment.enrollmentStatus || "Active",
      });

      try {
        const res = await getAllBatches();
        setBatches(
          (res.batches || []).filter(
            (b) => b.course?._id === enrollment.course?._id
          )
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [enrollment]);

  if (!enrollment) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateEnrollment(enrollment._id, {
        ...formData,
        batch: formData.batch || null,
        totalFee: Number(formData.totalFee) || 0,
        paidAmount: Number(formData.paidAmount) || 0,
      });

      toast.success("Enrollment Updated Successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Enrollment</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={formData.studentName}
            onChange={handleChange}
            required
          />

          <input type="text" value={enrollment.course?.courseName || "-"} disabled />

          <select name="batch" value={formData.batch} onChange={handleChange}>
            <option value="">No Batch</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="totalFee"
            placeholder="Total Fee"
            value={formData.totalFee}
            onChange={handleChange}
            min="0"
            required
          />

          <input
            type="number"
            name="paidAmount"
            placeholder="Paid Amount"
            value={formData.paidAmount}
            onChange={handleChange}
            min="0"
          />

          <select
            name="enrollmentStatus"
            value={formData.enrollmentStatus}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Update Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEnrollmentModal;
