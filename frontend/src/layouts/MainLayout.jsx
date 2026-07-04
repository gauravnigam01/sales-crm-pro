import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Dashboard from "../pages/Dashboard";
import "../styles/MainLayout.css";

function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="dashboard-wrapper">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;