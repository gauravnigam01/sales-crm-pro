import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getUserPermissions,
  updateUserPermissions,
} from "../services/userService";

const TEMPLATE_ICONS = {
  "Manager (Full Access)": "👔",
  "Manager (Standard)": "💼",
  "Caller (Standard)": "📞",
  "Caller (View Only)": "👁️",
};

function PermissionsTab({
  users,
  categories,
  templates,
  selectedUserId,
  onSelectUser,
}) {
  const [permissions, setPermissions] = useState(null);

  const [saving, setSaving] = useState(false);

  const manageableUsers = users.filter((u) => u.role !== "admin");

  const selectedUser = users.find((u) => u._id === selectedUserId);

  const loadPermissions = async (id) => {
    try {
      const res = await getUserPermissions(id);

      setPermissions(res.user.permissions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      (async () => {
        await loadPermissions(selectedUserId);
      })();
    }
  }, [selectedUserId]);

  const togglePermission = (key) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  const setAll = (value) => {
    const updated = {};

    categories.forEach((cat) => {
      cat.permissions.forEach((p) => {
        updated[p.key] = value;
      });
    });

    setPermissions(updated);
  };

  const applyTemplateLocally = (templateName) => {
    setPermissions({ ...templates[templateName].permissions });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await updateUserPermissions(selectedUserId, permissions);

      toast.success("Permissions Saved Successfully");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Save Permissions");
    }

    setSaving(false);
  };

  if (manageableUsers.length === 0) {
    return <p>No manageable users found.</p>;
  }

  return (
    <div>
      <div className="perm-select-row">
        <select
          value={selectedUserId || ""}
          onChange={(e) => onSelectUser(e.target.value)}
        >
          <option value="">Select a user...</option>

          {manageableUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.fullName} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && permissions && (
        <div className="perm-card">
          <div className="perm-card-header">
            <h2>🔒 Individual Permission Control — {selectedUser.fullName}</h2>

            <div className="perm-quick-actions">
              <button className="qa-all" onClick={() => setAll(true)}>
                All ✅
              </button>

              <button className="qa-none" onClick={() => setAll(false)}>
                None 🔒
              </button>

              {Object.keys(templates).map((name) => (
                <button
                  key={name}
                  className="qa-template"
                  title={name}
                  onClick={() => applyTemplateLocally(name)}
                >
                  {TEMPLATE_ICONS[name] || "⭐"}
                </button>
              ))}

              <button
                className="add-task-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {categories.map((cat) => (
            <div key={cat.key}>
              <div className="perm-category-title">{cat.label}</div>

              <div className="perm-grid">
                {cat.permissions.map((p) => (
                  <label
                    key={p.key}
                    className={`perm-toggle-card ${
                      permissions[p.key] ? "on" : ""
                    }`}
                  >
                    <span className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={permissions[p.key] || false}
                        onChange={() => togglePermission(p.key)}
                      />
                      <span className="toggle-slider"></span>
                    </span>

                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PermissionsTab;
