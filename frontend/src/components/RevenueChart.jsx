import { useEffect, useState } from "react";

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

import { getSalesReport } from "../services/reportService";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function RevenueChart() {
  const [data, setData] = useState([]);

  const [totalRevenue, setTotalRevenue] = useState(0);

  const loadRevenue = async () => {
    try {
      const res = await getSalesReport();

      setTotalRevenue(res.report?.totalRevenue || 0);

      setData(
        (res.report?.monthlyRevenue || []).map((row) => ({
          month: `${MONTH_NAMES[row._id.month - 1]} ${row._id.year}`,
          revenue: row.revenue,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadRevenue();
    })();
  }, []);

  return (
    <div className="revenue-chart">

      <div className="chart-top">
        <div>
          <h2>Revenue Analytics</h2>
          <p>Monthly Revenue Performance</p>
        </div>
      </div>

      <div className="revenue-info">
        <h1>₹{totalRevenue.toLocaleString("en-IN")}</h1>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Revenue",
            ]}
          />

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
