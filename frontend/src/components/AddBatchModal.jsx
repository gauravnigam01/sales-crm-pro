import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createBatch } from "../services/batchService";
import { getAllCourses } from "../services/courseService";

const emptyForm = {
  batchName: "",
  course: "",
  trainer: "",
  startDate: "",
  endDate: "",
  classTiming: "",
  totalSeats: "",
  status: "Upcoming",
};

function AddBatchModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(emptyForm);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!open) return;

      setFormData(emptyForm);

      try {
        const res = await getAllCourses();
        setCourses(res.courses || []);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "course") {
      const selected = courses.find((c) => c._id === value);
      setFormData({
        ...formData,
        course: value,
        trainer: formData.trainer || selected?.trainer || "",
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course) {
      toast.error("Please select a course");
      return;
    }

    setSaving(true);

    try {
      await createBatch({
        ...formData,
        totalSeats: Number(formData.totalSeats) || 0,
      });

      toast.success("Batch Created Successfully");
      onSuccess();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Create Batch");
    }

    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Batch</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="batchName"
            placeholder="Batch Name"
            value={formData.batchName}
            onChange={handleChange}
            required
          />

          <select name="course" value={formData.course} onChange={handleChange} required>
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseName}
              </option>
            ))}
          </select>

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
            placeholder="Class Timing (e.g. 6-8 PM)"
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

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBatchModal;
