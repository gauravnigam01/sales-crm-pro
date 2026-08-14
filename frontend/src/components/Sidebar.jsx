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
  MdAdminPanelSettings,
  MdEmojiEvents,
  MdBolt,
  MdFlashOn,
  MdSchedule,
  MdCall,
  MdWhatsapp,
  MdEmail,
  MdNotifications,
} from "react-icons/md";

import { NavLink } from "react-router-dom";

import "../styles/Sidebar.css";

function Sidebar({ open, onNavigate }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Deals, Pipeline, Analytics, Reports and Team Performance are
  // manager+admin territory — hard-hidden from callers regardless of any
  // per-user permission toggle (the backend enforces this the same way).
  const canViewManagerTier =
    user?.role === "admin" || user?.role === "manager";

  const canViewReports = canViewManagerTier;

  const canViewUsers =
    user?.role === "admin" || user?.role === "manager";

  const isAdmin = user?.role === "admin";

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onNavigate}></div>}

      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <MdBolt />
          </div>

          <div>
            <h2>Sales CRM</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <p className="menu-title">MAIN</p>

        <ul>
          <li>
            <NavLink to="/dashboard" onClick={onNavigate}>
              <MdDashboard />
              Dashboard
            </NavLink>
          </li>

          {canViewManagerTier && (
            <li>
              <NavLink to="/analytics" onClick={onNavigate}>
                <MdBarChart />
                Analytics
              </NavLink>
            </li>
          )}
        </ul>

        <p className="menu-title">CRM</p>

        <ul>
          <li>
            <NavLink to="/leads" onClick={onNavigate}>
              <MdPeople />
              Leads
            </NavLink>
          </li>

          <li>
            <NavLink to="/customers" onClick={onNavigate}>
              <MdBusinessCenter />
              Customers
            </NavLink>
          </li>

          {canViewManagerTier && (
            <li>
              <NavLink to="/deals" onClick={onNavigate}>
                <MdAttachMoney />
                Deals
              </NavLink>
            </li>
          )}

          {canViewManagerTier && (
            <li>
              <NavLink to="/pipeline" onClick={onNavigate}>
                <MdAssignment />
                Pipeline
              </NavLink>
            </li>
          )}
        </ul>

        <p className="menu-title">PRODUCTIVITY</p>

        <ul>
          <li>
            <NavLink to="/calendar" onClick={onNavigate}>
              <MdCalendarMonth />
              Calendar
            </NavLink>
          </li>

          <li>
            <NavLink to="/tasks" onClick={onNavigate}>
              <MdTask />
              Tasks
            </NavLink>
          </li>

          <li>
            <NavLink to="/followups" onClick={onNavigate}>
              <MdSchedule />
              Follow-ups
            </NavLink>
          </li>

          <li>
            <NavLink to="/calls" onClick={onNavigate}>
              <MdCall />
              Calls
            </NavLink>
          </li>

          <li>
            <NavLink to="/documents" onClick={onNavigate}>
              <MdDescription />
              Documents
            </NavLink>
          </li>
        </ul>

        <p className="menu-title">INBOX</p>

        <ul>
          <li>
            <NavLink to="/whatsapp-inbox" onClick={onNavigate}>
              <MdWhatsapp />
              WhatsApp Inbox
            </NavLink>
          </li>

          <li>
            <NavLink to="/email-inbox" onClick={onNavigate}>
              <MdEmail />
              Email Inbox
            </NavLink>
          </li>

          <li>
            <NavLink to="/notifications" onClick={onNavigate}>
              <MdNotifications />
              Notifications
            </NavLink>
          </li>
        </ul>

        <p className="menu-title">SYSTEM</p>

        <ul>
          {canViewUsers && (
            <li>
              <NavLink to="/users" onClick={onNavigate}>
                <MdAdminPanelSettings />
                Users
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <NavLink to="/automation" onClick={onNavigate}>
                <MdFlashOn />
                Automation
              </NavLink>
            </li>
          )}
          {canViewReports && (
            <li>
              <NavLink to="/teams" onClick={onNavigate}>
                <MdEmojiEvents />
                Teams
              </NavLink>
            </li>
          )}
          {canViewReports && (
            <li>
              <NavLink to="/reports" onClick={onNavigate}>
                <MdBarChart />
                Reports
              </NavLink>
            </li>
          )}

          <li>
            <NavLink to="/settings" onClick={onNavigate}>
              <MdSettings />
              Settings
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
