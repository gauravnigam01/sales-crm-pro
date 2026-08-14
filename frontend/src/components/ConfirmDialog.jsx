import { useState } from "react";

import "../styles/DeleteModal.css";

function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-header">
          <h2>{title}</h2>
        </div>

        <div className="delete-body">
          <p>{message}</p>
          <p>This action cannot be undone.</p>
        </div>

        <div className="delete-footer">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
