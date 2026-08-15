import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdCall, MdPhoneCallback } from "react-icons/md";

import { getCallLogs } from "../services/leadService";
import "../styles/Calls.css";

function Calls() {
  const navigate = useNavigate();

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCallLogs();
        setCalls(res.calls || []);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    })();
  }, []);

  return (
    <div className="calls-page">
      <div className="page-header">
        <h1>Calls</h1>
        <p>History of all logged calls — synced in real time from leads.</p>
      </div>

      <div className="calls-stat-row">
        <div className="calls-stat-card glass-card">
          <MdCall className="calls-stat-icon" />
          <h2>{calls.length}</h2>
          <span>Total Calls Logged</span>
        </div>
      </div>

      <div className="calls-list glass-card">
        {loading ? (
          <p className="calls-empty">Loading...</p>
        ) : calls.length === 0 ? (
          <div className="calls-empty-state">
            <MdPhoneCallback />
            <p>
              No call logs yet. Use the "Call Done" quick action on a
              lead's detail page to track calls here.
            </p>
          </div>
        ) : (
          <table className="calls-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Status</th>
                <th>Called By</th>
                <th>Assigned To</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr
                  key={call._id}
                  onClick={() => navigate(`/leads/${call.leadId}`)}
                >
                  <td>{call.customerName}</td>
                  <td>{call.phone}</td>
                  <td>{call.company || "—"}</td>
                  <td>{call.status}</td>
                  <td>{call.performedBy?.fullName || "—"}</td>
                  <td>{call.assignedTo?.fullName || "Unassigned"}</td>
                  <td>
                    {new Date(call.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Calls;
