import {
  MdBusiness,
  MdEmail,
  MdPhone,
  MdSource,
  MdPerson,
  MdCalendarToday,
  MdEventAvailable,
  MdUpdate,
  MdAttachMoney,
  MdLocalOffer,
} from "react-icons/md";

import "../styles/ViewLeadModal.css";

function ViewLeadModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2>Lead Profile</h2>
            <p>Sales CRM Professional View</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="customer-profile">
            <div className="customer-avatar">
              {lead.customerName?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{lead.customerName}</h2>

              <div className="badge-row">
                <span
                  className={`status-badge ${lead.status
                    ?.toLowerCase()
                    .replace(/\s/g, "")}`}
                >
                  {lead.status}
                </span>

                <span
                  className={`type-badge ${lead.priority?.toLowerCase()}`}
                >
                  {lead.priority} Priority
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <MdAttachMoney />
              <h3>₹{(lead.leadValue || 0).toLocaleString("en-IN")}</h3>
              <span>Lead Value</span>
            </div>

            <div className="stat-card">
              <MdEventAvailable />
              <h3>
                {lead.followUpDate
                  ? new Date(lead.followUpDate).toLocaleDateString("en-IN")
                  : "Not Scheduled"}
              </h3>
              <span>Follow Up</span>
            </div>

            <div className="stat-card">
              <MdCalendarToday />
              <h3>{new Date(lead.createdAt).toLocaleDateString("en-IN")}</h3>
              <span>Created</span>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <MdBusiness />
              <div>
                <span>Company</span>
                <h4>{lead.company || "-"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdEmail />
              <div>
                <span>Email</span>
                <h4>{lead.email || "-"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdPhone />
              <div>
                <span>Phone</span>
                <h4>{lead.phone}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdSource />
              <div>
                <span>Source</span>
                <h4>{lead.source}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdPerson />
              <div>
                <span>Assigned To</span>
                <h4>{lead.assignedTo?.fullName || "Not Assigned"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdCalendarToday />
              <div>
                <span>Next Call</span>
                <h4>
                  {lead.nextCallDate
                    ? new Date(lead.nextCallDate).toLocaleDateString("en-IN")
                    : "Not Scheduled"}
                </h4>
              </div>
            </div>

            <div className="detail-card">
              <MdUpdate />
              <div>
                <span>Last Updated</span>
                <h4>{new Date(lead.updatedAt).toLocaleDateString("en-IN")}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdLocalOffer />
              <div>
                <span>Tags</span>
                <h4>{lead.tags?.length ? lead.tags.join(", ") : "No Tags"}</h4>
              </div>
            </div>
          </div>

          <h3 className="timeline-title">Activity Timeline</h3>

          <div className="timeline-box">
            {lead.timeline?.length > 0 ? (
              lead.timeline
                .slice()
                .reverse()
                .map((item, index) => (
                  <div className="timeline-item" key={index}>
                    <div className="timeline-action">{item.action}</div>

                    <div className="timeline-user">
                      By {item.performedBy?.fullName || "System"}
                    </div>

                    <div className="timeline-date">
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
            ) : (
              <div className="timeline-item">
                <div className="timeline-action">No Activity Found</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewLeadModal;
