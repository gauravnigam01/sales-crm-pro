import { useEffect, useState } from "react";
import {
  MdSearch,
  MdFilterList,
  MdPayments,
  MdCheckCircle,
  MdPending,
  MdCancel,
} from "react-icons/md";

import { getAllPayments } from "../services/paymentService";
import PaymentTable from "../components/PaymentTable";
import AddPaymentModal from "../components/AddPaymentModal";

import "../styles/Courses.css";
import "../styles/Enrollments.css";
import "../styles/Payments.css";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);

    try {
      const res = await getAllPayments();
      setPayments(res.payments);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadPayments();
    })();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      payment.enrollment?.studentName?.toLowerCase().includes(keyword) ||
      payment.enrollment?.course?.courseName?.toLowerCase().includes(keyword) ||
      payment.transactionId?.toLowerCase().includes(keyword);

    const matchesStatus = statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.status === "Success")
    .reduce((total, p) => total + (p.amount || 0), 0);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>Payments</h1>
          <p>Track all course payment transactions.</p>
        </div>

        <button className="add-btn" onClick={() => setOpenModal(true)}>
          + Add Payment
        </button>
      </div>

      <div className="courses-toolbar">
        <div className="courses-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by Student, Course, Transaction ID..."
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
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="course-stats">
        <div
          className={`course-stat-card total ${statusFilter === "All" ? "active" : ""}`}
          onClick={() => setStatusFilter("All")}
        >
          <div className="course-stat-icon">
            <MdPayments />
          </div>
          <div>
            <h2>{payments.length}</h2>
            <span>Total Payments</span>
          </div>
        </div>

        <div
          className={`course-stat-card active-status ${statusFilter === "Success" ? "active" : ""}`}
          onClick={() => setStatusFilter("Success")}
        >
          <div className="course-stat-icon">
            <MdCheckCircle />
          </div>
          <div>
            <h2>{payments.filter((p) => p.status === "Success").length}</h2>
            <span>Success</span>
          </div>
        </div>

        <div
          className={`course-stat-card upcoming ${statusFilter === "Pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("Pending")}
        >
          <div className="course-stat-icon">
            <MdPending />
          </div>
          <div>
            <h2>{payments.filter((p) => p.status === "Pending").length}</h2>
            <span>Pending</span>
          </div>
        </div>

        <div className="course-stat-card enrolled">
          <div className="course-stat-icon">
            <MdCancel />
          </div>
          <div>
            <h2>₹{totalCollected.toLocaleString("en-IN")}</h2>
            <span>Total Collected</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="course-loading">Loading payments...</div>
      ) : (
        <PaymentTable payments={filteredPayments} refreshPayments={loadPayments} />
      )}

      <AddPaymentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          loadPayments();
          setOpenModal(false);
        }}
      />
    </div>
  );
}

export default Payments;
