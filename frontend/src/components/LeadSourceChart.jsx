import { useEffect, useState } from "react";

import "../styles/LeadSourceChart.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { getLeadReport } from "../services/reportService";

// Fixed categorical order (first 4 slots validate all-pairs in both modes)
const COLORS = ["#2a78d6", "#008300", "#e87ba4", "#eda100"];

function LeadSourceChart() {
  const [data, setData] = useState([]);

  const loadSources = async () => {
    try {
      const res = await getLeadReport();

      const bySource = res.report?.leadsBySource || [];

      const top = bySource.slice(0, 4).map((row) => ({
        name: row._id,
        value: row.count,
      }));

      const rest = bySource.slice(4);

      const otherTotal = rest.reduce((sum, row) => sum + row.count, 0);

      if (otherTotal > 0) {
        top.push({ name: "Other", value: otherTotal });
      }

      setData(top);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadSources();
    })();
  }, []);

  return (
    <div className="lead-chart">
      <div className="lead-header">
        <div>
          <h2>Lead Sources</h2>
          <p>Where Leads Come From</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>
          No Lead Data Yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={4}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default LeadSourceChart;
