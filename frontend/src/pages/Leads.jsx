import LeadTable from "../components/LeadTable";
import AddLeadModal from "../components/AddLeadModal";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import {
  MdFileUpload,
  MdSearch,
  MdFilterList,
  MdPeopleAlt,
  MdFiberNew,
  MdSupportAgent,
  MdCheckCircle,
} from "react-icons/md";
import { getAllLeads, importLeads } from "../services/leadService";
import "../styles/Leads.css";

const CSV_HEADER_MAP = {
  "customer name": "customerName",
  customername: "customerName",
  email: "email",
  phone: "phone",
  company: "company",
  source: "source",
  status: "status",
  priority: "priority",
  "lead value": "leadValue",
  leadvalue: "leadValue",
  region: "region",
};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
      if (char === "\r" && next === "\n") i++;
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [importing, setImporting] = useState(false);

  const [leads, setLeads] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = currentUser?.role === "admin";

  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "All";

  const assignedToFilter = searchParams.get("assignedTo") || "";
  const assignedToName = searchParams.get("name") || "";

  // NEW
  const [showAddModal, setShowAddModal] = useState(false);

  // ================================
  // Load Leads
  // ================================

  const loadLeads = async () => {
    try {
      const res = await getAllLeads(assignedToFilter || undefined);
      setLeads(res.leads);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadLeads();
    })();
  }, [assignedToFilter]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const clearAssignedToFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("assignedTo");
    params.delete("name");
    setSearchParams(params);
  };

  // ================================
  // Search + Filter
  // ================================

  const filteredLeads = leads.filter((lead) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      lead.customerName?.toLowerCase().includes(keyword) ||
      lead.phone?.includes(keyword) ||
      lead.email?.toLowerCase().includes(keyword) ||
      lead.company?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ================================
  // Import CSV
  // ================================

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();

      const rows = parseCSV(text).filter((r) => r.some((c) => c.trim()));

      if (rows.length < 2) {
        toast.error("CSV file has no data rows");

        setImporting(false);

        e.target.value = "";

        return;
      }

      const headers = rows[0].map((h) =>
        h.trim().toLowerCase()
      );

      const leadsToImport = rows.slice(1).map((row) => {
        const lead = {};

        headers.forEach((header, index) => {
          const field = CSV_HEADER_MAP[header];

          if (field) {
            lead[field] = row[index]?.trim();
          }
        });

        if (lead.leadValue) {
          lead.leadValue = Number(lead.leadValue) || 0;
        }

        return lead;
      });

      const res = await importLeads(leadsToImport);

      toast.info(
        `${res.createdCount} lead(s) imported, ${res.failedCount} failed.`
      );

      await loadLeads();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Import Failed");
    }

    setImporting(false);

    e.target.value = "";
  };

  return (
    <div className="leads-page">

      <div className="leads-header">
        <div>
          <h1>{statusFilter === "All" ? "Leads" : `${statusFilter} Leads`}</h1>
          <p>Manage all your sales leads from one place.</p>

          {assignedToFilter && (
            <div className="assigned-filter-chip">
              Filtered by: <strong>{assignedToName || "Team Member"}</strong>
              <button onClick={clearAssignedToFilter} title="Clear filter">
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="leads-header-actions">

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button
            className="add-btn"
            onClick={handleImportClick}
            disabled={importing}
          >
            <MdFileUpload />
            {importing ? "Importing..." : "Import CSV"}
          </button>

          {isAdmin && (
            <button
              className="add-btn"
              onClick={() => navigate("/settings#meta-integration")}
            >
              <FaFacebook />
              Meta Integrate
            </button>
          )}

          <button
            className="add-btn add-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Lead
          </button>

        </div>

      </div>

      {/* Toolbar: Search + Filter */}

      <div className="leads-toolbar">
        <div className="leads-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by Customer, Company, Phone..."
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
          />
        </div>

        <div className="filter-box">
          <MdFilterList />
          <select
            value={statusFilter}
            onChange={(e) => updateParam("status", e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Qualified">Qualified</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>
      </div>

      {/* Stats */}

      <div className="lead-stats">

        <div
          className={`lead-stat-card total ${statusFilter === "All" ? "active" : ""}`}
          onClick={() => updateParam("status", "All")}
        >
          <div className="lead-stat-icon"><MdPeopleAlt /></div>
          <div>
            <h2>{leads.length}</h2>
            <span>{isAdmin ? "Total Leads" : "My Leads"}</span>
          </div>
        </div>

        <div
          className={`lead-stat-card new ${statusFilter === "New" ? "active" : ""}`}
          onClick={() => updateParam("status", "New")}
        >
          <div className="lead-stat-icon"><MdFiberNew /></div>
          <div>
            <h2>{leads.filter((lead) => lead.status === "New").length}</h2>
            <span>New</span>
          </div>
        </div>

        <div
          className={`lead-stat-card contacted ${statusFilter === "Contacted" ? "active" : ""}`}
          onClick={() => updateParam("status", "Contacted")}
        >
          <div className="lead-stat-icon"><MdSupportAgent /></div>
          <div>
            <h2>{leads.filter((lead) => lead.status === "Contacted").length}</h2>
            <span>Contacted</span>
          </div>
        </div>

        <div
          className={`lead-stat-card closed ${statusFilter === "Closed Won" ? "active" : ""}`}
          onClick={() => updateParam("status", "Closed Won")}
        >
          <div className="lead-stat-icon"><MdCheckCircle /></div>
          <div>
            <h2>{leads.filter((lead) => lead.status === "Closed Won").length}</h2>
            <span>Closed</span>
          </div>
        </div>

      </div>

      <LeadTable
        leads={filteredLeads}
        refreshLeads={loadLeads}
      />

      {/* Add Lead Modal */}

      <AddLeadModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadLeads();
          setShowAddModal(false);
        }}
      />

    </div>
  );
}

export default Leads;