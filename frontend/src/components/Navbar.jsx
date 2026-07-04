import "../styles/Navbar.css";
import {
  MdSearch,
  MdNotifications,
  MdAdd,
  MdEmail,
} from "react-icons/md";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>Dashboard</h2>
        <p>Welcome back, Gaurav 👋</p>
      </div>

      <div className="navbar-center">
        <MdSearch className="search-icon" />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="navbar-right">
        <button className="add-btn">
          <MdAdd /> Add New
        </button>

        <MdEmail className="nav-icon" />
        <MdNotifications className="nav-icon" />

        <div className="profile">
          <div className="avatar">G</div>
          <div>
            <h4>Gaurav</h4>
            <p>Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;