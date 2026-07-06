import "../styles/Leads.css";

function Leads() {
  return (
    <div className="leads-page">

      <div className="leads-header">
        <div>
          <h1>Leads</h1>
          <p>Manage all your sales leads from one place.</p>
        </div>

        <button className="add-btn">
          + Add Lead
        </button>
      </div>

      {/* Stats */}

      <div className="lead-stats">

        <div className="lead-stat-card">
          <h2>245</h2>
          <span>Total Leads</span>
        </div>

        <div className="lead-stat-card">
          <h2>58</h2>
          <span>New</span>
        </div>

        <div className="lead-stat-card">
          <h2>42</h2>
          <span>Follow Up</span>
        </div>

        <div className="lead-stat-card">
          <h2>16</h2>
          <span>Closed</span>
        </div>

      </div>

      {/* Table Placeholder */}

      <div className="lead-table">

        <h2>Lead List</h2>

        <p>
          Table will come here in next step...
        </p>

      </div>

    </div>
  );
}

export default Leads;