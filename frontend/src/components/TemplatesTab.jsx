import { toast } from "react-toastify";

import { applyTemplateToUser } from "../services/userService";

const TEMPLATE_ICONS = {
  "Manager (Full Access)": "👔",
  "Manager (Standard)": "💼",
  "Caller (Standard)": "📞",
  "Caller (View Only)": "👁️",
};

function TemplatesTab({ users, categories, templates, onRefresh }) {
  const manageableUsers = users.filter((u) => u.role !== "admin");

  const totalPermissions = categories.reduce(
    (sum, cat) => sum + cat.permissions.length,
    0
  );

  const templateCount = (templateName) =>
    Object.values(templates[templateName].permissions).filter(Boolean)
      .length;

  const isMatchingTemplate = (user, templateName) => {
    const template = templates[templateName].permissions;

    return categories
      .flatMap((c) => c.permissions.map((p) => p.key))
      .every((key) => Boolean(user.permissions?.[key]) === Boolean(template[key]));
  };

  const handleApply = async (userId, templateName) => {
    try {
      await applyTemplateToUser(userId, templateName);

      await onRefresh();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Apply Template");
    }
  };

  return (
    <div>
      <div className="template-grid">
        {Object.entries(templates).map(([name, template], index) => (
          <div key={name} className={`template-card t${index % 4}`}>
            <h3>
              {TEMPLATE_ICONS[name] || "⭐"} {name}
            </h3>

            <p className="template-count">
              {templateCount(name)}/{totalPermissions} permissions
            </p>

            <div className="template-perm-list">
              {categories.flatMap((cat) =>
                cat.permissions.map((p) => (
                  <div
                    key={p.key}
                    className={`template-perm-item ${
                      template.permissions[p.key] ? "granted" : "denied"
                    }`}
                  >
                    {template.permissions[p.key] ? "✅" : "🔒"} {p.label}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="apply-section">
        <h2>⚡ Apply Template To User</h2>

        {manageableUsers.map((user) => (
          <div className="apply-row" key={user._id}>
            <span className="apply-name">{user.fullName}</span>

            <div className="apply-btn-group">
              {Object.keys(templates).map((name) => (
                <button
                  key={name}
                  className={
                    isMatchingTemplate(user, name) ? "selected" : ""
                  }
                  onClick={() => handleApply(user._id, name)}
                >
                  {TEMPLATE_ICONS[name]} {name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplatesTab;
