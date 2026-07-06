import "../styles/ActivityPanel.css";

const activities = [
  {
    title: "New Lead Added",
    desc: "Rahul Sharma • 2 min ago",
    color: "blue",
  },
  {
    title: "Meeting Scheduled",
    desc: "Tomorrow • 11:00 AM",
    color: "green",
  },
  {
    title: "Deal Closed",
    desc: "₹85,000 Revenue",
    color: "orange",
  },
  {
    title: "Payment Received",
    desc: "₹45,000 • Today",
    color: "purple",
  },
];

function ActivityPanel() {
  return (
    <div className="activity-panel">
      <div className="activity-header">
        <h2>Recent Activity</h2>
        <span>Live</span>
      </div>

      {activities.map((item, index) => (
        <div className="activity-item" key={index}>
          <span className={`dot ${item.color}`}></span>

          <div className="activity-content">
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityPanel;