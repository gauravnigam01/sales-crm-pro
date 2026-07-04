import "../styles/LeadSourceChart.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const data = [
  { name: "Website", value: 45 },
  { name: "Facebook", value: 25 },
  { name: "Instagram", value: 20 },
  { name: "Referral", value: 10 },
];

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

function LeadSourceChart() {
  return (
    <div className="lead-chart">
      <h2>Lead Sources</h2>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={90}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LeadSourceChart;