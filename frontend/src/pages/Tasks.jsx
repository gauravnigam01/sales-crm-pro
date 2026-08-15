import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {

  getAllTasks,

  getMyTasks,

} from "../services/taskService";

import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import DeleteTaskModal from "../components/DeleteTaskModal";

import "../styles/Tasks.css";

function Tasks() {

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const canManage =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") || "All";

  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const handleStatusChange = (e) => {
    const params = new URLSearchParams(searchParams);

    if (e.target.value === "All") {
      params.delete("status");
    } else {
      params.set("status", e.target.value);
    }

    setSearchParams(params);
    setCurrentPage(1);
  };

  const [openAddModal, setOpenAddModal] =
    useState(false);

  const [openEditModal, setOpenEditModal] =
    useState(false);

  const [openDeleteModal, setOpenDeleteModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const tasksPerPage = 8;

  const loadTasks = async () => {

    try {

      const res = canManage
        ? await getAllTasks()
        : await getMyTasks();

      setTasks(res.tasks || []);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    (async () => {

      await loadTasks();

    })();

  }, []);

  const filteredTasks =
    tasks.filter((task) => {

      const keyword =
        search.toLowerCase();

      const matchesSearch = (

        task.title
          ?.toLowerCase()
          .includes(keyword) ||

        task.assignedTo?.fullName
          ?.toLowerCase()
          .includes(keyword) ||

        task.status
          ?.toLowerCase()
          .includes(keyword)

      );

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      return matchesSearch && matchesStatus;

    });

  const indexOfLastTask =
    currentPage *
    tasksPerPage;

  const indexOfFirstTask =
    indexOfLastTask -
    tasksPerPage;

  const currentTasks =
    filteredTasks.slice(

      indexOfFirstTask,

      indexOfLastTask

    );

  const totalPages =
    Math.ceil(

      filteredTasks.length /

      tasksPerPage

    );

  return (

    <div className="tasks-page">

      <div className="page-header">

        <div>

          <h1>

            {statusFilter === "All" ? "Task Management" : `${statusFilter} Tasks`}

          </h1>

          <p>

            Manage All Tasks

          </p>

        </div>

        {canManage && (

          <button

            className="add-task-btn"

            onClick={() =>
              setOpenAddModal(true)
            }

          >

            + Add Task

          </button>

        )}

      </div>

      <div className="task-stats">

        <div className="stat-card">

          <h2>

            {tasks.length}

          </h2>

          <p>Total Tasks</p>

        </div>

        <div className="stat-card">

          <h2>

            {

              tasks.filter(

                t =>
                  t.status ===
                  "Pending"

              ).length

            }

          </h2>

          <p>Pending</p>

        </div>

        <div className="stat-card">

          <h2>

            {

              tasks.filter(

                t =>
                  t.status ===
                  "In Progress"

              ).length

            }

          </h2>

          <p>In Progress</p>

        </div>

        <div className="stat-card">

          <h2>

            {

              tasks.filter(

                t =>
                  t.status ===
                  "Completed"

              ).length

            }

          </h2>

          <p>Completed</p>

        </div>

      </div>

      <div className="search-bar" style={{ display: "flex", gap: "12px" }}>

        <input

          type="text"

          placeholder="Search Task..."

          value={search}

          onChange={(e)=>

            setSearch(

              e.target.value

            )

          }

        />

        <select value={statusFilter} onChange={handleStatusChange}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

      </div>

      <table className="tasks-table">

        <thead>

          <tr>

            <th>Title</th>

            <th>Assigned To</th>

            <th>Priority</th>

            <th>Status</th>

            <th>Due Date</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>
                      {currentTasks.length === 0 ? (

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "30px",
                }}
              >

                No Tasks Found

              </td>

            </tr>

          ) : (

            currentTasks.map((task) => (

              <tr key={task._id}>

                <td>

                  <strong>

                    {task.title}

                  </strong>

                </td>

                <td>

                  {task.assignedTo?.fullName || "N/A"}

                </td>

                <td>

                  <span
                    className={`priority ${task.priority
                      ?.toLowerCase()}`}
                  >

                    {task.priority}

                  </span>

                </td>

                <td>

                  <span
                    className={`status ${task.status
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >

                    {task.status}

                  </span>

                </td>

                <td>

                  {new Date(
                    task.dueDate
                  ).toLocaleDateString("en-IN")}

                </td>

                <td>

                  {canManage ? (

                    <>

                      <button

                        className="edit-btn"

                        onClick={() => {

                          setSelectedTask(task);

                          setOpenEditModal(true);

                        }}

                      >

                        Edit

                      </button>

                      <button

                        className="delete-btn"

                        onClick={() => {

                          setSelectedTask(task);

                          setOpenDeleteModal(true);

                        }}

                      >

                        Delete

                      </button>

                    </>

                  ) : (

                    <span className="text-muted-badge">View Only</span>

                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      <div className="pagination">

        <button

          disabled={currentPage === 1}

          onClick={() =>

            setCurrentPage(currentPage - 1)

          }

        >

          Previous

        </button>

        <span>

          Page {currentPage} of {totalPages || 1}

        </span>

        <button

          disabled={

            currentPage === totalPages ||

            totalPages === 0

          }

          onClick={() =>

            setCurrentPage(currentPage + 1)

          }

        >

          Next

        </button>

      </div>
            <AddTaskModal

        open={openAddModal}

        onClose={() =>

          setOpenAddModal(false)

        }

        onSuccess={loadTasks}

      />

      <EditTaskModal

        open={openEditModal}

        task={selectedTask}

        onClose={() =>

          setOpenEditModal(false)

        }

        onSuccess={loadTasks}

      />

      <DeleteTaskModal

        open={openDeleteModal}

        task={selectedTask}

        onClose={() =>

          setOpenDeleteModal(false)

        }

        onSuccess={loadTasks}

      />

    </div>

  );

}

export default Tasks;