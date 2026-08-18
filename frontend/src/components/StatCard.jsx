import { MdArrowUpward, MdArrowDownward } from "react-icons/md";

import "../styles/StatCard.css";

const SPARK_PATHS = [
  "M0,28 C10,26 16,30 24,24 C32,18 38,22 46,16 C54,10 60,14 68,8 C76,2 84,6 90,2",
  "M0,20 C8,24 14,10 22,14 C30,18 36,4 44,10 C52,16 58,6 66,12 C74,18 82,8 90,4",
  "M0,10 C8,8 14,20 22,16 C30,12 36,24 44,18 C52,12 58,22 66,16 C74,10 82,18 90,10",
];

function StatCard({ title, value, icon, growth, onClick, color = "blue" }) {
  const isDown = growth?.startsWith("-");
  const sparkPath = SPARK_PATHS[Math.abs(title?.length ?? 0) % SPARK_PATHS.length];

  return (
    <div
      className={`stat-card stat-${color} ${onClick ? "clickable" : ""}`}
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
      <div className="card-top">
        <span className="card-title">{title}</span>
        <div className="card-icon">{icon}</div>
      </div>

      <div className="card-value">{value}</div>

      {growth && (
        <div className={`growth ${isDown ? "down" : "up"}`}>
          {isDown ? <MdArrowDownward /> : <MdArrowUpward />}
          {growth}
        </div>
      )}

      <svg className="card-spark" viewBox="0 0 90 32" preserveAspectRatio="none">
        <path d={sparkPath} fill="none" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default StatCard;