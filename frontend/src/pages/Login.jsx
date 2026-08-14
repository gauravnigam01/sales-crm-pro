import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdBolt,
  MdBarChart,
  MdGroups,
  MdWhatsapp,
  MdVisibility,
  MdVisibilityOff,
  MdMailOutline,
  MdLockOutline,
  MdErrorOutline,
} from "react-icons/md";

import { loginUser } from "../services/authService";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
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
          Sales ko <span>automate</span> karo, <br />
          leads ko waste mat karo.
        </h1>

        <p>
          Sales CRM Pro — lead assignment, WhatsApp follow-ups, aur
          real-time reporting sab ek jagah.
        </p>

        <div className="auth-brand-features">
          <div className="auth-brand-feature">
            <MdBarChart /> Real-time reports &amp; analytics
          </div>
          <div className="auth-brand-feature">
            <MdGroups /> Team performance tracking
          </div>
          <div className="auth-brand-feature">
            <MdWhatsapp /> WhatsApp follow-up automation
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-logo-mobile">
            <MdBolt />
          </div>

          <h2>Welcome back</h2>
          <p className="auth-subtitle">Login to your CRM account</p>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && (
              <div className="auth-error">
                <MdErrorOutline /> {error}
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

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <MdLockOutline className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="auth-links">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </form>

          <p className="auth-footer-text">
            Naya account chahiye? Apne admin se bolo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
