import api from "./api";

// =========================
// Get Meta Integration Status
// =========================

export const getMetaIntegration = async () => {
  const response = await api.get("/integrations/meta");

  return response.data;
};

// =========================
// Save Meta Integration
// =========================

export const saveMetaIntegration = async (data) => {
  const response = await api.put("/integrations/meta", data);

  return response.data;
};

// =========================
// WhatsApp Business API Integration
// =========================

export const getWhatsappIntegration = async () => {
  const response = await api.get("/integrations/whatsapp");
  return response.data;
};

export const saveWhatsappIntegration = async (data) => {
  const response = await api.put("/integrations/whatsapp", data);
  return response.data;
};

// =========================
// Email Integration
// =========================

export const getEmailIntegration = async () => {
  const response = await api.get("/integrations/email");
  return response.data;
};

export const saveEmailIntegration = async (data) => {
  const response = await api.put("/integrations/email", data);
  return response.data;
};
