import api from "./api";

// =========================
// Get All Documents
// =========================

export const getAllDocuments = async () => {
  const response = await api.get("/documents");

  return response.data;
};

// =========================
// Upload Document
// =========================

export const uploadDocument = async (formData) => {
  const response = await api.post("/documents", formData);

  return response.data;
};

// =========================
// Download Document
// =========================

export const downloadDocument = async (id, originalName) => {
  const response = await api.get(`/documents/${id}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");

  link.href = url;

  link.download = originalName || "document";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

// =========================
// Delete Document
// =========================

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);

  return response.data;
};
