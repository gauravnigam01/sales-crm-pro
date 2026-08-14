import api from "./api";

// =========================
// Get All Events
// =========================

export const getAllEvents = async (month, year) => {
  const params = month && year ? `?month=${month}&year=${year}` : "";

  const response = await api.get(`/calendar${params}`);

  return response.data;
};

// =========================
// Get Upcoming Events
// =========================

export const getUpcomingEvents = async () => {
  const response = await api.get("/calendar/upcoming");

  return response.data;
};

// =========================
// Get Event By ID
// =========================

export const getEventById = async (id) => {
  const response = await api.get(`/calendar/${id}`);

  return response.data;
};

// =========================
// Create Event
// =========================

export const createEvent = async (data) => {
  const response = await api.post("/calendar", data);

  return response.data;
};

// =========================
// Update Event
// =========================

export const updateEvent = async (id, data) => {
  const response = await api.put(`/calendar/${id}`, data);

  return response.data;
};

// =========================
// Delete Event
// =========================

export const deleteEvent = async (id) => {
  const response = await api.delete(`/calendar/${id}`);

  return response.data;
};
