import api from "./api";

// ================================
// Get Automation Settings
// ================================

export const getAutomationSettings = async () => {
  const response = await api.get("/automation/settings");
  return response.data;
};

// ================================
// Toggle Round Robin
// ================================

export const toggleRoundRobin = async () => {
  const response = await api.put("/automation/settings/round-robin");
  return response.data;
};

// ================================
// Update Inactivity Threshold
// ================================

export const updateInactivityDays = async (inactivityDays) => {
  const response = await api.put("/automation/settings/inactivity-days", {
    inactivityDays,
  });
  return response.data;
};

// ================================
// Add Source Rule
// ================================

export const addSourceRule = async (source, assignTo) => {
  const response = await api.post("/automation/rules", { source, assignTo });
  return response.data;
};

// ================================
// Toggle Source Rule
// ================================

export const toggleSourceRule = async (ruleId) => {
  const response = await api.put(`/automation/rules/${ruleId}/toggle`);
  return response.data;
};

// ================================
// Delete Source Rule
// ================================

export const deleteSourceRule = async (ruleId) => {
  const response = await api.delete(`/automation/rules/${ruleId}`);
  return response.data;
};

// ================================
// Get Automation Stats
// ================================

export const getAutomationStats = async () => {
  const response = await api.get("/automation/stats");
  return response.data;
};

// ================================
// Add Trigger Rule (event-based automation)
// ================================

export const addTriggerRule = async (name, trigger, action, messageTemplate) => {
  const response = await api.post("/automation/triggers", {
    name,
    trigger,
    action,
    messageTemplate,
  });
  return response.data;
};

// ================================
// Toggle Trigger Rule
// ================================

export const toggleTriggerRule = async (ruleId) => {
  const response = await api.put(`/automation/triggers/${ruleId}/toggle`);
  return response.data;
};

// ================================
// Delete Trigger Rule
// ================================

export const deleteTriggerRule = async (ruleId) => {
  const response = await api.delete(`/automation/triggers/${ruleId}`);
  return response.data;
};

// ================================
// Get Inactive Leads
// ================================

export const getInactiveLeads = async () => {
  const response = await api.get("/automation/inactive-leads");
  return response.data;
};
