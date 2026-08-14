import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdWarning, MdSchedule, MdEventAvailable } from "react-icons/md";

import { getFollowUps } from "../services/leadService";
import "../styles/Followups.css";

function Followups() {
  const navigate = useNavigate();

  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getFollowUps();
        setOverdue(res.overdue || []);
        setUpcoming(res.upcoming || []);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    })();
  }, []);

  const renderRow = (lead) => (
    <div
      className="followup-row glass-card"
      key={lead._id}
      onClick={() => navigate(`/leads/${lead._id}`)}
    >
      <div className="followup-main">
        <h4>{lead.customerName}</h4>
        <span className="followup-phone">{lead.phone}</span>
      </div>

      <div className="followup-meta">
        <span className="followup-status">{lead.status}</span>
        <span className="followup-assignee">
          {lead.assignedTo?.fullName || "Unassigned"}
        </span>
      </div>

      <div className="followup-date">
        {new Date(lead.followUpDate).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );

  return (
    <div className="followups-page">
      <div className="page-header">
        <h1>Follow-ups</h1>
        <p>Scheduled follow-ups — overdue aur upcoming ek jagah.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="followup-section-title overdue">
            <MdWarning /> Overdue ({overdue.length})
          </div>

          {overdue.length === 0 ? (
            <div className="followup-empty">
              <MdEventAvailable /> Koi overdue follow-up nahi hai.
            </div>
          ) : (
            <div className="followup-list">{overdue.map(renderRow)}</div>
          )}

          <div className="followup-section-title upcoming">
            <MdSchedule /> Upcoming ({upcoming.length})
          </div>

          {upcoming.length === 0 ? (
            <div className="followup-empty">
              <MdEventAvailable /> Koi upcoming follow-up schedule nahi hai.
            </div>
          ) : (
            <div className="followup-list">{upcoming.map(renderRow)}</div>
          )}
        </>
      )}
    </div>
  );
}

export default Followups;
