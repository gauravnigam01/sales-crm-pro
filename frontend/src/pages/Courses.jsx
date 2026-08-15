import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdFilterList,
  MdSchool,
  MdCheckCircle,
  MdSchedule,
  MdGroups,
} from "react-icons/md";

import { getAllCourses } from "../services/courseService";
import CourseTable from "../components/CourseTable";

import "../styles/Courses.css";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);

    try {
      const res = await getAllCourses();
      setCourses(res.courses);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadCourses();
    })();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      course.courseName?.toLowerCase().includes(keyword) ||
      course.category?.toLowerCase().includes(keyword) ||
      course.trainer?.toLowerCase().includes(keyword);

    const matchesStatus = statusFilter === "All" || course.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalEnrolled = courses.reduce(
    (total, c) => total + (c.enrolledStudents || 0),
    0
  );

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>{statusFilter === "All" ? "Courses" : `${statusFilter} Courses`}</h1>
          <p>Manage all your courses from one place.</p>
        </div>

        <button className="add-btn" onClick={() => navigate("/courses/add")}>
          + Add Course
        </button>
      </div>

      <div className="courses-toolbar">
        <div className="courses-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by Course, Category, Trainer..."
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
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="course-stats">
        <div
          className={`course-stat-card total ${statusFilter === "All" ? "active" : ""}`}
          onClick={() => setStatusFilter("All")}
        >
          <div className="course-stat-icon">
            <MdSchool />
          </div>
          <div>
            <h2>{courses.length}</h2>
            <span>Total Courses</span>
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
            <h2>{courses.filter((c) => c.status === "Active").length}</h2>
            <span>Active</span>
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
            <h2>{courses.filter((c) => c.status === "Upcoming").length}</h2>
            <span>Upcoming</span>
          </div>
        </div>

        <div className="course-stat-card enrolled">
          <div className="course-stat-icon">
            <MdGroups />
          </div>
          <div>
            <h2>{totalEnrolled}</h2>
            <span>Total Enrolled Students</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="course-loading">Loading courses...</div>
      ) : (
        <CourseTable courses={filteredCourses} refreshCourses={loadCourses} />
      )}
    </div>
  );
}

export default Courses;
