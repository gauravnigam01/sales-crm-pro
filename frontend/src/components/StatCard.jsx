import "../styles/StatCard.css";

function StatCard({ title, value, icon, growth, onClick, color }) {
  return (
    <div
      className={`stat-card ${onClick ? "clickable" : ""} ${
        color ? `grad-${color}` : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="card-header">
        <div className="card-icon">
          {icon}
        </div>

        {growth && (
          <span className={`growth ${growth.startsWith("-") ? "down" : ""}`}>
            {growth}
          </span>
        )}
      </div>

      <h2>{value}</h2>

      <p>{title}</p>

      <div className="card-footer">
        <span>{onClick ? "View Details →" : "vs last month"}</span>
      </div>
    </div>
  );
}

export default StatCard;