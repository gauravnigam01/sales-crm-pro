import "../styles/ActivityPanel.css";

function ActivityPanel() {
  return (
    <div className="activity-panel">
      <h2>Recent Activity</h2>

      <div className="activity-item">
        <span className="dot blue"></span>
        <div>
          <h4>New Lead Added</h4>
          <p>Rahul Sharma • 2 min ago</p>
        </div>
      </div>

      <div className="activity-item">
        <span className="dot green"></span>
        <div>
          <h4>Meeting Scheduled</h4>
          <p>Tomorrow • 11:00 AM</p>
        </div>
      </div>

      <div className="activity-item">
        <span className="dot orange"></span>
        <div>
          <h4>Deal Closed</h4>
          <p>₹85,000 Revenue</p>
        </div>
      </div>
    </div>
  );
}

export default ActivityPanel;