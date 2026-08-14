import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {

  createTask,

} from "../services/taskService";

import {

  getAllUsers,

} from "../services/userService";

import "../styles/AddTaskModal.css";

function AddTaskModal({

  open,

  onClose,

  onSuccess,

}) {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({

      title: "",

      description: "",

      assignedTo: "",

      priority: "Medium",

      status: "Pending",

      dueDate: "",

      remarks: "",

    });

  const loadUsers = async () => {

    try {

      const res = await getAllUsers();

      setUsers(res.users || []);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    if (open) {

      (async () => {

        await loadUsers();

      })();

    }

  }, [open]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      await createTask(formData);

      toast.success("Task Created");

      onSuccess();

      onClose();

      setFormData({

        title: "",

        description: "",

        assignedTo: "",

        priority: "Medium",

        status: "Pending",

        dueDate: "",

        remarks: "",

      });

    } catch (error) {

      console.log(error);

      toast.error("Failed");

    }

    setLoading(false);

  };

  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="task-modal">

        <div className="modal-header">

          <h2>

            Add Task

          </h2>

          <button

            onClick={onClose}

          >

            ✕

          </button>

        </div>

        <form
          onSubmit={handleSubmit}
        >
                      <div className="form-group">

            <label>

              Task Title

            </label>

            <input

              type="text"

              name="title"

              value={formData.title}

              onChange={handleChange}

              required

            />

          </div>

          <div className="form-group">

            <label>

              Description

            </label>

            <textarea

              name="description"

              value={formData.description}

              onChange={handleChange}

            />

          </div>

          <div className="form-group">

            <label>

              Assign User

            </label>

            <select

              name="assignedTo"

              value={formData.assignedTo}

              onChange={handleChange}

              required

            >

              <option value="">

                Select User

              </option>

              {users.map((user) => (

                <option

                  key={user._id}

                  value={user._id}

                >

                  {user.fullName}

                </option>

              ))}

            </select>

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>

                Priority

              </label>

              <select

                name="priority"

                value={formData.priority}

                onChange={handleChange}

              >

                <option>

                  Low

                </option>

                <option>

                  Medium

                </option>

                <option>

                  High

                </option>

              </select>

            </div>

            <div className="form-group">

              <label>

                Status

              </label>

              <select

                name="status"

                value={formData.status}

                onChange={handleChange}

              >

                <option>

                  Pending

                </option>

                <option>

                  In Progress

                </option>

                <option>

                  Completed

                </option>

              </select>

            </div>

          </div>

          <div className="form-group">

            <label>

              Due Date

            </label>

            <input

              type="date"

              name="dueDate"

              value={formData.dueDate}

              onChange={handleChange}

              required

            />

          </div>

          <div className="form-group">

            <label>

              Remarks

            </label>

            <textarea

              name="remarks"

              value={formData.remarks}

              onChange={handleChange}

            />

          </div>

          <div className="modal-footer">

            <button

              type="button"

              className="cancel-btn"

              onClick={onClose}

            >

              Cancel

            </button>

            <button

              type="submit"

              className="save-btn"

              disabled={loading}

            >

              {loading

                ? "Saving..."

                : "Create Task"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AddTaskModal;