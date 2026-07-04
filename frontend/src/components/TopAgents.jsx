import "../styles/TopAgents.css";

const agents = [
  {
    id: 1,
    name: "Rahul Sharma",
    deals: "₹2,50,000",
    performance: "98%",
  },
  {
    id: 2,
    name: "Mohit Kumar",
    deals: "₹1,90,000",
    performance: "92%",
  },
  {
    id: 3,
    name: "Aman Singh",
    deals: "₹1,45,000",
    performance: "87%",
  },
];

function TopAgents() {
  return (
    <div className="top-agents">
      <h2>Top Performing Agents</h2>

      {agents.map((agent) => (
        <div className="agent-card" key={agent.id}>
          <div className="agent-avatar">
            {agent.name.charAt(0)}
          </div>

          <div className="agent-info">
            <h4>{agent.name}</h4>
            <p>{agent.deals}</p>
          </div>

          <span className="performance">
            {agent.performance}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TopAgents;