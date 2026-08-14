import axios from "axios";

const API = import.meta.env.PROD
  ? "/api/users"
  : "http://localhost:5000/api/users";

const getToken = () => {
  return localStorage.getItem("token");
};

const config = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// ==========================
// Get All Users
// ==========================

export const getAllUsers = async () => {

  const res = await axios.get(
    API,
    config()
  );

  return res.data;

};

// ==========================
// Create Caller
// ==========================

export const createCaller = async (
  data
) => {

  const res = await axios.post(
    `${API}/create-caller`,
    data,
    config()
  );

  return res.data;

};

// ==========================
// Update User
// ==========================

export const updateUser = async (
  id,
  data
) => {

  const res = await axios.put(
    `${API}/${id}`,
    data,
    config()
  );

  return res.data;

};

// ==========================
// Delete User
// ==========================

export const deleteUser = async (
  id
) => {

  const res = await axios.delete(
    `${API}/${id}`,
    config()
  );

  return res.data;

};

// ==========================
// Change Role
// ==========================

export const changeUserRole =
  async (id, role) => {

    const res = await axios.put(
      `${API}/${id}/change-role`,
      { role },
      config()
    );

    return res.data;

  };

// ==========================
// Change Status
// ==========================

export const changeUserStatus =
  async (id) => {

    const res = await axios.put(
      `${API}/${id}/change-status`,
      {},
      config()
    );

    return res.data;

  };

// ==========================
// Get Permission Categories + Templates
// ==========================

export const getPermissionMeta = async () => {

  const res = await axios.get(
    `${API}/permission-meta`,
    config()
  );

  return res.data;

};

// ==========================
// Get User Permissions
// ==========================

export const getUserPermissions = async (id) => {

  const res = await axios.get(
    `${API}/${id}/permissions`,
    config()
  );

  return res.data;

};

// ==========================
// Update User Permissions
// ==========================

export const updateUserPermissions = async (id, permissions) => {

  const res = await axios.put(
    `${API}/${id}/permissions`,
    { permissions },
    config()
  );

  return res.data;

};

// ==========================
// Apply Template To User
// ==========================

export const applyTemplateToUser = async (id, templateName) => {

  const res = await axios.put(
    `${API}/${id}/apply-template`,
    { templateName },
    config()
  );

  return res.data;

};

// ==========================
// Admin Reset User Password
// ==========================

export const resetUserPassword = async (id, newPassword) => {

  const res = await axios.put(
    `${API}/${id}/reset-password`,
    { newPassword },
    config()
  );

  return res.data;

};