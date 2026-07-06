import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdAssignment,
  MdAttachMoney,
  MdDescription,
  MdCalendarMonth,
  MdTask,
  MdBarChart,
  MdSettings,
} from "react-icons/md";

import { NavLink } from "react-router-dom";

import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">SC</div>

        <div>
          <h2>Sales CRM</h2>
          <p>Admin Panel</p>
        </div>
      </div>

      <hr />

      <p className="menu-title">MAIN</p>

      <ul>
        <li>
          <NavLink to="/dashboard">
            <MdDashboard />
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/analytics">
            <MdBarChart />
            Analytics
          </NavLink>
        </li>
      </ul>

      <p className="menu-title">CRM</p>

      <ul>
        <li>
          <NavLink to="/leads">
            <MdPeople />
            Leads
          </NavLink>
        </li>

        <li>
          <NavLink to="/customers">
            <MdBusinessCenter />
            Customers
          </NavLink>
        </li>

        <li>
          <NavLink to="/deals">
            <MdAttachMoney />
            Deals
          </NavLink>
        </li>

        <li>
          <NavLink to="/pipeline">
            <MdAssignment />
            Pipeline
          </NavLink>
        </li>
      </ul>

      <p className="menu-title">PRODUCTIVITY</p>

      <ul>
        <li>
          <NavLink to="/calendar">
            <MdCalendarMonth />
            Calendar
          </NavLink>
        </li>

        <li>
          <NavLink to="/tasks">
            <MdTask />
            Tasks
          </NavLink>
        </li>

        <li>
          <NavLink to="/documents">
            <MdDescription />
            Documents
          </NavLink>
        </li>
      </ul>

      <p className="menu-title">SYSTEM</p>

      <ul>
        <li>
          <NavLink to="/reports">
            <MdBarChart />
            Reports
          </NavLink>
        </li>

        <li>
          <NavLink to="/settings">
            <MdSettings />
            Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;