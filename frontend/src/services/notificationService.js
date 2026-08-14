import axios from "axios";

const API = import.meta.env.PROD
  ? "/api/notifications"
  : "http://localhost:5000/api/notifications";

// ==============================
// Get Notifications
// ==============================

export const getNotifications = async () => {

  const res = await axios.get(API);

  return res.data;

};

// ==============================
// Create Notification
// ==============================

export const createNotification = async (
  data
) => {

  const res = await axios.post(
    API,
    data
  );

  return res.data;

};
// ==============================
// Mark As Read
// ==============================

export const markAsRead = async (
  id
) => {

  const res = await axios.put(
    `${API}/${id}/read`
  );

  return res.data;

};

// ==============================
// Delete Notification
// ==============================

export const deleteNotification =
  async (id) => {

    const res = await axios.delete(
      `${API}/${id}`
    );

    return res.data;

};
