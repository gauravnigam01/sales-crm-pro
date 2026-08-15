import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllLeads } from "../services/leadService";

import "../styles/UsersAccess.css";
import "../styles/AddTaskModal.css";

const STATUS_ORDER = [
  "New",
  "Assigned",
  "Contacted",
  "Interested",
  "Follow Up",
  "Qualified",
  "Closed Won",
  "Closed Lost",
];

function UserLeadsModal({ open, user, onClose }) {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(false);

  const loadLeads = async (userId) => {
    setLoading(true);

    try {
      const res = await getAllLeads(userId);

      setLeads(res.leads || []);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (open && user) {
      (async () => {
        await loadLeads(user._id);
      })();
    }
  }, [open, user]);

  if (!open || !user) return null;

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: leads.filter((l) => l.status === status).length,
  })).filter((s) => s.count > 0);

  const closedWon = leads.filter((l) => l.status === "Closed Won").length;

  const stillOpen = leads.length - closedWon - leads.filter(
    (l) => l.status === "Closed Lost"
  ).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="task-modal"
        style={{ width: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>👤 {user.fullName}'s Leads</h2>

          <button onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p style={{ padding: "25px" }}>Loading...</p>
        ) : (
          <div style={{ padding: "25px" }}>
            <div className="teams-overview" style={{ marginBottom: "22px" }}>
              <div className="teams-stat-card blue">
                <h2>{leads.length}</h2>
                <p>Total Leads</p>
              </div>

              <div className="teams-stat-card green">
                <h2>{stillOpen}</h2>
                <p>Still Working</p>
              </div>

              <div className="teams-stat-card purple">
                <h2>{closedWon}</h2>
                <p>Closed Won</p>
              </div>
            </div>

            <h4 className="leads-modal-heading">Status Breakdown</h4>

            {statusCounts.length === 0 ? (
              <p className="leads-modal-empty">No Leads Assigned Yet</p>
            ) : (
              <div style={{ marginBottom: "22px" }}>
                {statusCounts.map((s) => (
                  <div className="status-breakdown-row" key={s.status}>
                    <span className="status-breakdown-label">
                      {s.status}
                    </span>
                    <span className="status-breakdown-count">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <h4 className="leads-modal-heading">Lead List</h4>

            <div style={{ maxHeight: "260px", overflowY: "auto" }}>
              {leads.length === 0 ? (
                <p className="leads-modal-empty">No Leads Found</p>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead._id}
                    className="lead-list-row"
                    onClick={() => navigate(`/leads/${lead._id}`)}
                  >
                    <span className="lead-list-name">
                      {lead.customerName}
                    </span>

                    <span className="lead-list-status">
                      {lead.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserLeadsModal;
