import api from "./api";

// =========================
// Sales Report
// =========================

export const getSalesReport = async () => {
  const response = await api.get("/reports/sales");

  return response.data;
};

// =========================
// Lead Report
// =========================

export const getLeadReport = async () => {
  const response = await api.get("/reports/leads");

  return response.data;
};

// =========================
// Agent Report
// =========================

export const getAgentReport = async () => {
  const response = await api.get("/reports/agents");

  return response.data;
};

// =========================
// Task Report
// =========================

export const getTaskReport = async () => {
  const response = await api.get("/reports/tasks");

  return response.data;
};
