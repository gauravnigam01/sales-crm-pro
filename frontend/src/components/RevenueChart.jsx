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

      <div className="chart-top">
        <div>
          <h2>Revenue Analytics</h2>
          <p>Monthly Revenue Performance</p>
        </div>

        <button className="chart-btn">
          Monthly
        </button>
      </div>

      <div className="revenue-info">
        <h1>₹8,10,000</h1>
        <span>↑ 18.4% this month</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={4}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default RevenueChart;