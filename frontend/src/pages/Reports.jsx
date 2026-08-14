import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  getSalesReport,
  getLeadReport,
  getAgentReport,
  getTaskReport,
} from "../services/reportService";

import "../styles/Reports.css";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function Reports() {
  const [sales, setSales] = useState(null);

  const [leads, setLeads] = useState(null);

  const [agents, setAgents] = useState([]);

  const [tasks, setTasks] = useState(null);

  const loadReports = async () => {
    try {
      const [salesRes, leadRes, agentRes, taskRes] = await Promise.all([
        getSalesReport(),
        getLeadReport(),
        getAgentReport(),
        getTaskReport(),
      ]);

      setSales(salesRes.report);

      setLeads(leadRes.report);

      setAgents(agentRes.agents || []);

      setTasks(taskRes.report);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadReports();
    })();
  }, []);

  const revenueData =
    sales?.monthlyRevenue?.map((row) => ({
      month: `${MONTH_NAMES[row._id.month - 1]} ${String(
        row._id.year
      ).slice(2)}`,
      revenue: row.revenue,
    })) || [];

  const sourceData =
    leads?.leadsBySource?.map((row) => ({
      source: row._id,
      count: row.count,
    })) || [];

  const statusData =
    leads?.leadsByStatus?.map((row) => ({
      status: row._id,
      count: row.count,
    })) || [];

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>

        <p>Sales, Leads, Agents & Task Performance</p>
      </div>

      {/* Headline Stats */}
      <div className="report-stats">
        <div className="stat-card">
          <h2>₹{(sales?.totalRevenue || 0).toLocaleString("en-IN")}</h2>

          <p>Total Revenue</p>
        </div>

        <div className="stat-card">
          <h2>{sales?.winRate ?? 0}%</h2>

          <p>Deal Win Rate</p>
        </div>

        <div className="stat-card">
          <h2>{leads?.conversionRate ?? 0}%</h2>

          <p>Lead Conversion Rate</p>
        </div>

        <div className="stat-card">
          <h2>{sales?.openDeals ?? 0}</h2>

          <p>Open Deals</p>
        </div>
      </div>

      {/* Charts */}
      <div className="report-grid">
        <div className="report-card">
          <h2>Monthly Revenue</h2>

          <p className="subtitle">Won deal amounts by month</p>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />

              <Bar
                dataKey="revenue"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h2>Leads by Source</h2>

          <p className="subtitle">Where your leads come from</p>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sourceData}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="source"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <Tooltip
                formatter={(value) => [value, "Leads"]}
              />

              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h2>Leads by Status</h2>

          <p className="subtitle">Pipeline position of every lead</p>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="status"
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <Tooltip
                formatter={(value) => [value, "Leads"]}
              />

              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h2>Agent Performance</h2>

          <p className="subtitle">Callers ranked by revenue</p>

          <table className="agents-report-table">
            <thead>
              <tr>
                <th>Agent</th>

                <th className="num">Leads</th>

                <th className="num">Calls</th>

                <th className="num">Won</th>

                <th className="num">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No Agents Found
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent._id}>
                    <td>
                      <div className="agent-name">
                        <div className="agent-avatar">
                          {agent.fullName?.charAt(0)}
                        </div>

                        {agent.fullName}
                      </div>
                    </td>

                    <td className="num">{agent.assignedLeads}</td>

                    <td className="num">{agent.totalCalls}</td>

                    <td className="num">{agent.closedWon}</td>

                    <td className="num">
                      ₹{(agent.revenue || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Summary */}
      <div className="task-report-row">
        <div className="stat-card">
          <h2>{tasks?.totalTasks ?? 0}</h2>

          <p>Total Tasks</p>
        </div>

        <div className="stat-card">
          <h2>{tasks?.pending ?? 0}</h2>

          <p>Pending</p>
        </div>

        <div className="stat-card">
          <h2>{tasks?.inProgress ?? 0}</h2>

          <p>In Progress</p>
        </div>

        <div className="stat-card">
          <h2>{tasks?.completed ?? 0}</h2>

          <p>Completed</p>
        </div>

        <div className="stat-card overdue">
          <h2>{tasks?.overdue ?? 0}</h2>

          <p>Overdue</p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
