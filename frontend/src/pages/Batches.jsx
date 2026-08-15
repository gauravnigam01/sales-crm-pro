import { useEffect, useState } from "react";
import {
  MdSearch,
  MdFilterList,
  MdViewModule,
  MdPlayCircle,
  MdSchedule,
  MdCheckCircle,
} from "react-icons/md";

import { getAllBatches } from "../services/batchService";
import BatchTable from "../components/BatchTable";
import AddBatchModal from "../components/AddBatchModal";

import "../styles/Courses.css";
import "../styles/Enrollments.css";

function Batches() {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBatches = async () => {
    setLoading(true);

    try {
      const res = await getAllBatches();
      setBatches(res.batches);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadBatches();
    })();
  }, []);

  const filteredBatches = batches.filter((batch) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      batch.batchName?.toLowerCase().includes(keyword) ||
      batch.course?.courseName?.toLowerCase().includes(keyword) ||
      batch.trainer?.toLowerCase().includes(keyword);

    const matchesStatus = statusFilter === "All" || batch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>Batches</h1>
          <p>Manage class batches across all courses.</p>
        </div>

        <button className="add-btn" onClick={() => setOpenModal(true)}>
          + Add Batch
        </button>
      </div>

      <div className="courses-toolbar">
        <div className="courses-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by Batch, Course, Trainer..."
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
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
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
            <MdViewModule />
          </div>
          <div>
            <h2>{batches.length}</h2>
            <span>Total Batches</span>
          </div>
        </div>

        <div
          className={`course-stat-card active-status ${statusFilter === "Ongoing" ? "active" : ""}`}
          onClick={() => setStatusFilter("Ongoing")}
        >
          <div className="course-stat-icon">
            <MdPlayCircle />
          </div>
          <div>
            <h2>{batches.filter((b) => b.status === "Ongoing").length}</h2>
            <span>Ongoing</span>
          </div>
        </div>

        <div
          className={`course-stat-card upcoming ${statusFilter === "Upcoming" ? "active" : ""}`}
          onClick={() => setStatusFilter("Upcoming")}
        >
          <div className="course-stat-icon">
            <MdSchedule />
          </div>
          <div>
            <h2>{batches.filter((b) => b.status === "Upcoming").length}</h2>
            <span>Upcoming</span>
          </div>
        </div>

        <div
          className={`course-stat-card active-status ${statusFilter === "Completed" ? "active" : ""}`}
          onClick={() => setStatusFilter("Completed")}
        >
          <div className="course-stat-icon">
            <MdCheckCircle />
          </div>
          <div>
            <h2>{batches.filter((b) => b.status === "Completed").length}</h2>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="course-loading">Loading batches...</div>
      ) : (
        <BatchTable batches={filteredBatches} refreshBatches={loadBatches} />
      )}

      <AddBatchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          loadBatches();
          setOpenModal(false);
        }}
      />
    </div>
  );
}

export default Batches;
