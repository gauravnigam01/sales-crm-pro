import { useEffect, useState } from "react";
import {
  MdSearch,
  MdFilterList,
  MdHowToReg,
  MdCheckCircle,
  MdPending,
  MdCancel,
} from "react-icons/md";

import { getAllEnrollments } from "../services/enrollmentService";
import EnrollmentTable from "../components/EnrollmentTable";
import AddEnrollmentModal from "../components/AddEnrollmentModal";

import "../styles/Courses.css";
import "../styles/Enrollments.css";

function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = async () => {
    setLoading(true);

    try {
      const res = await getAllEnrollments();
      setEnrollments(res.enrollments);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadEnrollments();
    })();
  }, []);

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      enrollment.studentName?.toLowerCase().includes(keyword) ||
      enrollment.course?.courseName?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || enrollment.enrollmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>Enrollments</h1>
          <p>Manage student enrollments across all courses.</p>
        </div>

        <button className="add-btn" onClick={() => setOpenModal(true)}>
          + Add Enrollment
        </button>
      </div>

      <div className="courses-toolbar">
        <div className="courses-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by Student, Course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <MdFilterList />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="course-stats">
        <div
          className={`course-stat-card total ${statusFilter === "All" ? "active" : ""}`}
          onClick={() => setStatusFilter("All")}
        >
          <div className="course-stat-icon">
            <MdHowToReg />
          </div>
          <div>
            <h2>{enrollments.length}</h2>
            <span>Total Enrollments</span>
          </div>
        </div>

        <div
          className={`course-stat-card active-status ${statusFilter === "Active" ? "active" : ""}`}
          onClick={() => setStatusFilter("Active")}
        >
          <div className="course-stat-icon">
            <MdCheckCircle />
          </div>
          <div>
            <h2>{enrollments.filter((e) => e.enrollmentStatus === "Active").length}</h2>
            <span>Active</span>
          </div>
        </div>

        <div className="course-stat-card upcoming">
          <div className="course-stat-icon">
            <MdPending />
          </div>
          <div>
            <h2>{enrollments.filter((e) => e.paymentStatus !== "Paid").length}</h2>
            <span>Pending Payments</span>
          </div>
        </div>

        <div
          className={`course-stat-card cancelled ${statusFilter === "Cancelled" ? "active" : ""}`}
          onClick={() => setStatusFilter("Cancelled")}
        >
          <div className="course-stat-icon">
            <MdCancel />
          </div>
          <div>
            <h2>{enrollments.filter((e) => e.enrollmentStatus === "Cancelled").length}</h2>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="course-loading">Loading enrollments...</div>
      ) : (
        <EnrollmentTable
          enrollments={filteredEnrollments}
          refreshEnrollments={loadEnrollments}
        />
      )}

      <AddEnrollmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          loadEnrollments();
          setOpenModal(false);
        }}
      />
    </div>
  );
}

export default Enrollments;
