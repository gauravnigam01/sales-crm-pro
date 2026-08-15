import { useEffect, useState } from "react";
import { MdDelete, MdMarkEmailRead, MdNotificationsNone } from "react-icons/md";
import { io } from "socket.io-client";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../services/notificationService";
import ConfirmDialog from "../components/ConfirmDialog";

import "../styles/Notifications.css";

const socket = io(import.meta.env.PROD ? undefined : "http://localhost:5000");

const ICONS = {
  lead: "📈",
  customer: "👤",
  deal: "💰",
  task: "✅",
  followup: "📅",
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.notifications || []);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await load();
    })();

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      await load();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteNotification(deleteTarget);
      await load();
    } catch (error) {
      console.log(error);
    }

    setDeleteTarget(null);
  };

  const filtered = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>All your real-time updates in one place.</p>
      </div>

      <div className="notif-filter-row">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="notif-list glass-card">
        {loading ? (
          <p className="notif-empty">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="notif-empty-state">
            <MdNotificationsNone />
            <p>No notifications yet.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              className={`notif-row ${item.isRead ? "" : "unread"}`}
              key={item._id}
            >
              <div className="notif-icon">
                {ICONS[item.type] || "🔔"}
              </div>

              <div className="notif-content">
                <h4>{item.title}</h4>
                <p>{item.message}</p>
                <small>
                  {new Date(item.createdAt).toLocaleString("en-IN")}
                </small>
              </div>

              <div className="notif-actions">
                {!item.isRead && (
                  <button
                    className="icon-btn"
                    title="Mark as read"
                    onClick={() => handleMarkRead(item._id)}
                  >
                    <MdMarkEmailRead />
                  </button>
                )}

                <button
                  className="icon-btn danger"
                  title="Delete"
                  onClick={() => handleDelete(item._id)}
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Notifications;
