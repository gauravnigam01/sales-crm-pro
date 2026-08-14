import api from "./api";

// =========================
// Login
// =========================

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// =========================
// Forgot Password
// =========================

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });

  return response.data;
};

// =========================
// Reset Password (from emailed link)
// =========================

export const resetPasswordWithToken = async (token, newPassword) => {
  const response = await api.post(`/auth/reset-password/${token}`, {
    newPassword,
  });

  return response.data;
};

// =========================
// Get My Profile
// =========================

export const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

// =========================
// Update My Profile
// =========================

export const updateProfile = async (data) => {
  const response = await api.put("/auth/update-profile", data);

  return response.data;
};

// =========================
// Change My Password
// =========================

export const changePassword = async (data) => {
  const response = await api.put("/auth/change-password", data);

  return response.data;
};