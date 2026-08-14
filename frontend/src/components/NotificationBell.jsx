import { useEffect, useRef, useState } from "react";
import { MdNotifications, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../services/notificationService";

import "../styles/NotificationBell.css";

const socket = io(
  import.meta.env.PROD ? undefined : "http://localhost:5000"
);

const RECENT_LIMIT = 8;

function NotificationBell() {

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const wrapperRef = useRef(null);

  const loadNotifications = async () => {

    try {

      const res = await getNotifications();

      setNotifications(res.notifications || []);

    } catch (error) {

      console.log(error);

    }

  };

  const handleDelete = async (e, id) => {

    e.stopPropagation();

    try {

      await deleteNotification(id);

      setNotifications((prev) => prev.filter((item) => item._id !== id));

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    (async () => {

      await loadNotifications();

    })();

    const identify = () => {

      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (user?._id) {
        socket.emit("identify", user._id);
      }

    };

    identify();

    socket.on("connect", identify);

    socket.on("newNotification", (notification) => {

      setNotifications((prev) => [
        notification,
        ...prev,
      ]);

    });

    return () => {

      socket.off("newNotification");

      socket.off("connect", identify);

    };

  }, []);

  useEffect(() => {

    if (!open) return;

    const handleClickOutside = (e) => {

      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [open]);

  return (

    <div className="notification-wrapper" ref={wrapperRef}>

      <button
        className="notification-btn"
        onClick={() => setOpen(!open)}
      >

        <MdNotifications />

        <span className="notification-count">

          {notifications.filter(
            (item) => !item.isRead
          ).length}

        </span>

      </button>

      {open && (

        <div className="notification-dropdown">

          <div className="notification-header">

            <h3>Notifications</h3>

            <span>

              {notifications.length} New

            </span>

          </div>

          <div className="notification-list">

            {notifications.length === 0 ? (

              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                }}
              >

                No Notifications

              </div>

            ) : (

              notifications.slice(0, RECENT_LIMIT).map((item) => (

                <div
                  key={item._id}
                  className={`notification-item ${item.type}`}
                  onClick={async () => {

                    await markAsRead(item._id);

                    loadNotifications();

                  }}
                >

                  <div className="notification-icon">

                    {item.type === "lead" && "📈"}
                    {item.type === "customer" && "👤"}
                    {item.type === "deal" && "💰"}
                    {item.type === "task" && "✅"}
                    {item.type === "followup" && "📅"}

                  </div>

                  <div className="notification-content">

                    <h4>{item.title}</h4>

                    <p>{item.message}</p>

                    <small>
                      {new Date(
                        item.createdAt
                      ).toLocaleString("en-IN")}
                    </small>

                  </div>

                  <button
                    className="notification-delete-btn"
                    title="Delete"
                    onClick={(e) => handleDelete(e, item._id)}
                  >
                    <MdDelete />
                  </button>

                </div>

              ))

            )}

          </div>

          <div className="notification-footer">

            <button
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
            >

              View All Notifications

            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default NotificationBell;