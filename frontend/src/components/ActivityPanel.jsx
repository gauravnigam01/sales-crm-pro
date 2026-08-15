import { useEffect, useState } from "react";

import "../styles/ActivityPanel.css";

import { getRecentActivity } from "../services/dashboardService";

const ENTITY_COLORS = {
  Lead: "blue",
  Customer: "green",
  Deal: "orange",
};

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function ActivityPanel() {
  const [activities, setActivities] = useState([]);

  const loadActivity = async () => {
    try {
      const res = await getRecentActivity();

      setActivities(res.activities || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadActivity();
    })();
  }, []);

  return (
    <div className="activity-panel">
      <div className="activity-header">
        <h2>Recent Activity</h2>
        <span>Live</span>
      </div>

      {activities.length === 0 ? (
        <p className="empty-text">
          No Recent Activity
        </p>
      ) : (
        activities.map((item, index) => (
          <div
            className="activity-item"
            key={`${item._id}-${item.createdAt}-${index}`}
          >
            <span
              className={`dot ${ENTITY_COLORS[item.entityType] || "blue"}`}
            ></span>

            <div className="activity-content">
              <h4>{item.action}</h4>
              <p>
                {item.entityName} · {item.performedByName || "System"} ·{" "}
                {timeAgo(item.createdAt)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ActivityPanel;
