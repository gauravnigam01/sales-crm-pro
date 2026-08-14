import { useState } from "react";
import { toast } from "react-toastify";

import { resetUserPassword } from "../services/userService";

import "../styles/UsersAccess.css";
import "../styles/AddTaskModal.css";

function ResetPasswordModal({ open, user, onClose }) {
  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  if (!open || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");

      return;
    }

    setLoading(true);

    try {
      const res = await resetUserPassword(user._id, newPassword);

      toast.success(res.message);

      setNewPassword("");

      setConfirmPassword("");

      onClose();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Reset Password");
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <div className="modal-header">
          <h2>Reset Password — {user.fullName}</h2>

          <button onClick={onClose}>✕</button>
        </div>

        <form className="reset-pw-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordModal;
