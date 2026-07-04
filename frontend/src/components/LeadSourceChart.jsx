import "../styles/LeadSourceChart.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
      <div className="lead-header">
        <div>
          <h2>Lead Sources</h2>
          <p>Traffic Distribution</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
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
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LeadSourceChart;