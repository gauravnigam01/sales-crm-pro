import {
  MdCategory,
  MdSchedule,
  MdComputer,
  MdPerson,
  MdAttachMoney,
  MdCalendarToday,
  MdGroups,
  MdEventSeat,
} from "react-icons/md";

function ViewCourseModal({ course, onClose }) {
  if (!course) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2>Course Details</h2>
            <p>Sales CRM Course Profile</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="customer-profile">
            <div className="customer-avatar">
              {course.courseName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{course.courseName}</h2>
              <div className="badge-row">
                <span
                  className={`status-badge ${course.status?.toLowerCase()}`}
                >
                  {course.status}
                </span>
                <span className={`type-badge ${course.mode?.toLowerCase()}`}>
                  {course.mode}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <MdAttachMoney />
              <h3>₹{(course.finalFee || 0).toLocaleString("en-IN")}</h3>
              <span>Final Fee</span>
            </div>

            <div className="stat-card">
              <MdGroups />
              <h3>{course.enrolledStudents ?? 0}</h3>
              <span>Enrolled Students</span>
            </div>

            <div className="stat-card">
              <MdEventSeat />
              <h3>{course.availableSeats ?? course.totalSeats ?? 0}</h3>
              <span>Available Seats</span>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <MdCategory />
              <div>
                <span>Category</span>
                <h4>{course.category || "-"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdSchedule />
              <div>
                <span>Duration</span>
                <h4>{course.duration || "-"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdComputer />
              <div>
                <span>Mode</span>
                <h4>{course.mode || "-"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdPerson />
              <div>
                <span>Trainer</span>
                <h4>{course.trainer || "-"}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdAttachMoney />
              <div>
                <span>Course Fee</span>
                <h4>₹{(course.courseFee || 0).toLocaleString("en-IN")}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdAttachMoney />
              <div>
                <span>Discount</span>
                <h4>₹{(course.discount || 0).toLocaleString("en-IN")}</h4>
              </div>
            </div>

            <div className="detail-card">
              <MdAttachMoney />
              <div>
                <span>Installment</span>
                <h4>
                  {course.installmentAvailable
                    ? `Yes (₹${(course.installmentAmount || 0).toLocaleString(
                        "en-IN"
                      )})`
                    : "No"}
                </h4>
              </div>
            </div>

            <div className="detail-card">
              <MdCalendarToday />
              <div>
                <span>Start Date</span>
                <h4>
                  {course.startDate
                    ? new Date(course.startDate).toLocaleDateString("en-IN")
                    : "-"}
                </h4>
              </div>
            </div>

            <div className="detail-card">
              <MdCalendarToday />
              <div>
                <span>End Date</span>
                <h4>
                  {course.endDate
                    ? new Date(course.endDate).toLocaleDateString("en-IN")
                    : "-"}
                </h4>
              </div>
            </div>

            <div className="detail-card">
              <MdEventSeat />
              <div>
                <span>Total Seats</span>
                <h4>{course.totalSeats ?? 0}</h4>
              </div>
            </div>
          </div>

          <div className="customer-footer">
            <div>
              <strong>Description:</strong> {course.description || "No description"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCourseModal;
