import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

import "../styles/MainLayout.css";

function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="dashboard-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;