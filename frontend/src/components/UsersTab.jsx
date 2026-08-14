import { useState } from "react";
import { toast } from "react-toastify";

import { deleteUser, changeUserStatus } from "../services/userService";

import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import ResetPasswordModal from "./ResetPasswordModal";
import UserLeadsModal from "./UserLeadsModal";

function UsersTab({
  users,
  totalPermissions,
  currentUser,
  isAdmin,
  canManagePermissions,
  onRefresh,
  onOpenPermissions,
}) {
  const [openAddModal, setOpenAddModal] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [openResetModal, setOpenResetModal] = useState(false);

  const [openLeadsModal, setOpenLeadsModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const grantedCount = (user) =>
    Object.values(user.permissions || {}).filter(Boolean).length;

  const managerName = (managerId) => {
    const found = users.find((u) => u._id === managerId);

    return found?.fullName || null;
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser._id);

      toast.success("User Deleted Successfully");

      setOpenDeleteModal(false);

      setSelectedUser(null);

      onRefresh();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Delete User");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await changeUserStatus(user._id);

      onRefresh();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Update Status");
    }
  };

  return (
    <div>
      <div className="users-tab-header">
        <h3>Team ({users.length})</h3>

        {isAdmin && (
          <button
            className="add-task-btn"
            onClick={() => setOpenAddModal(true)}
          >
            + New Member
          </button>
        )}
      </div>

      {users.map((user) => {
        const isMe = user._id === currentUser?._id;

        const isDisabled = user.status !== "active";

        const reportsTo = managerName(user.manager);

        return (
          <div
            key={user._id}
            className={`team-card ${isMe ? "me" : ""} ${
              isDisabled ? "disabled" : ""
            }`}
          >
            <div
              className="team-avatar"
              style={{
                cursor: user.role !== "admin" ? "pointer" : "default",
              }}
              onClick={() => {
                if (user.role === "admin") return;

                setSelectedUser(user);

                setOpenLeadsModal(true);
              }}
            >
              {user.fullName?.charAt(0) || "?"}
            </div>

            <div
              className="team-info"
              style={{
                cursor: user.role !== "admin" ? "pointer" : "default",
              }}
              onClick={() => {
                if (user.role === "admin") return;

                setSelectedUser(user);

                setOpenLeadsModal(true);
              }}
            >
              <div className="team-name-row">
                <strong>{user.fullName}</strong>

                {user.role === "admin" && (
                  <span className="pill admin-crown">👑 Main Admin</span>
                )}

                <span
                  className={`pill ${isDisabled ? "disabled" : "active"}`}
                >
                  {isDisabled ? "Disabled" : "Active"}
                </span>

                {isMe && <span className="pill you">You</span>}
              </div>

              <div className="team-meta">
                📧 {user.email} · {user.role}
                {reportsTo ? ` · Reports to: ${reportsTo}` : ""}
              </div>

              {user.role !== "admin" && (
                <div className="perm-progress">
                  <div className="perm-progress-bar">
                    <div
                      className="perm-progress-fill"
                      style={{
                        width: `${
                          (grantedCount(user) / totalPermissions) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <span>
                    {grantedCount(user)}/{totalPermissions}
                  </span>
                </div>
              )}
            </div>

            {!isMe && (canManagePermissions || isAdmin) && (
              <div className="team-actions">
                {canManagePermissions && user.role !== "admin" && (
                  <button
                    className="btn-perms"
                    onClick={() => onOpenPermissions(user)}
                  >
                    🔒 Perms
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      className="btn-reset"
                      onClick={() => {
                        setSelectedUser(user);

                        setOpenResetModal(true);
                      }}
                    >
                      Reset Password
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() => {
                        setSelectedUser(user);

                        setOpenEditModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className={isDisabled ? "btn-enable" : "btn-disable"}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {isDisabled ? "Enable" : "Disable"}
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => {
                        setSelectedUser(user);

                        setOpenDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <AddUserModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={onRefresh}
      />

      <EditUserModal
        open={openEditModal}
        user={selectedUser}
        managers={users.filter(
          (u) => u.role === "manager" && u._id !== selectedUser?._id
        )}
        onClose={() => {
          setOpenEditModal(false);

          setSelectedUser(null);
        }}
        onSuccess={onRefresh}
      />

      <DeleteUserModal
        open={openDeleteModal}
        user={selectedUser}
        onClose={() => {
          setOpenDeleteModal(false);

          setSelectedUser(null);
        }}
        onDelete={handleDelete}
      />

      <ResetPasswordModal
        open={openResetModal}
        user={selectedUser}
        onClose={() => {
          setOpenResetModal(false);

          setSelectedUser(null);
        }}
      />

      <UserLeadsModal
        open={openLeadsModal}
        user={selectedUser}
        onClose={() => {
          setOpenLeadsModal(false);

          setSelectedUser(null);
        }}
      />
    </div>
  );
}

export default UsersTab;
