import api from "./api";

// =========================
// Get Team Performance
// =========================

export const getTeamPerformance = async () => {
  const response = await api.get("/teams/performance");

  return response.data;
};
