import api from "./api";

// ================================
// Get Connection Status
// ================================

export const getWhatsAppStatus = async () => {
  const response = await api.get("/whatsapp/status");
  return response.data;
};

// ================================
// Start Connection (generates QR)
// ================================

export const connectWhatsApp = async () => {
  const response = await api.post("/whatsapp/connect");
  return response.data;
};

// ================================
// Send Message
// ================================

export const sendWhatsAppMessage = async (phone, text, relatedLeadId) => {
  const response = await api.post("/whatsapp/send", {
    phone,
    text,
    relatedLeadId,
  });
  return response.data;
};

// ================================
// Get Conversations
// ================================

export const getConversations = async () => {
  const response = await api.get("/whatsapp/conversations");
  return response.data;
};

// ================================
// Get Messages For a Phone
// ================================

export const getMessagesByPhone = async (phone) => {
  const response = await api.get(`/whatsapp/messages/${phone}`);
  return response.data;
};

// ================================
// Disconnect
// ================================

export const disconnectWhatsApp = async () => {
  const response = await api.post("/whatsapp/disconnect");
  return response.data;
};
