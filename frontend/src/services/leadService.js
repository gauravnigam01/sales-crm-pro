import api from "./api";

// ================================
// Get All Leads
// ================================

export const getAllLeads = async (assignedTo) => {
  const params = assignedTo ? `?assignedTo=${assignedTo}` : "";

  const response = await api.get(`/leads${params}`);
  return response.data;
};

// ================================
// Create Lead
// ================================

export const createLead = async (leadData) => {
  const response = await api.post("/leads", leadData);
  return response.data;
};

// ================================
// Update Lead
// ================================

export const updateLead = async (id, leadData) => {
  const response = await api.put(`/leads/${id}`, leadData);
  return response.data;
};

// ================================
// Delete Lead
// ================================

export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

// ================================
// Import Leads (Bulk / CSV)
// ================================

export const importLeads = async (leads, region) => {
  const response = await api.post("/leads/import", { leads, region });
  return response.data;
};

// ================================
// Get Single Lead
// ================================

export const getLeadById = async (id) => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

// ================================
// Log Quick Activity
// ================================

export const logLeadActivity = async (id, action) => {
  const response = await api.post(`/leads/${id}/activity`, { action });
  return response.data;
};

// ================================
// Get Follow-Ups
// ================================

export const getFollowUps = async () => {
  const response = await api.get("/leads/follow-ups");
  return response.data;
};

// ================================
// Get Call Logs
// ================================

export const getCallLogs = async () => {
  const response = await api.get("/leads/call-logs");
  return response.data;
};