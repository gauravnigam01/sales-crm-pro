import { useEffect, useState } from "react";

import { getAllUsers, getPermissionMeta } from "../services/userService";

import UsersTab from "../components/UsersTab";
import PermissionsTab from "../components/PermissionsTab";
import TemplatesTab from "../components/TemplatesTab";

import "../styles/UsersAccess.css";

function Users() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const isAdmin = currentUser?.role === "admin";

  const canManagePermissions =
    isAdmin || currentUser?.permissions?.manageUsers === true;

  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);

  const [categories, setCategories] = useState([]);

  const [templates, setTemplates] = useState({});

  const [selectedUserId, setSelectedUserId] = useState(null);

  const totalPermissions = categories.reduce(
    (sum, cat) => sum + cat.permissions.length,
    0
  );

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();

      setUsers(res.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const loadPermissionMeta = async () => {
    try {
      const res = await getPermissionMeta();

      setCategories(res.categories || []);

      setTemplates(res.templates || {});
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadUsers();

      await loadPermissionMeta();
    })();
  }, []);

  const handleOpenPermissions = (user) => {
    setSelectedUserId(user._id);

    setActiveTab("permissions");
  };

  return (
    <div className="access-page">
      <div className="page-header">
        <h1>⚙️ Settings — Access &amp; Permissions</h1>
      </div>

      <div className="access-tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>

        {canManagePermissions && (
          <button
            className={activeTab === "permissions" ? "active" : ""}
            onClick={() => setActiveTab("permissions")}
          >
            🔒 Permissions
          </button>
        )}

        {canManagePermissions && (
          <button
            className={activeTab === "templates" ? "active" : ""}
            onClick={() => setActiveTab("templates")}
          >
            📋 Templates
          </button>
        )}
      </div>

      {activeTab === "users" && (
        <UsersTab
          users={users}
          totalPermissions={totalPermissions}
          currentUser={currentUser}
          isAdmin={isAdmin}
          canManagePermissions={canManagePermissions}
          onRefresh={loadUsers}
          onOpenPermissions={handleOpenPermissions}
        />
      )}

      {activeTab === "permissions" && canManagePermissions && (
        <PermissionsTab
          users={users}
          categories={categories}
          templates={templates}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      )}

      {activeTab === "templates" && canManagePermissions && (
        <TemplatesTab
          users={users}
          categories={categories}
          templates={templates}
          onRefresh={loadUsers}
        />
      )}
    </div>
  );
}

export default Users;
