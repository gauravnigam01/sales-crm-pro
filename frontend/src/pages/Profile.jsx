import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  MdPhone,
  MdEmail,
  MdBadge,
  MdTrendingUp,
  MdCall,
  MdAttachMoney,
} from "react-icons/md";

import { getMe, updateProfile } from "../services/authService";
import "../styles/Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getMe();

      setProfile(res.user);
      setForm({
        fullName: res.user.fullName || "",
        phone: res.user.phone || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadProfile();
    })();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const res = await updateProfile(form);

      setProfile(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Profile Updated");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Update Profile");
    }

    setSaving(false);
  };

  if (!profile) {
    return (
      <div className="profile-page">
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and update your profile details.</p>
      </div>

      <div className="profile-hero glass-card">
        <div className="profile-hero-avatar">
          {profile.fullName?.charAt(0) || "?"}
        </div>

        <div className="profile-hero-info">
          <h2>{profile.fullName}</h2>
          <span className={`profile-role-badge ${profile.role}`}>
            {profile.role}
          </span>

          <div className="profile-hero-meta">
            <span>
              <MdEmail /> {profile.email}
            </span>
            <span>
              <MdPhone /> {profile.phone}
            </span>
            <span>
              <MdBadge /> {profile.status}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stats-row">
        <div className="profile-stat-card glass-card">
          <MdTrendingUp className="profile-stat-icon purple" />
          <h2>{profile.assignedLeads || 0}</h2>
          <span>Assigned Leads</span>
        </div>

        <div className="profile-stat-card glass-card">
          <MdCall className="profile-stat-icon blue" />
          <h2>{profile.totalCalls || 0}</h2>
          <span>Total Calls</span>
        </div>

        <div className="profile-stat-card glass-card">
          <MdAttachMoney className="profile-stat-icon green" />
          <h2>₹{(profile.totalSales || 0).toLocaleString("en-IN")}</h2>
          <span>Total Sales</span>
        </div>
      </div>

      <div className="profile-edit-card glass-card">
        <h3>Edit Details</h3>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={profile.email} disabled />
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
