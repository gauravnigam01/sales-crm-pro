import "./../styles/RevenueChart.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3200 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4700 },
  { month: "May", revenue: 6500 },
  { month: "Jun", revenue: 7200 },
  { month: "Jul", revenue: 8100 },
];

function RevenueChart() {
  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h2>Revenue Analytics</h2>
        <p>Last 7 Months</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;