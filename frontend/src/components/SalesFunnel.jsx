import "../styles/SalesFunnel.css";

const stages = [
  { name: "Leads", count: 245, color: "#2563eb" },
  { name: "Qualified", count: 180, color: "#10b981" },
  { name: "Proposal", count: 95, color: "#f59e0b" },
  { name: "Won", count: 58, color: "#8b5cf6" },
];

function SalesFunnel() {
  return (
    <div className="sales-funnel">

      <div className="funnel-header">
        <h2>Sales Funnel</h2>
        <span>This Month</span>
      </div>

      {stages.map((stage) => (
        <div className="funnel-item" key={stage.name}>

          <div className="funnel-top">
            <span>{stage.name}</span>
            <span>{stage.count}</span>
          </div>

          <div className="progress">
            <div
              className="progress-fill"
              style={{
                width: `${(stage.count / 245) * 100}%`,
                background: stage.color,
              }}
            ></div>
          </div>

        </div>
      ))}

    </div>
  );
}

export default SalesFunnel;