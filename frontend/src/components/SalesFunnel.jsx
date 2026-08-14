import { useEffect, useState } from "react";

import "../styles/SalesFunnel.css";

import { getSalesReport } from "../services/reportService";

const STAGE_ORDER = [
  "New",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
];

const STAGE_COLORS = {
  New: "#2563eb",
  Qualified: "#10b981",
  Proposal: "#f59e0b",
  Negotiation: "#8b5cf6",
  Won: "#16a34a",
};

function SalesFunnel() {
  const [stages, setStages] = useState([]);

  const loadFunnel = async () => {
    try {
      const res = await getSalesReport();

      const byStage = res.report?.dealsByStage || [];

      const counts = Object.fromEntries(
        byStage.map((row) => [row._id, row.count])
      );

      setStages(
        STAGE_ORDER.map((name) => ({
          name,
          count: counts[name] || 0,
          color: STAGE_COLORS[name],
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadFunnel();
    })();
  }, []);

  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="sales-funnel">

      <div className="funnel-header">
        <h2>Deal Pipeline</h2>
        <span>By Stage</span>
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
                width: `${(stage.count / maxCount) * 100}%`,
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
