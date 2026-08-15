import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { updateBatch } from "../services/batchService";

const toDateInput = (value) => (value ? value.substring(0, 10) : "");

function EditBatchModal({ batch, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    batchName: "",
    trainer: "",
    startDate: "",
    endDate: "",
    classTiming: "",
    totalSeats: "",
    status: "Upcoming",
  });

  useEffect(() => {
    (async () => {
      if (batch) {
        setFormData({
          batchName: batch.batchName || "",
          trainer: batch.trainer || "",
          startDate: toDateInput(batch.startDate),
          endDate: toDateInput(batch.endDate),
          classTiming: batch.classTiming || "",
          totalSeats: batch.totalSeats ?? "",
          status: batch.status || "Upcoming",
        });
      }
    })();
  }, [batch]);

  if (!batch) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateBatch(batch._id, {
        ...formData,
        totalSeats: Number(formData.totalSeats) || 0,
      });

      toast.success("Batch Updated Successfully");
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
        <h2>Edit Batch</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="batchName"
            placeholder="Batch Name"
            value={formData.batchName}
            onChange={handleChange}
            required
          />

          <input type="text" value={batch.course?.courseName || "-"} disabled />

          <input
            type="text"
            name="trainer"
            placeholder="Trainer"
            value={formData.trainer}
            onChange={handleChange}
          />

          <input
            type="text"
            name="classTiming"
            placeholder="Class Timing"
            value={formData.classTiming}
            onChange={handleChange}
          />

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />

          <input
            type="number"
            name="totalSeats"
            placeholder="Total Seats"
            value={formData.totalSeats}
            onChange={handleChange}
            min="0"
          />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Upcoming</option>
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Update Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBatchModal;
