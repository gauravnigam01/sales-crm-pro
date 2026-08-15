import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesFunnel from "../components/SalesFunnel";
import UpcomingMeetings from "../components/UpcomingMeetings";
import TopAgents from "../components/TopAgents";
import ActivityPanel from "../components/ActivityPanel";
import LeadSourceChart from "../components/LeadSourceChart";
import RevenueChart from "../components/RevenueChart";
import StatCard from "../components/StatCard";

import {
  getDashboardStats,
  getRecentLeads,
} from "../services/dashboardService";

import { useDashboardFilter } from "../hooks/useDashboardFilter";

import "../styles/Dashboard.css";
import {
  MdPeople,
  MdBusinessCenter,
  MdAttachMoney,
  MdTask,
  MdCalendarMonth,
  MdAssignment,
  MdDescription,
  MdCall,
  MdTrendingUp,
  MdVerified,
  MdSchedule,
  MdGroups,
  MdPayments,
} from "react-icons/md";

const formatGrowth = (value) => {
  if (value === undefined || value === null) return "";

  return `${value > 0 ? "+" : ""}${value}%`;
};

function Dashboard() {
  const { days } = useDashboardFilter();

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isCaller = user?.role === "caller";
  const isManager = user?.role === "manager";

  // Revenue/analytics/finance charts are manager+admin territory only —
  // a caller must never see company (or team) financial figures.
  const canViewReports = user?.role === "admin" || isManager;

  // Manager-only "My Data | My Team" toggle
  const [dashScope, setDashScope] = useState("team");

  const [stats, setStats] = useState([]);

  const [recentLeads, setRecentLeads] = useState([]);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats(days, isManager ? dashScope : undefined);

      const s = res.stats;

      const prefix = isCaller ? "My " : "";

      const leadStats = [
        {
          title: isCaller ? "My Leads" : "Total Leads",
          value: s.totalLeads,
          growth: formatGrowth(s.growth?.totalLeads),
          icon: <MdPeople />,
          onClick: () => navigate("/leads"),
          color: "blue",
        },
        {
          title: `${prefix}New Leads`,
          value: s.newLeads,
          growth: "",
          icon: <MdBusinessCenter />,
          onClick: () => navigate("/leads?status=New"),
          color: "green",
        },
        {
          title: `${prefix}Contacted`,
          value: s.contactedLeads,
          growth: "",
          icon: <MdCall />,
          onClick: () => navigate("/leads?status=Contacted"),
          color: "pink",
        },
        {
          title: `${prefix}Interested`,
          value: s.interestedLeads,
          growth: "",
          icon: <MdTrendingUp />,
          onClick: () => navigate("/leads?status=Interested"),
          color: "teal",
        },
        {
          title: `${prefix}Qualified`,
          value: s.qualifiedLeads,
          growth: "",
          icon: <MdVerified />,
          onClick: () => navigate("/leads?status=Qualified"),
          color: "violet",
        },
        {
          title: isCaller ? "My Follow-ups" : "Follow-up",
          value: s.followUpLeads,
          growth: "",
          icon: <MdSchedule />,
          onClick: () => navigate("/leads?status=Follow+Up"),
          color: "rose",
        },
      ];

      // Closed Won/Lost, Revenue and company headcount are financial /
      // company-wide figures — a caller only ever sees their own pipeline
      // funnel, never these.
      const financialStats = isCaller
        ? []
        : [
            {
              title: "Closed Won",
              value: s.closedWon,
              growth: formatGrowth(s.growth?.closedWon),
              icon: <MdAttachMoney />,
              onClick: () => navigate("/leads?status=Closed+Won"),
              color: "amber",
            },
            {
              title: "Closed Lost",
              value: s.closedLost,
              growth: "",
              icon: <MdAssignment />,
              onClick: () => navigate("/leads?status=Closed+Lost"),
              color: "cyan",
            },
            {
              title: isManager ? "Team Revenue" : "Revenue",
              value: `₹${(s.totalRevenue || 0).toLocaleString("en-IN")}`,
              growth: "",
              icon: <MdPayments />,
              onClick: () => navigate("/reports"),
              color: "emerald",
            },
            {
              title: isManager ? "Team Members" : "Callers",
              value: s.totalCallers,
              growth: "",
              icon: <MdPeople />,
              onClick: () => navigate("/users"),
              color: "indigo",
            },
          ];

      const productivityStats = [
        {
          title: isCaller
            ? "My Assigned Customers"
            : isManager
            ? "Team Customers"
            : "Customers",
          value: s.totalCustomers,
          growth: "",
          icon: <MdGroups />,
          onClick: () => navigate("/customers"),
          color: "sky",
        },
        {
          title: `${prefix}Pending Tasks`,
          value: s.pendingTasks,
          growth: "",
          icon: <MdTask />,
          onClick: () => navigate("/tasks?status=Pending"),
          color: "red",
        },
        {
          title: `${prefix}Meetings`,
          value: s.upcomingMeetings,
          growth: "",
          icon: <MdCalendarMonth />,
          onClick: () => navigate("/calendar"),
          color: "purple",
        },
        ...(isCaller
          ? []
          : [
              {
                title: "Documents",
                value: s.totalDocuments,
                growth: "",
                icon: <MdDescription />,
                onClick: () => navigate("/documents"),
                color: "orange",
              },
            ]),
      ];

      setStats([...leadStats, ...financialStats, ...productivityStats]);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRecentLeads = async () => {
    try {
      const res = await getRecentLeads();
      setRecentLeads(res.leads);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadStats(), loadRecentLeads()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, dashScope]);

  return (
    <div>
      {/* Header */}
      <div className="dashboard-title dashboard-title-row">
        <div>
          <h1>Sales Dashboard</h1>
          <p>Welcome back, {user?.fullName || "there"} 👋</p>
        </div>

        {isManager && (
          <div className="dash-scope-toggle">
            <button
              className={dashScope === "mine" ? "active" : ""}
              onClick={() => setDashScope("mine")}
            >
              My Data
            </button>
            <button
              className={dashScope === "team" ? "active" : ""}
              onClick={() => setDashScope("team")}
            >
              My Team
            </button>
          </div>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="card-container">
        {stats.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            growth={item.growth}
            icon={item.icon}
            onClick={item.onClick}
            color={item.color}
          />
        ))}
      </div>

      {/* Charts */}
      {canViewReports && (
        <div className="dashboard-grid">
          <RevenueChart />
          <LeadSourceChart />
        </div>
      )}

      {/* Bottom Section */}
      <div className="bottom-grid">

        {/* LEFT PANEL */}
        <div className="left-panel">

          <div className="recent-leads">
            <h2>Recent Leads</h2>

            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Deal Value</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div className="lead-user">
                        <div className="avatar">
                          {lead.customerName?.charAt(0)}
                        </div>

                        <div>
                          <strong>{lead.customerName}</strong>
                          <br />
                          <small>{lead.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>{lead.phone}</td>

                    <td>₹{lead.leadValue}</td>

                    <td>
                      <span
                        className={`status ${lead.status
                          .toLowerCase()
                          .replace(/\s/g, "")
                          .replace("-", "")}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          navigate(
                            `/leads?search=${encodeURIComponent(
                              lead.customerName
                            )}`
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canViewReports && <SalesFunnel />}

        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <ActivityPanel />
          {canViewReports && <TopAgents />}
          <UpcomingMeetings />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
