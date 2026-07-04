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
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Rahul Sharma</td>
                <td>9876543210</td>
                <td>New</td>
                <td>
                  <button>View</button>
                </td>
              </tr>

              <tr>
                <td>Mohit Kumar</td>
                <td>9123456780</td>
                <td>Follow-up</td>
                <td>
                  <button>Edit</button>
                </td>
              </tr>

              <tr>
                <td>Aman Singh</td>
                <td>9988776655</td>
                <td>Closed</td>
                <td>
                  <button>Details</button>
                </td>
              </tr>
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