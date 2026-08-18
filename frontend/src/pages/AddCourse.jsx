import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { createCourse } from "../services/courseService";

import "../styles/AddCourse.css";

const emptyForm = {
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
};

function AddCourse() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseName.trim()) {
      toast.error("Course Name is required");
      return;
    }

    if (!formData.courseFee || Number(formData.courseFee) < 0) {
      toast.error("Enter a valid Course Fee");
      return;
    }

    setSaving(true);

    try {
      await createCourse({
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

      toast.success("Course Created Successfully");
      navigate("/courses");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Create Course");
    }

    setSaving(false);
  };

  return (
    <div className="add-course-page">
      <div className="page-header">
        <h1>Add Course</h1>
        <p>Create a new course for your institute.</p>
      </div>

      <div className="add-course-card">
        <form className="add-course-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name *</label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="e.g. Full Stack Web Development"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Web Development"
            />
          </div>

          <div className="form-group span-2">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description of the course"
              rows={3}
            />
          </div>

          <div className="form-group span-2">
            <label>Thumbnail Image URL</label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://... (shown on the course card and detail page)"
            />
          </div>

          <div className="form-group span-2">
            <label>Syllabus</label>
            <textarea
              name="syllabus"
              value={formData.syllabus}
              onChange={handleChange}
              placeholder={"One topic per line, e.g.\nIntroduction to HTML & CSS\nJavaScript Fundamentals\nReact Basics"}
              rows={4}
            />
          </div>

          <div className="form-group span-2">
            <label>Prerequisites</label>
            <textarea
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              placeholder="What should a student already know before joining?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 3 Months"
            />
          </div>

          <div className="form-group">
            <label>Course Mode</label>
            <select name="mode" value={formData.mode} onChange={handleChange}>
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Trainer</label>
            <input
              type="text"
              name="trainer"
              value={formData.trainer}
              onChange={handleChange}
              placeholder="Trainer name"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option>Active</option>
              <option>Upcoming</option>
              <option>Completed</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Course Fee *</label>
            <input
              type="number"
              name="courseFee"
              value={formData.courseFee}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Discount</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Installment Available</label>
            <select
              name="installmentAvailable"
              value={formData.installmentAvailable}
              onChange={handleChange}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Installment Amount</label>
            <input
              type="number"
              name="installmentAmount"
              value={formData.installmentAmount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={formData.installmentAvailable !== "Yes"}
            />
          </div>

          <div className="form-group">
            <label>Course Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Course End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Total Seats</label>
            <input
              type="number"
              name="totalSeats"
              value={formData.totalSeats}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="add-course-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/courses")}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCourse;
