import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateCourse } from "../services/courseService";

const toDateInput = (value) => (value ? value.substring(0, 10) : "");

function EditCourseModal({ course, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    courseName: "",
    category: "",
    description: "",
    thumbnail: "",
    syllabus: "",
    prerequisites: "",
    duration: "",
    mode: "Online",
    trainer: "",
    courseFee: "",
    discount: "",
    installmentAvailable: "No",
    installmentAmount: "",
    startDate: "",
    endDate: "",
    totalSeats: "",
    status: "Upcoming",
  });

  useEffect(() => {
    (async () => {
      if (course) {
        setFormData({
          courseName: course.courseName || "",
          category: course.category || "",
          description: course.description || "",
          thumbnail: course.thumbnail || "",
          syllabus: (course.syllabus || []).join("\n"),
          prerequisites: course.prerequisites || "",
          duration: course.duration || "",
          mode: course.mode || "Online",
          trainer: course.trainer || "",
          courseFee: course.courseFee ?? "",
          discount: course.discount ?? "",
          installmentAvailable: course.installmentAvailable ? "Yes" : "No",
          installmentAmount: course.installmentAmount ?? "",
          startDate: toDateInput(course.startDate),
          endDate: toDateInput(course.endDate),
          totalSeats: course.totalSeats ?? "",
          status: course.status || "Upcoming",
        });
      }
    })();
  }, [course]);

  if (!course) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateCourse(course._id, {
        ...formData,
        courseFee: Number(formData.courseFee) || 0,
        discount: Number(formData.discount) || 0,
        installmentAvailable: formData.installmentAvailable === "Yes",
        installmentAmount: Number(formData.installmentAmount) || 0,
        totalSeats: Number(formData.totalSeats) || 0,
        syllabus: formData.syllabus
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      });

      toast.success("Course Updated Successfully");
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
        <h2>Edit Course</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <input
            type="text"
            name="thumbnail"
            placeholder="Thumbnail Image URL"
            value={formData.thumbnail}
            onChange={handleChange}
          />

          <textarea
            name="syllabus"
            placeholder={"Syllabus — one topic per line"}
            value={formData.syllabus}
            onChange={handleChange}
            rows={4}
          />

          <textarea
            name="prerequisites"
            placeholder="Prerequisites"
            value={formData.prerequisites}
            onChange={handleChange}
            rows={2}
          />

          <input
            type="text"
            name="duration"
            placeholder="Duration (e.g. 3 months)"
            value={formData.duration}
            onChange={handleChange}
          />

          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option>Online</option>
            <option>Offline</option>
            <option>Hybrid</option>
          </select>

          <input
            type="text"
            name="trainer"
            placeholder="Trainer"
            value={formData.trainer}
            onChange={handleChange}
          />

          <input
            type="number"
            name="courseFee"
            placeholder="Course Fee"
            value={formData.courseFee}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="discount"
            placeholder="Discount"
            value={formData.discount}
            onChange={handleChange}
          />

          <select
            name="installmentAvailable"
            value={formData.installmentAvailable}
            onChange={handleChange}
          >
            <option value="No">Installment Available: No</option>
            <option value="Yes">Installment Available: Yes</option>
          </select>

          <input
            type="number"
            name="installmentAmount"
            placeholder="Installment Amount"
            value={formData.installmentAmount}
            onChange={handleChange}
            disabled={formData.installmentAvailable !== "Yes"}
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
          />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Active</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Inactive</option>
          </select>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Update Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCourseModal;
