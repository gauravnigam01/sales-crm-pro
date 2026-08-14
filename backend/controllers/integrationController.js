import Integration from "../models/Integration.js";

const maskToken = (token) => {
  if (!token) return "";

  if (token.length <= 4) return "****";

  return `${"*".repeat(token.length - 4)}${token.slice(-4)}`;
};

// ======================================
// Get Meta Integration Status
// ======================================

export const getMetaIntegration = async (req, res) => {
  try {
    const integration = await Integration.findOne({ provider: "meta" });

    res.status(200).json({
      success: true,
      integration: {
        appId: integration?.appId || "",
        pageAccessToken: maskToken(integration?.pageAccessToken),
        connected: integration?.connected || false,
        updatedAt: integration?.updatedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Save Meta Integration
// ======================================

export const saveMetaIntegration = async (req, res) => {
  try {
    const { appId, pageAccessToken } = req.body;

    const integration = await Integration.findOneAndUpdate(
      { provider: "meta" },
      {
        appId,
        pageAccessToken,
        connected: Boolean(appId && pageAccessToken),
        connectedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Meta Integration Saved Successfully",
      integration: {
        appId: integration.appId,
        pageAccessToken: maskToken(integration.pageAccessToken),
        connected: integration.connected,
        updatedAt: integration.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get WhatsApp Business API Integration Status
// ======================================

export const getWhatsappIntegration = async (req, res) => {
  try {
    const integration = await Integration.findOne({ provider: "whatsapp" });

    res.status(200).json({
      success: true,
      integration: {
        phoneNumberId: integration?.phoneNumberId || "",
        pageAccessToken: maskToken(integration?.pageAccessToken),
        connected: integration?.connected || false,
        updatedAt: integration?.updatedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Save WhatsApp Business API Integration
// ======================================

export const saveWhatsappIntegration = async (req, res) => {
  try {
    const { phoneNumberId, pageAccessToken } = req.body;

    const integration = await Integration.findOneAndUpdate(
      { provider: "whatsapp" },
      {
        phoneNumberId,
        pageAccessToken,
        connected: Boolean(phoneNumberId && pageAccessToken),
        connectedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "WhatsApp Integration Saved Successfully",
      integration: {
        phoneNumberId: integration.phoneNumberId,
        pageAccessToken: maskToken(integration.pageAccessToken),
        connected: integration.connected,
        updatedAt: integration.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Email Integration Status
// ======================================

export const getEmailIntegration = async (req, res) => {
  try {
    const integration = await Integration.findOne({ provider: "email" });

    res.status(200).json({
      success: true,
      integration: {
        emailAddress: integration?.emailAddress || "",
        imapHost: integration?.imapHost || "",
        emailAppPassword: maskToken(integration?.emailAppPassword),
        connected: integration?.connected || false,
        updatedAt: integration?.updatedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Save Email Integration
// ======================================

export const saveEmailIntegration = async (req, res) => {
  try {
    const { emailAddress, imapHost, emailAppPassword } = req.body;

    const integration = await Integration.findOneAndUpdate(
      { provider: "email" },
      {
        emailAddress,
        imapHost,
        emailAppPassword,
        connected: Boolean(emailAddress && imapHost && emailAppPassword),
        connectedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Email Integration Saved Successfully",
      integration: {
        emailAddress: integration.emailAddress,
        imapHost: integration.imapHost,
        emailAppPassword: maskToken(integration.emailAppPassword),
        connected: integration.connected,
        updatedAt: integration.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
