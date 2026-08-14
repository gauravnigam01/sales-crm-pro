import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { deleteLead } from "../services/leadService";
import EditLeadModal from "./EditLeadModal";
import ConfirmDialog from "./ConfirmDialog";
import "./../styles/LeadTable.css";

function LeadTable({ leads, refreshLeads }) {
  const navigate = useNavigate();

  const [editLead, setEditLead] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = currentUser?.role === "admin";

  // ===========================
  // Delete Lead
  // ===========================

  const handleDelete = (lead) => {
    setDeleteTarget(lead);
  };

  const confirmDelete = async () => {
    try {
      await deleteLead(deleteTarget._id);

      toast.success("Lead Deleted Successfully");

      refreshLeads();

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete Failed");
    }

    setDeleteTarget(null);
  };

  return (
    <div className="lead-table-container">

      <table className="lead-table">

        <thead>
          <tr>
            <th>Customer</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Source</th>
            <th>Region</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Lead Value</th>
            <th>Assigned To</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {leads.length === 0 ? (

            <tr>
              <td colSpan="10" className="no-data">
                No Leads Found
              </td>
            </tr>

          ) : (

            leads.map((lead) => (

              <tr key={lead._id}>

                <td>
                  <div
                    className="customer-info"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                  >

                    <div className="avatar">
                      {lead.customerName?.charAt(0)}
                    </div>

                    <div>
                      <strong>{lead.customerName}</strong>
                      <p>{lead.email}</p>
                    </div>

                  </div>
                </td>

                <td>{lead.company}</td>

                <td>{lead.phone}</td>

                <td>{lead.source}</td>

                <td>{lead.region || "Not Specified"}</td>

                <td>
                  <span
                    className={`status ${lead.status
                      .toLowerCase()
                      .replace(/\s/g, "")}`}
                  >
                    {lead.status}
                  </span>
                </td>

                <td>
                  <span
                    className={`priority ${lead.priority.toLowerCase()}`}
                  >
                    {lead.priority}
                  </span>
                </td>

                <td>
                  ₹{lead.leadValue?.toLocaleString("en-IN")}
                </td>

                <td>
                  {lead.assignedTo?.fullName || "Not Assigned"}
                </td>

                <td>
                  {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="view-btn"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      View
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => setEditLead(lead)}
                    >
                      Edit
                    </button>

                    {isAdmin && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(lead)}
                      >
                        Delete
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      {/* Edit Lead */}

      <EditLeadModal
        lead={editLead}
        onClose={() => setEditLead(null)}
        onSuccess={refreshLeads}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.customerName}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

    </div>
  );
}

export default LeadTable;