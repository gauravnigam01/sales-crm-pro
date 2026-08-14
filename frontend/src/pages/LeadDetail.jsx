import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

import {
  getLeadById,
  updateLead,
  deleteLead,
  logLeadActivity,
} from "../services/leadService";
import { getAllUsers } from "../services/userService";
import { sendWhatsAppMessage } from "../services/whatsappService";

import ViewLeadModal from "../components/ViewLeadModal";
import ConfirmDialog from "../components/ConfirmDialog";

import "../styles/LeadDetail.css";
import "../styles/AddTaskModal.css";

function LeadDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [lead, setLead] = useState(null);

  const [users, setUsers] = useState([]);

  const [showProfile, setShowProfile] = useState(false);

  const [showBrief, setShowBrief] = useState(false);

  const [selectedAssignee, setSelectedAssignee] = useState("");

  const [assigning, setAssigning] = useState(false);

  const [sendingWA, setSendingWA] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadLead = async () => {
    try {
      const res = await getLeadById(id);

      setLead(res.lead);
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Load Lead");

      navigate("/leads");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();

      setUsers(res.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadLead();

      await loadUsers();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    (async () => {
      if (lead) {
        setSelectedAssignee(lead.assignedTo?._id || "");
      }
    })();
  }, [lead]);

  if (!lead) {
    return (
      <div className="lead-detail-page">
        <p>Loading...</p>
      </div>
    );
  }

  const waLink = (message) => {
    const phone = lead.phone?.replace(/\D/g, "");

    const text = message ? `?text=${encodeURIComponent(message)}` : "";

    return `https://wa.me/91${phone}${text}`;
  };

  const handleTemperatureChange = async (e) => {
    try {
      const res = await updateLead(id, { temperature: e.target.value });

      setLead(res.lead);
    } catch (error) {
      console.log(error);

      toast.error("Failed to Update Temperature");
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedAssignee) return;

    setAssigning(true);

    try {
      const res = await updateLead(id, { assignedTo: selectedAssignee });

      setLead(res.lead);

      toast.success(`Lead Assigned to ${res.lead.assignedTo?.fullName || "user"} ✅`);
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Assign Lead");
    }

    setAssigning(false);
  };

  const assigneeChanged = selectedAssignee !== (lead.assignedTo?._id || "");

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteLead = async () => {
    try {
      await deleteLead(id);

      toast.success("Lead Deleted Successfully");

      navigate("/leads");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Delete Lead");
    }

    setShowDeleteConfirm(false);
  };

  const handleQuickAction = async (action) => {
    try {
      const res = await logLeadActivity(id, action);

      setLead(res.lead);
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Log Activity");
    }
  };

  const hasActivity = (action) =>
    lead.timeline?.some((t) => t.action === action);

  const handleAutoSendWA = async () => {
    const message = window.prompt(
      "WhatsApp message bhejo:",
      `Hi ${lead.customerName}, this is regarding your enquiry.`
    );

    if (!message) return;

    setSendingWA(true);

    try {
      await sendWhatsAppMessage(lead.phone, message, lead._id);

      const res = await logLeadActivity(id, "WhatsApp Sent");

      setLead(res.lead);

      toast.success("WhatsApp Message Sent ✅");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to Send. Check if WhatsApp is connected (Settings → WhatsApp Inbox)."
      );
    }

    setSendingWA(false);
  };

  return (
    <div className="lead-detail-page">
      <button className="back-btn" onClick={() => navigate("/leads")}>
        ← Back
      </button>

      <div className="lead-detail-card">
        <div className="lead-detail-top">
          <div className="lead-detail-name">
            <div className="avatar-icon">👤</div>

            <h1>{lead.customerName}</h1>
          </div>

          <div className="lead-detail-actions">
            <select
              className="temp-select"
              value={lead.temperature || "Warm"}
              onChange={handleTemperatureChange}
            >
              <option value="Cold">🧊 Cold</option>
              <option value="Warm">🌤️ Warm</option>
              <option value="Hot">🔥 Hot</option>
            </select>

            <a
              className="wa-btn"
              href={waLink()}
              target="_blank"
              rel="noreferrer"
            >
              💬 WA
            </a>

            <button className="icon-delete-btn" onClick={handleDelete}>
              🗑️
            </button>
          </div>
        </div>

        <div className="lead-meta-row">
          <span>📱 {lead.phone}</span>

          <span>⭐ {lead.priority} Priority</span>

          <span>💰 ₹{(lead.leadValue || 0).toLocaleString("en-IN")}</span>
        </div>

        <div className="lead-tags-row">
          {lead.company && <span>🏢 {lead.company}</span>}

          <span>📍 {lead.region || "Not Specified"}</span>

          <span>📢 {lead.source}</span>
        </div>

        {lead.metaLeadgenId && (
          <div className="meta-banner">
            📘 Meta Lead Ads se aaya (leadgen_id: {lead.metaLeadgenId})
          </div>
        )}

        <div className="assign-row">
          <label>👤 Assigned:</label>

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
          >
            <option value="" disabled>
              Not Assigned
            </option>

            {users
              .filter((u) => u.role !== "admin")
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName}
                </option>
              ))}
          </select>

          <button
            className="assign-confirm-btn"
            onClick={handleConfirmAssign}
            disabled={!assigneeChanged || assigning}
          >
            {assigning ? "Assigning..." : "✅ Assign"}
          </button>
        </div>

        <div className="quick-actions-row">
          <button
            className={`quick-action-btn ${
              hasActivity("Call Done") ? "done" : ""
            }`}
            onClick={() => handleQuickAction("Call Done")}
          >
            📞 Call Done {hasActivity("Call Done") ? "✓" : ""}
          </button>

          <button
            className={`quick-action-btn ${lead.whatsappSent ? "done" : ""}`}
            onClick={() => handleQuickAction("WhatsApp Sent")}
          >
            💬 WA Sent {lead.whatsappSent ? "✓" : ""}
          </button>

          <button
            className={`quick-action-btn ${
              hasActivity("Meeting Done") ? "done" : ""
            }`}
            onClick={() => handleQuickAction("Meeting Done")}
          >
            🤝 Meeting Done {hasActivity("Meeting Done") ? "✓" : ""}
          </button>
        </div>

        <div className="bottom-actions-row">
          <button
            className="bottom-action-btn"
            onClick={() => setShowProfile(true)}
          >
            👤 Profile
          </button>

          <a
            className="bottom-action-btn"
            href={waLink(
              `Hi ${lead.customerName}, this is regarding your enquiry.`
            )}
            target="_blank"
            rel="noreferrer"
          >
            💬 WA Msg
          </a>

          <button
            className="bottom-action-btn"
            onClick={handleAutoSendWA}
            disabled={sendingWA}
            title="Seedha connected WhatsApp number se message bhejo"
          >
            🤖 {sendingWA ? "Sending..." : "Auto Send WA"}
          </button>

          <button
            className="bottom-action-btn"
            onClick={() => setShowBrief(true)}
          >
            💼 Quick Brief
          </button>
        </div>
      </div>

      {showProfile && (
        <ViewLeadModal lead={lead} onClose={() => setShowProfile(false)} />
      )}

      {showBrief && (
        <div className="modal-overlay" onClick={() => setShowBrief(false)}>
          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Quick Brief</h2>

              <button onClick={() => setShowBrief(false)}>✕</button>
            </div>

            <div className="brief-body">
              <div className="brief-row">
                <span className="label">Customer</span>
                <span className="value">{lead.customerName}</span>
              </div>

              <div className="brief-row">
                <span className="label">Phone</span>
                <span className="value">{lead.phone}</span>
              </div>

              <div className="brief-row">
                <span className="label">Source</span>
                <span className="value">{lead.source}</span>
              </div>

              <div className="brief-row">
                <span className="label">Budget / Value</span>
                <span className="value">
                  ₹{(lead.leadValue || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="brief-row">
                <span className="label">Temperature</span>
                <span className="value">{lead.temperature}</span>
              </div>

              <div className="brief-row">
                <span className="label">Status</span>
                <span className="value">{lead.status}</span>
              </div>

              <div className="brief-row">
                <span className="label">Latest Note</span>
                <span className="value">
                  {lead.notes?.length
                    ? lead.notes[lead.notes.length - 1].text
                    : "No Notes Yet"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead.customerName}"?`}
        onConfirm={confirmDeleteLead}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default LeadDetail;
