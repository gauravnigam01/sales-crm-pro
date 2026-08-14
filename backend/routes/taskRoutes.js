import express from "express";

import {

  createTask,

  getAllTasks,

  getMyTasks,

  getTaskById,

  updateTask,

  deleteTask,

} from "../controllers/taskController.js";

import {

  protect,

} from "../middleware/authMiddleware.js";

import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(

  "/",

  protect,

  requirePermission("viewTasks"),

  getAllTasks

);

router.get(

  "/my-tasks",

  protect,

  getMyTasks

);

router.get(

  "/:id",

  protect,

  requirePermission("viewTasks"),

  getTaskById

);

router.post(

  "/",

  protect,

  requirePermission("createTask"),

  createTask

);

router.put(

  "/:id",

  protect,

  requirePermission("editTask"),

  updateTask

);

router.delete(

  "/:id",

  protect,

  requirePermission("deleteTask"),

  deleteTask

);

export default router;
