import { useState } from "react";
import { toast } from "react-toastify";

import { deleteTask } from "../services/taskService";

import "../styles/DeleteModal.css";

function DeleteTaskModal({
  open,
  onClose,
  onSuccess,
  task,
}) {
  const [loading, setLoading] = useState(false);

  if (!open || !task) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteTask(task._id);

      onSuccess();

      onClose();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Delete Task");
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <div className="delete-header">
          <h2>Delete Task</h2>
        </div>

        <div className="delete-body">
          <p>Are you sure you want to delete</p>

          <h3>{task?.title || "this task"} ?</h3>

          <p>This action cannot be undone.</p>
        </div>

        <div className="delete-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTaskModal;
