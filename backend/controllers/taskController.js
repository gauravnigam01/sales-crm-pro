import Task from "../models/Task.js";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";
import { buildScopeFilter, isUserInScope } from "../utils/teamScope.js";

const canAccessTask = async (user, task) => {
  if (user.role === "admin") return true;

  const assignedToId = task.assignedTo?._id || task.assignedTo;

  if (user.role === "caller") {
    return assignedToId?.toString() === user._id.toString();
  }

  return isUserInScope(user, assignedToId);
};

// ==========================
// Create Task
// ==========================

export const createTask = async (req, res) => {

  try {

    let assignedTo = req.body.assignedTo;

    if (req.user.role === "caller") {
      assignedTo = req.user._id;
    } else if (req.user.role === "manager" && assignedTo) {
      const allowed = await isUserInScope(req.user, assignedTo);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You can only assign tasks to members of your team",
        });
      }
    }

    const task = await Task.create({

      ...req.body,

      assignedTo,

      assignedBy: req.user._id,

    });

    const assignedUser = await User.findById(task.assignedTo);

    await createNotification(
      "New Task Assigned",
      `Task "${task.title}" has been assigned to ${assignedUser?.fullName || "a user"}.`,
      "task"
    );

    res.status(201).json({

      success: true,

      message: "Task Created Successfully",

      task,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Get My Tasks
// ==========================

export const getMyTasks = async (req, res) => {

  try {

    const tasks = await Task.find({ assignedTo: req.user._id })

      .populate("assignedTo", "fullName")

      .populate("assignedBy", "fullName")

      .sort({ createdAt: -1 });

    res.status(200).json({

      success: true,

      count: tasks.length,

      tasks,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Get All Tasks
// ==========================

export const getAllTasks = async (req, res) => {

  try {

    const filter =
      req.user.role === "caller"
        ? { assignedTo: req.user._id }
        : await buildScopeFilter(req.user, "assignedTo");

    const tasks = await Task.find(filter)

      .populate("assignedTo", "fullName")

      .populate("assignedBy", "fullName")

      .sort({ createdAt: -1 });

    res.status(200).json({

      success: true,

      count: tasks.length,

      tasks,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Get Single Task
// ==========================

export const getTaskById = async (req, res) => {

  try {

    const task = await Task.findById(req.params.id)

      .populate("assignedTo", "fullName")

      .populate("assignedBy", "fullName");

    if (!task) {

      return res.status(404).json({

        success: false,

        message: "Task Not Found",

      });

    }

    if (!(await canAccessTask(req.user, task))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    res.status(200).json({

      success: true,

      task,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Update Task
// ==========================

export const updateTask = async (req, res) => {

  try {

    const existing = await Task.findById(req.params.id);

    if (!existing) {

      return res.status(404).json({

        success: false,

        message: "Task Not Found",

      });

    }

    if (!(await canAccessTask(req.user, existing))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    if (req.body.assignedTo) {
      if (req.user.role === "caller") {
        delete req.body.assignedTo;
      } else if (req.user.role === "manager") {
        const allowed = await isUserInScope(req.user, req.body.assignedTo);

        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: "You can only assign tasks to members of your team",
          });
        }
      }
    }

    const task = await Task.findByIdAndUpdate(

      req.params.id,

      req.body,

      {

        new: true,

      }

    );

    res.status(200).json({

      success: true,

      message: "Task Updated Successfully",

      task,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Delete Task
// ==========================

export const deleteTask = async (req, res) => {

  try {

    const existing = await Task.findById(req.params.id);

    if (!existing) {

      return res.status(404).json({

        success: false,

        message: "Task Not Found",

      });

    }

    if (!(await canAccessTask(req.user, existing))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({

      success: true,

      message: "Task Deleted Successfully",

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};