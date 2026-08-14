import { useState } from "react";
import { toast } from "react-toastify";

import {
  updateEvent,
  deleteEvent,
} from "../services/calendarService";

import "../styles/AddTaskModal.css";
import "../styles/Calendar.css";

function ViewEventModal({
  open,
  onClose,
  onSuccess,
  event,
}) {
  const [loading, setLoading] = useState(false);

  if (!open || !event) return null;

  const handleComplete = async () => {
    setLoading(true);

    try {
      await updateEvent(event._id, { status: "Completed" });

      onSuccess();

      onClose();
    } catch (error) {
      console.log(error);

      toast.error("Failed to Update Event");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteEvent(event._id);

      onSuccess();

      onClose();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Delete Event");
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <div className="modal-header">
          <h2>{event.title}</h2>

          <button onClick={onClose}>✕</button>
        </div>

        <div className="event-details">
          <div className="event-detail-row">
            <span className="label">Type</span>
            <span className="value">{event.eventType}</span>
          </div>

          <div className="event-detail-row">
            <span className="label">Date</span>
            <span className="value">
              {new Date(event.date).toLocaleDateString("en-IN")}
            </span>
          </div>

          {event.time && (
            <div className="event-detail-row">
              <span className="label">Time</span>
              <span className="value">{event.time}</span>
            </div>
          )}

          <div className="event-detail-row">
            <span className="label">Status</span>
            <span
              className={`event-status ${event.status?.toLowerCase()}`}
            >
              {event.status}
            </span>
          </div>

          {event.description && (
            <div className="event-detail-row">
              <span className="label">Description</span>
              <span className="value">{event.description}</span>
            </div>
          )}

          {event.createdBy?.fullName && (
            <div className="event-detail-row">
              <span className="label">Created By</span>
              <span className="value">{event.createdBy.fullName}</span>
            </div>
          )}
        </div>

        <div className="event-actions">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>

          {event.status === "Scheduled" && (
            <button
              className="complete-btn"
              onClick={handleComplete}
              disabled={loading}
            >
              Mark Completed
            </button>
          )}

          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Working..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewEventModal;
