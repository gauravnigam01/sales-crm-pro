import api from "./api";

// Dashboard Stats
// scope: for a manager, "mine" restricts to their own data, "team"
// (default) includes their whole team — the "My Data | My Team" toggle.
export const getDashboardStats = async (days = 30, scope) => {
  const response = await api.get(
    `/dashboard/stats?days=${days}${scope ? `&scope=${scope}` : ""}`
  );
  return response.data;
};

// Recent Leads
export const getRecentLeads = async () => {
  const response = await api.get("/dashboard/recent-leads");
  return response.data;
};

// Recent Activity
export const getRecentActivity = async () => {
  const response = await api.get("/dashboard/recent-activity");
  return response.data;
};