import {
  MdEmail,
  MdPhone,
  MdBusiness,
  MdLocationOn,
  MdAttachMoney,
  MdCalendarToday,
  MdPerson,
  MdWorkspacePremium,
} from "react-icons/md";

import "../styles/ViewCustomerModal.css";

function ViewCustomerModal({
  customer,
  onClose,
}) {

  if (!customer) return null;

  return (

    <div className="modal-overlay">

      <div className="modal-box">

        <div className="modal-header">

          <div>

            <h2>Customer Profile</h2>

            <p>Sales CRM Professional View</p>

          </div>

          <button onClick={onClose}>

            ✕

          </button>

        </div>

        <div className="modal-content">

          <div className="customer-profile">

            <div className="customer-avatar">

              {customer.customerName
                ?.charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <h2>

                {customer.customerName}

              </h2>

              <div className="badge-row">

                <span
                  className={`status-badge ${customer.status
                    ?.toLowerCase()
                    .replace(/\s/g,"")}`}
                >

                  {customer.status}

                </span>

                <span
                  className={`type-badge ${(customer.customerType || "Regular")
                    .toLowerCase()}`}
                >

                  {customer.customerType || "Regular"}

                </span>

              </div>

            </div>

          </div>

          <div className="stats-grid">

            <div className="stat-card">

              <MdAttachMoney />

              <h3>

                ₹
                {(customer.revenue || 0)
                  .toLocaleString("en-IN")}

              </h3>

              <span>Total Revenue</span>

            </div>

            <div className="stat-card">

              <MdWorkspacePremium />

              <h3>

                ★★★★☆

              </h3>

              <span>Loyal Customer</span>

            </div>

            <div className="stat-card">

              <MdCalendarToday />

              <h3>

                {new Date(
                  customer.createdAt
                ).toLocaleDateString("en-IN")}

              </h3>

              <span>Customer Since</span>

            </div>

          </div>

          <div className="details-grid">
                        <div className="detail-card">

              <MdEmail />

              <div>

                <span>Email</span>

                <h4>

                  {customer.email || "-"}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdPhone />

              <div>

                <span>Phone</span>

                <h4>

                  {customer.phone}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdBusiness />

              <div>

                <span>Company</span>

                <h4>

                  {customer.company || "-"}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdLocationOn />

              <div>

                <span>Address</span>

                <h4>

                  {customer.address || "-"}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdLocationOn />

              <div>

                <span>City</span>

                <h4>

                  {customer.city || "-"}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdLocationOn />

              <div>

                <span>State</span>

                <h4>

                  {customer.state || "-"}

                </h4>

              </div>

            
          </div>
                      <div className="detail-card">

              <MdLocationOn />

              <div>

                <span>Country</span>

                <h4>

                  {customer.country || "-"}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdPerson />

              <div>

                <span>Assigned To</span>

                <h4>

                  {customer.assignedTo?.fullName ||
                    "Not Assigned"}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdCalendarToday />

              <div>

                <span>Created</span>

                <h4>

                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString("en-IN")}

                </h4>

              </div>

            </div>

            <div className="detail-card">

              <MdCalendarToday />

              <div>

                <span>Last Updated</span>

                <h4>

                  {new Date(
                    customer.updatedAt
                  ).toLocaleDateString("en-IN")}

                </h4>

              </div>

            </div>

          </div>

          <div className="customer-footer">

            <div>

              <strong>Tags :</strong>{" "}

              {customer.tags?.length
                ? customer.tags.join(", ")
                : "No Tags"}

            </div>

            <div>

              <strong>Timeline :</strong>{" "}

              {customer.timeline?.length || 0} Activities

            </div>

          </div>
                  </div>

      </div>

    </div>

  );

}

export default ViewCustomerModal;