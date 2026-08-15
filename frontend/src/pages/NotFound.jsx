import { useNavigate } from "react-router-dom";
import { MdBolt } from "react-icons/md";

import "../styles/NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-glow"></div>

      <div className="notfound-icon">
        <MdBolt />
      </div>

      <h1>404</h1>
      <p>This page doesn't exist or has been moved.</p>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default NotFound;
