import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

import { DashboardFilterProvider } from "../context/DashboardFilterContext";

import "../styles/MainLayout.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > 1024
  );

  const isMobile = window.innerWidth <= 1024;

  return (
    <DashboardFilterProvider>
      <div className="layout">
        <Sidebar
          open={sidebarOpen}
          onNavigate={() => isMobile && setSidebarOpen(false)}
        />

        <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <div className="dashboard-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </DashboardFilterProvider>
  );
}

export default MainLayout;