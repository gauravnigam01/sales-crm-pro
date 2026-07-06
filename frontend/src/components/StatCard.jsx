import "../styles/StatCard.css";

function StatCard({ title, value, icon, growth }) {
  return (
    <div className="stat-card">
      <div className="card-header">
        <div className="card-icon">
          {icon}
        </div>

        <span className="growth">
          {growth}
        </span>
      </div>

      <h2>{value}</h2>

      <p>{title}</p>

      <div className="card-footer">
        <span>vs last month</span>
      </div>
    </div>
  );
}

export default StatCard;