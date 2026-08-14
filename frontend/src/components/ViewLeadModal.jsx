import "../styles/ViewLeadModal.css";

function ViewLeadModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="modal-overlay">

      <div className="modal-box">

        <div className="modal-header">
          <h2>Lead Details</h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">

          <p>
            <strong>Customer :</strong>
            <span>{lead.customerName}</span>
          </p>

          <p>
            <strong>Company :</strong>
            <span>{lead.company || "-"}</span>
          </p>

          <p>
            <strong>Email :</strong>
            <span>{lead.email || "-"}</span>
          </p>

          <p>
            <strong>Phone :</strong>
            <span>{lead.phone}</span>
          </p>

          <p>
            <strong>Source :</strong>
            <span>{lead.source}</span>
          </p>

          <p>
            <strong>Status :</strong>

            <span className="status-badge">
              {lead.status}
            </span>

          </p>

          <p>
            <strong>Priority :</strong>

            <span className="priority-badge">
              {lead.priority}
            </span>

          </p>

          <p>
            <strong>Lead Value :</strong>

            <span>
              ₹{lead.leadValue?.toLocaleString("en-IN")}
            </span>

          </p>

          <p>
            <strong>Assigned To :</strong>

            <span>
              {lead.assignedTo?.fullName ||
                "Not Assigned"}
            </span>

          </p>

          <p>
            <strong>Follow Up :</strong>

            <span>
              {lead.followUpDate
                ? new Date(
                    lead.followUpDate
                  ).toLocaleDateString("en-IN")
                : "Not Scheduled"}
            </span>

          </p>

          <p>
            <strong>Next Call :</strong>

            <span>
              {lead.nextCallDate
                ? new Date(
                    lead.nextCallDate
                  ).toLocaleDateString("en-IN")
                : "Not Scheduled"}
            </span>

          </p>

          <p>
            <strong>Created :</strong>

            <span>
              {new Date(
                lead.createdAt
              ).toLocaleString("en-IN")}
            </span>

          </p>

          <p>
            <strong>Updated :</strong>

            <span>
              {new Date(
                lead.updatedAt
              ).toLocaleString("en-IN")}
            </span>

          </p>

          <p>
            <strong>Tags :</strong>

            <span>
              {lead.tags?.length
                ? lead.tags.join(", ")
                : "No Tags"}
            </span>

          </p>

          <h3 className="timeline-title">
            Activity Timeline
          </h3>

          <div className="timeline-box">
            
          </div>
                      {lead.timeline?.length > 0 ? (

              lead.timeline
                .slice()
                .reverse()
                .map((item, index) => (

                  <div
                    className="timeline-item"
                    key={index}
                  >

                    <div className="timeline-action">
                      {item.action}
                    </div>

                    <div className="timeline-user">
                      By :
                      {" "}
                      {item.performedBy?.fullName ||
                        "System"}
                    </div>

                    <div className="timeline-date">
                      {new Date(
                        item.createdAt
                      ).toLocaleString("en-IN")}
                    </div>

                  </div>

                ))

            ) : (

              <div className="timeline-item">

                <div className="timeline-action">
                  No Activity Found
                </div>

              </div>

            )}

          </div>

        </div>

      </div>

   
  );
}

export default ViewLeadModal;