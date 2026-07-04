import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdAssignment,
  MdSecurity,
  MdAttachMoney,
  MdDescription,
  MdCalendarMonth,
  MdTask,
  MdBarChart,
  MdSettings,
} from "react-icons/md";
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
<ul>
  <p className="menu-title">MAIN</p>
  <li className="active"><MdDashboard /> Dashboard</li>
  <li><MdBarChart /> Analytics</li>

  <p className="menu-title">CRM</p>
  <li><MdPeople /> Leads</li>
  <li><MdBusinessCenter /> Customers</li>
  <li><MdAttachMoney /> Deals</li>
  <li><MdAssignment /> Pipeline</li>

  <p className="menu-title">PRODUCTIVITY</p>
  <li><MdCalendarMonth /> Calendar</li>
  <li><MdTask /> Tasks</li>
  <li><MdDescription /> Documents</li>

  <p className="menu-title">SYSTEM</p>
  <li><MdBarChart /> Reports</li>
  <li><MdSettings /> Settings</li>
</ul>
    </div>
  );
}

export default Sidebar;