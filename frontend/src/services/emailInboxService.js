import api from "./api";

// ================================
// Get Connection Status
// ================================

export const getEmailStatus = async () => {
  const response = await api.get("/email/status");
  return response.data;
};

// ================================
// Connect (tests IMAP + SMTP)
// ================================

export const connectEmailInbox = async (payload) => {
  const response = await api.post("/email/connect", payload);
  return response.data;
};

// ================================
// Send Email
// ================================

export const sendEmail = async (to, subject, text, relatedLeadId) => {
  const response = await api.post("/email/send", {
    to,
    subject,
    text,
    relatedLeadId,
  });
  return response.data;
};

// ================================
// Get Conversations
// ================================

export const getEmailConversations = async () => {
  const response = await api.get("/email/conversations");
  return response.data;
};

// ================================
// Get Messages For a Contact
// ================================

export const getMessagesByContact = async (email) => {
  const response = await api.get(`/email/messages/${email}`);
  return response.data;
};

// ================================
// Disconnect
// ================================

export const disconnectEmailInbox = async () => {
  const response = await api.post("/email/disconnect");
  return response.data;
};
