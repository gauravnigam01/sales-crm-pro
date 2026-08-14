import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MdBolt,
  MdLockReset,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdErrorOutline,
  MdCheckCircleOutline,
} from "react-icons/md";

import { resetPasswordWithToken } from "../services/authService";
import "../styles/Auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await resetPasswordWithToken(token, newPassword);

      setSuccess(res.message);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset link is invalid or has expired"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-orb orb-1"></div>
        <div className="auth-brand-orb orb-2"></div>
        <div className="auth-brand-grid"></div>

        <div className="auth-brand-logo">
          <MdBolt />
        </div>

        <h1>
          Naya password <span>set karo</span> <br />
          aur wapas kaam pe lag jao.
        </h1>

        <p>
          Ye link sirf 1 ghante ke liye valid hai, security ke liye.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-logo-mobile">
            <MdBolt />
          </div>

          <h2>
            <MdLockReset style={{ verticalAlign: "middle", marginRight: 8 }} />
            Set New Password
          </h2>
          <p className="auth-subtitle">
            Apna naya password neeche daalo
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error">
                <MdErrorOutline /> {error}
              </div>
            )}
            {success && (
              <div className="auth-success">
                <MdCheckCircleOutline /> {success}
              </div>
            )}

            <div className="form-group">
              <label>New Password</label>
              <div className="input-icon-wrapper">
                <MdLockOutline className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  className="has-trailing-btn"
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-icon-wrapper">
                <MdLockOutline className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="auth-footer-text">
            Yaad aa gaya? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
