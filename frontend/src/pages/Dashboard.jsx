import ActivityPanel from "../components/ActivityPanel";
import LeadSourceChart from "../components/LeadSourceChart";
import RevenueChart from "../components/RevenueChart";
import StatCard from "../components/StatCard";
import "../styles/Dashboard.css";

import {
  MdPeople,
  MdBusinessCenter,
  MdAttachMoney,
  MdTask,
} from "react-icons/md";
const recentLeads = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    value: "₹45,000",
    status: "New",
    date: "Today",
  },
  {
    id: 2,
    name: "Mohit Kumar",
    email: "mohit@gmail.com",
    phone: "9123456780",
    value: "₹72,000",
    status: "Follow-up",
    date: "Yesterday",
  },
  {
    id: 3,
    name: "Aman Singh",
    email: "aman@gmail.com",
    phone: "9988776655",
    value: "₹30,000",
    status: "Qualified",
    date: "2 Days Ago",
  },
  {
    id: 4,
    name: "Vivek Sharma",
    email: "vivek@gmail.com",
    phone: "9012345678",
    value: "₹90,000",
    status: "Closed",
    date: "Last Week",
  },
];

function Dashboard() {
  return (
    <div>
      {/* Dashboard Title */}
      <div className="dashboard-title">
        <h1>Dashboard</h1>
        <p>Welcome back, Gaurav 👋</p>
      </div>

      {/* Dashboard Cards */}
      <div className="card-container">
        <StatCard
          title="Total Leads"
          value="245"
          growth="+12%"
          icon={<MdPeople color="#2563eb" />}
        />

        <StatCard
          title="Customers"
          value="58"
          growth="+8%"
          icon={<MdBusinessCenter color="#10b981" />}
        />

        <StatCard
          title="Revenue"
          value="₹85K"
          growth="+18%"
          icon={<MdAttachMoney color="#f59e0b" />}
        />

        <StatCard
          title="Pending Tasks"
          value="12"
          growth="+3%"
          icon={<MdTask color="#ef4444" />}
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid">
        <RevenueChart />
        <LeadSourceChart />
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Recent Leads */}
        <div className="recent-leads">
          <h2>Recent Leads</h2>

          <table>
            <thead>
  <tr>
    <th>Customer</th>
    <th>Phone</th>
    <th>Deal Value</th>
    <th>Status</th>
    <th>Last Contact</th>
    <th>Action</th>
  </tr>
</thead>

            <tbody>
  {recentLeads.map((lead) => (
    <tr key={lead.id}>
      <td>
        <div className="lead-user">
          <div className="avatar">
            {lead.name.charAt(0)}
          </div>

          <div>
            <strong>{lead.name}</strong>
            <br />
            <small>{lead.email}</small>
          </div>
        </div>
      </td>

      <td>{lead.phone}</td>

      <td>{lead.value}</td>

      <td>
        <span
          className={`status ${lead.status
            .toLowerCase()
            .replace("-", "")}`}
        >
          {lead.status}
        </span>
      </td>

      <td>{lead.date}</td>

      <td>
        <button>View</button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

        {/* Activity Panel */}
        <ActivityPanel />
      </div>
    </div>
  );
}

export default Dashboard;