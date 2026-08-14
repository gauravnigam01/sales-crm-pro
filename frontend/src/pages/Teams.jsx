import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTeamPerformance } from "../services/teamService";

import "../styles/Teams.css";

const ROMAN = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

const toRoman = (num) => ROMAN[num - 1] || num;

function Teams() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);

  const loadTeamData = async () => {
    try {
      const res = await getTeamPerformance();

      setOverview(res.overview);

      setLeaderboard(res.leaderboard || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadTeamData();
    })();
  }, []);

  if (!overview) {
    return (
      <div className="teams-page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="page-header">
        <h1>📊 Work Progress &amp; Teams</h1>
      </div>

      <div className="teams-overview">
        <div className="teams-stat-card blue">
          <div className="icon">👥</div>
          <h2>{overview.totalLeads}</h2>
          <p>Total Leads</p>
        </div>

        <div className="teams-stat-card green">
          <div className="icon">📞</div>
          <h2>{overview.callsDone}</h2>
          <p>Calls Done</p>
        </div>

        <div className="teams-stat-card purple">
          <div className="icon">🤝</div>
          <h2>{overview.meetingsDone}</h2>
          <p>Meetings Done</p>
        </div>

        <div className="teams-stat-card red">
          <div className="icon">🔥</div>
          <h2>{overview.hotLeads}</h2>
          <p>Hot Leads</p>
        </div>

        <div className="teams-stat-card blue">
          <div className="icon">✅</div>
          <h2>{overview.closed}</h2>
          <p>Closed</p>
        </div>

        <div className="teams-stat-card green">
          <div className="icon">🟢</div>
          <h2>{overview.onlineNow}</h2>
          <p>Online Now</p>
        </div>
      </div>

      <div className="leaderboard-section">
        <h2>🏆 Leaderboard</h2>

        {leaderboard.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No Team Members Found
          </p>
        ) : (
          leaderboard.map((member, index) => {
            const progress = Math.min(
              100,
              (member.achieved / (member.monthlyTarget || 1)) * 100
            );

            return (
              <div
                className={`leaderboard-card ${
                  index < 3 ? `rank-${index + 1}` : ""
                }`}
                key={member._id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(
                    `/leads?assignedTo=${member._id}&name=${encodeURIComponent(
                      member.fullName
                    )}`
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(
                      `/leads?assignedTo=${member._id}&name=${encodeURIComponent(
                        member.fullName
                      )}`
                    );
                  }
                }}
              >
                <div className="leaderboard-top">
                  <div className="leaderboard-identity">
                    <span className={`rank-badge ${index < 3 ? `rank-${index + 1}` : ""}`}>
                      {toRoman(index + 1)}
                    </span>

                    <div className="leaderboard-avatar">
                      {member.fullName?.charAt(0)}
                    </div>

                    <div className="leaderboard-name-block">
                      <strong>{member.fullName}</strong>

                      <div className="role-status">
                        {member.role === "manager"
                          ? "Sales Manager"
                          : "Sales Executive"}{" "}
                        ·{" "}
                        <span
                          className={
                            member.isOnline ? "dot-online" : "dot-offline"
                          }
                        >
                          ● {member.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="leaderboard-revenue">
                    <div className="amount">
                      ₹{member.revenue.toLocaleString("en-IN")}
                    </div>
                    <div className="label">Revenue</div>
                  </div>
                </div>

                <div className="leaderboard-stats-row">
                  <div className="mini-stat">
                    <div className="icon">👥</div>
                    <h3>{member.leads}</h3>
                    <p>Leads</p>
                  </div>

                  <div className="mini-stat">
                    <div className="icon">🔥</div>
                    <h3>{member.hot}</h3>
                    <p>Hot</p>
                  </div>

                  <div className="mini-stat">
                    <div className="icon">📞</div>
                    <h3>{member.calls}</h3>
                    <p>Calls</p>
                  </div>

                  <div className="mini-stat">
                    <div className="icon">🤝</div>
                    <h3>{member.visits}</h3>
                    <p>Visits</p>
                  </div>

                  <div className="mini-stat">
                    <div className="icon">✅</div>
                    <h3>{member.closed}</h3>
                    <p>Closed</p>
                  </div>
                </div>

                <div className="target-row">
                  <span>
                    Monthly Target ({member.monthlyTarget} deals)
                  </span>

                  <span>
                    {member.achieved}/{member.monthlyTarget}
                  </span>
                </div>

                <div className="target-bar">
                  <div
                    className="target-bar-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Teams;
