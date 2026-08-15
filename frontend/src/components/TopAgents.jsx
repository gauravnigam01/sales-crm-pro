import { useEffect, useState } from "react";

import "../styles/TopAgents.css";

import { getAgentReport } from "../services/reportService";

function TopAgents() {
  const [agents, setAgents] = useState([]);

  const loadAgents = async () => {
    try {
      const res = await getAgentReport();

      setAgents((res.agents || []).slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadAgents();
    })();
  }, []);

  return (
    <div className="top-agents">

      <div className="agents-header">
        <h2>Top Agents</h2>
        <span>By Revenue</span>
      </div>

      {agents.length === 0 ? (
        <p className="empty-text">
          No Agents Found
        </p>
      ) : (
        agents.map((agent) => (
          <div className="agent-card" key={agent._id}>

            <div className="agent-avatar">
              {agent.fullName?.charAt(0)}
            </div>

            <div className="agent-info">
              <h4>{agent.fullName}</h4>
              <p>₹{(agent.revenue || 0).toLocaleString("en-IN")}</p>
            </div>

            <span className="performance">
              {agent.closedWon} Won
            </span>

          </div>
        ))
      )}

    </div>
  );
}

export default TopAgents;
