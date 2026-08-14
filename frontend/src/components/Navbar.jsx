import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Navbar.css";
import {
  MdSearch,
  MdPeople,
  MdSettings,
  MdLogout,
  MdDarkMode,
  MdLightMode,
  MdMenu,
} from "react-icons/md";
import NotificationBell from "../components/NotificationBell";
import { useDashboardFilter } from "../hooks/useDashboardFilter";
import { useTheme } from "../hooks/useTheme";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const { days, setDays } = useDashboardFilter();

  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    navigate(`/leads?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="navbar">
      <button className="hamburger-btn" onClick={onMenuClick}>
        <MdMenu />
      </button>

      <div className="navbar-left">
        <form className="search-box" onSubmit={handleSearch}>
          <MdSearch />
          <input
            type="text"
            placeholder="Search leads, clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        <select
          className="filter-btn"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={1}>Today</option>
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>

        <button
          className="export-btn"
          onClick={() => navigate("/leads")}
        >
          <MdPeople />
          Leads
        </button>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
        </button>

        <NotificationBell />

        <div className="profile-wrapper" ref={profileRef}>
          <div
            className="profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              {user?.fullName?.charAt(0) || "?"}
            </div>

            <div>
              <h4>{user?.fullName || "Guest"}</h4>
              <p style={{ textTransform: "capitalize" }}>
                {user?.role || ""}
              </p>
            </div>
          </div>

          {profileOpen && (
            <div className="profile-dropdown">
              <button
                onClick={() => {
                  setProfileOpen(false);

                  navigate("/profile");
                }}
              >
                <MdSettings />
                My Profile
              </button>

              <button onClick={handleLogout}>
                <MdLogout />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
