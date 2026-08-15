import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createEnrollment } from "../services/enrollmentService";
import { getAllCourses } from "../services/courseService";
import { getAllBatches } from "../services/batchService";

const emptyForm = {
  studentName: "",
  course: "",
  batch: "",
  enrollmentDate: new Date().toISOString().substring(0, 10),
  totalFee: "",
  paidAmount: "",
  enrollmentStatus: "Active",
};

function AddEnrollmentModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(emptyForm);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!open) return;

      setFormData(emptyForm);

      try {
        const [courseRes, batchRes] = await Promise.all([
          getAllCourses(),
          getAllBatches(),
        ]);
        setCourses(courseRes.courses || []);
        setBatches(batchRes.batches || []);
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
        totalFee: selected ? selected.finalFee : formData.totalFee,
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
      await createEnrollment({
        ...formData,
        batch: formData.batch || null,
        totalFee: Number(formData.totalFee) || 0,
        paidAmount: Number(formData.paidAmount) || 0,
      });

      toast.success("Enrollment Created Successfully");
      onSuccess();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Create Enrollment");
    }

    setSaving(false);
  };

  const batchesForCourse = batches.filter(
    (b) => b.course?._id === formData.course
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Enrollment</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={formData.studentName}
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

          <select name="batch" value={formData.batch} onChange={handleChange}>
            <option value="">No Batch</option>
            {batchesForCourse.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="enrollmentDate"
            value={formData.enrollmentDate}
            onChange={handleChange}
          />

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
            placeholder="Paid Amount (if any)"
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

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEnrollmentModal;
