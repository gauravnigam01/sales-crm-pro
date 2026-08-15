import api from "./api";

export const getAllEnrollments = async () => {
  const response = await api.get("/enrollments");
  return response.data;
};

export const getEnrollmentById = async (id) => {
  const response = await api.get(`/enrollments/${id}`);
  return response.data;
};

export const createEnrollment = async (enrollmentData) => {
  const response = await api.post("/enrollments", enrollmentData);
  return response.data;
};

export const updateEnrollment = async (id, enrollmentData) => {
  const response = await api.put(`/enrollments/${id}`, enrollmentData);
  return response.data;
};

export const deleteEnrollment = async (id) => {
  const response = await api.delete(`/enrollments/${id}`);
  return response.data;
};
