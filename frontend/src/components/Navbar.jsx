import "../styles/Navbar.css";
import {
  MdSearch,
  MdNotificationsNone,
  MdKeyboardArrowDown,
  MdFileDownload,
} from "react-icons/md";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="search-box">
          <MdSearch />
          <input type="text" placeholder="Search leads, clients..." />
        </div>
      </div>

      <div className="navbar-right">
        <button className="filter-btn">
          Last 30 Days
          <MdKeyboardArrowDown />
        </button>

        <button className="export-btn">
          <MdFileDownload />
          Export
        </button>

        <div className="notification">
          <MdNotificationsNone />
          <span className="badge">3</span>
        </div>

        <div className="profile">
          <div className="avatar">G</div>

          <div>
            <h4>Gaurav</h4>
            <p>Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;