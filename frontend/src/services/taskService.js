import api from "./api";

// =========================
// Get All Tasks
// =========================

export const getAllTasks = async () => {

  const response = await api.get("/tasks");

  return response.data;

};

// =========================
// Get My Tasks
// =========================

export const getMyTasks = async () => {

  const response = await api.get("/tasks/my-tasks");

  return response.data;

};

// =========================
// Get Task By ID
// =========================

export const getTaskById = async (id) => {

  const response = await api.get(`/tasks/${id}`);

  return response.data;

};

// =========================
// Create Task
// =========================

export const createTask = async (data) => {

  const response = await api.post("/tasks", data);

  return response.data;

};

// =========================
// Update Task
// =========================

export const updateTask = async (id, data) => {

  const response = await api.put(`/tasks/${id}`, data);

  return response.data;

};

// =========================
// Delete Task
// =========================

export const deleteTask = async (id) => {

  const response = await api.delete(`/tasks/${id}`);

  return response.data;

};