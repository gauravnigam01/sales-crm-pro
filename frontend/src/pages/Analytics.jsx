import RevenueChart from "../components/RevenueChart";
import LeadSourceChart from "../components/LeadSourceChart";
import SalesFunnel from "../components/SalesFunnel";
import TopAgents from "../components/TopAgents";
import ActivityPanel from "../components/ActivityPanel";

import "../styles/Dashboard.css";
import "../styles/Analytics.css";

function Analytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>

        <p>Revenue, Pipeline & Team Performance at a Glance</p>
      </div>

      <div className="dashboard-grid">
        <RevenueChart />
        <LeadSourceChart />
      </div>

      <div className="bottom-grid">
        <SalesFunnel />

        <div className="right-panel">
          <TopAgents />
          <ActivityPanel />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
