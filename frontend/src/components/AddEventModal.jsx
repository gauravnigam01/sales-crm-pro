import { useState } from "react";
import { toast } from "react-toastify";

import { createEvent } from "../services/calendarService";

import "../styles/AddTaskModal.css";

function AddEventModal({
  open,
  onClose,
  onSuccess,
  defaultDate,
}) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Meeting",
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createEvent({
        ...formData,
        date: formData.date || defaultDate,
      });

      toast.success("Event Created");

      onSuccess();

      onClose();

      setFormData({
        title: "",
        description: "",
        eventType: "Meeting",
        date: "",
        time: "",
      });
    } catch (error) {
      console.log(error);

      toast.error("Failed");
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <div className="modal-header">
          <h2>Add Event</h2>

          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type</label>

              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
              >
                <option>Meeting</option>
                <option>Call</option>
                <option>Follow-up</option>
                <option>Reminder</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time</label>

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date || defaultDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;
