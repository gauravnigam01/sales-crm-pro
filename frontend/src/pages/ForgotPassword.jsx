import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdLockReset,
  MdMailOutline,
  MdErrorOutline,
  MdCheckCircleOutline,
} from "react-icons/md";

import { forgotPassword } from "../services/authService";
import NexumLogo from "../components/NexumLogo";
import "../styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await forgotPassword(email);

      setSuccess(res.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-orb orb-1"></div>
        <div className="auth-brand-orb orb-2"></div>
        <div className="auth-brand-grid"></div>

        <div className="auth-brand-logo">
          <NexumLogo size={30} />
        </div>

        <h1>
          Forgot your password? <br />
          <span>No worries.</span>
        </h1>

        <p>
          Enter your email — we'll notify your admin so they can reset
          your password.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-logo-mobile">
            <NexumLogo size={28} />
          </div>

          <h2>
            <MdLockReset style={{ verticalAlign: "middle", marginRight: 8 }} />
            Reset Password
          </h2>
          <p className="auth-subtitle">
            We'll confirm once your request reaches the admin
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
              <label>Email</label>
              <div className="input-icon-wrapper">
                <MdMailOutline className="input-icon" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Sending..." : "Notify Admin"}
            </button>
          </form>

          <p className="auth-footer-text">
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
