import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getMe,
  updateProfile,
  changePassword,
} from "../services/authService";

import {
  getMetaIntegration,
  saveMetaIntegration,
} from "../services/integrationService";

import "../styles/Settings.css";

function Settings() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
  });

  const [originalEmail, setOriginalEmail] = useState("");

  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [metaForm, setMetaForm] = useState({
    appId: "",
    pageAccessToken: "",
  });

  const [metaStatus, setMetaStatus] = useState({
    connected: false,
    pageAccessToken: "",
    updatedAt: null,
  });

  const [savingProfile, setSavingProfile] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);

  const [savingMeta, setSavingMeta] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getMe();

      setProfile({
        fullName: res.user.fullName || "",
        email: res.user.email || "",
        phone: res.user.phone || "",
        role: res.user.role || "",
      });

      setOriginalEmail(res.user.email || "");
    } catch (error) {
      console.log(error);
    }
  };

  const loadMetaIntegration = async () => {
    try {
      const res = await getMetaIntegration();

      setMetaForm({
        appId: res.integration.appId || "",
        pageAccessToken: "",
      });

      setMetaStatus(res.integration);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadProfile();
    })();
  }, []);

  useEffect(() => {
    if (profile.role === "admin") {
      (async () => {
        await loadMetaIntegration();

        if (window.location.hash === "#meta-integration") {
          document
            .getElementById("meta-integration")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      })();
    }
  }, [profile.role]);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleMetaChange = (e) => {
    setMetaForm({
      ...metaForm,
      [e.target.name]: e.target.value,
    });
  };

  const emailChanged = profile.email.toLowerCase() !== originalEmail.toLowerCase();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (emailChanged && !emailCurrentPassword) {
      toast.error("Enter your current password to change your email");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        currentPassword: emailChanged ? emailCurrentPassword : undefined,
      });

      localStorage.setItem("user", JSON.stringify(res.user));

      setOriginalEmail(res.user.email);
      setEmailCurrentPassword("");

      toast.success("Profile Updated");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Update Profile");
    }

    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New Password and Confirm Password do not match");

      return;
    }

    setSavingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password Changed Successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Change Password");
    }

    setSavingPassword(false);
  };

  const handleMetaSubmit = async (e) => {
    e.preventDefault();

    setSavingMeta(true);

    try {
      const res = await saveMetaIntegration(metaForm);

      setMetaStatus(res.integration);

      setMetaForm({
        appId: res.integration.appId || "",
        pageAccessToken: "",
      });

      toast.success("Meta Integration Saved");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to Save Meta Integration"
      );
    }

    setSavingMeta(false);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>

        <p>Manage your profile and account security</p>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h2>My Profile</h2>

          <p className="subtitle">Update your personal information</p>

          <div className="settings-avatar-row">
            <div className="settings-avatar">
              {profile.fullName?.charAt(0) || "?"}
            </div>

            <div>
              <div className="name">{profile.fullName}</div>

              <span className="role">{profile.role}</span>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            {emailChanged && (
              <div className="form-group">
                <label>Current Password (required to change email)</label>

                <input
                  type="password"
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  placeholder="Confirm your current password"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                required
              />
            </div>

            <button
              type="submit"
              className="save-btn"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="settings-card">
          <h2>Change Password</h2>

          <p className="subtitle">Update your account password</p>

          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>

              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>

              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>

              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="save-btn"
              disabled={savingPassword}
            >
              {savingPassword ? "Saving..." : "Change Password"}
            </button>
          </form>
        </div>

        {profile.role === "admin" && (

          <div className="settings-card" id="meta-integration">
            <h2>
              Meta Ads Integration{" "}
              <span
                className={`integration-badge ${
                  metaStatus.connected ? "connected" : "disconnected"
                }`}
              >
                {metaStatus.connected ? "Connected" : "Not Connected"}
              </span>
            </h2>

            <p className="subtitle">
              Connect a Meta (Facebook) Lead Ads app to pull leads
              automatically. Get these values from your Meta Developer App.
            </p>

            <form className="settings-form" onSubmit={handleMetaSubmit}>
              <div className="form-group">
                <label>App ID</label>

                <input
                  type="text"
                  name="appId"
                  value={metaForm.appId}
                  onChange={handleMetaChange}
                  placeholder="Meta App ID"
                />
              </div>

              <div className="form-group">
                <label>Page Access Token</label>

                <input
                  type="password"
                  name="pageAccessToken"
                  value={metaForm.pageAccessToken}
                  onChange={handleMetaChange}
                  placeholder={
                    metaStatus.pageAccessToken
                      ? `Current: ${metaStatus.pageAccessToken}`
                      : "Page Access Token"
                  }
                />
              </div>

              <button
                type="submit"
                className="save-btn"
                disabled={savingMeta}
              >
                {savingMeta ? "Saving..." : "Save Integration"}
              </button>
            </form>
          </div>

        )}
      </div>
    </div>
  );
}

export default Settings;
