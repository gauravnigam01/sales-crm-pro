import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import WhatsAppMessage from "../models/WhatsAppMessage.js";
import Lead from "../models/Lead.js";
import { getIO } from "../socket/socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FOLDER = path.join(__dirname, "..", "wa_session");

let sock = null;
let currentQR = null;
let connectionStatus = "disconnected"; // disconnected | connecting | qr | connected
let connectedNumber = null;
let failedAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 3;

// ======================================
// Emit Status Over Socket.io
// ======================================

const emitStatus = () => {
  try {
    getIO().emit("whatsapp:status", {
      status: connectionStatus,
      qr: currentQR,
      number: connectedNumber,
    });
  } catch (error) {
    // Socket.io not ready yet — safe to ignore
  }
};

export const getWhatsAppStatus = () => ({
  status: connectionStatus,
  qr: currentQR,
  number: connectedNumber,
});

// A logged-out session's stored keys are dead — Baileys will never issue a
// fresh QR while it can still find old creds on disk, so wipe them so the
// next connect attempt starts clean (covers both phone-side unlink and
// the admin's manual Disconnect button).
const clearSession = () => {
  try {
    fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
  } catch (error) {
    console.log("Failed to clear WhatsApp session folder:", error.message);
  }
};

// ======================================
// Initialize / Resume Connection
// ======================================

export const initWhatsApp = async () => {
  if (sock) return;

  connectionStatus = "connecting";
  emitStatus();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    auth: state,
    version,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = await QRCode.toDataURL(qr);
      connectionStatus = "qr";
      emitStatus();
    }

    if (connection === "open") {
      connectionStatus = "connected";
      currentQR = null;
      connectedNumber = sock.user?.id?.split(":")[0] || null;
      failedAttempts = 0;
      emitStatus();
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      connectionStatus = "disconnected";
      connectedNumber = null;
      currentQR = null;
      sock = null;
      emitStatus();

      if (loggedOut) {
        // Phone-side unlink (or the number was logged out remotely) —
        // old session keys are permanently invalid, clear them so the next
        // "Connect WhatsApp" click generates a genuinely new QR instead of
        // silently retrying with dead credentials.
        clearSession();
        failedAttempts = 0;
        return;
      }

      failedAttempts += 1;

      if (failedAttempts >= MAX_RECONNECT_ATTEMPTS) {
        // Not a clean "logged out" signal, but repeated failures with the
        // same stored session almost always mean those keys are dead too
        // (e.g. phone-side unlink without a clean 401). Clear them instead
        // of retrying forever, so the next manual connect gets a fresh QR.
        clearSession();
        failedAttempts = 0;
        return;
      }

      setTimeout(() => {
        initWhatsApp().catch((err) => console.log("WA reconnect error:", err.message));
      }, 3000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;

        const phone = msg.key.remoteJid?.split("@")[0];

        if (!phone || msg.key.remoteJid?.endsWith("@g.us")) continue;

        const body =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          "";

        if (!body) continue;

        const relatedLead = await Lead.findOne({
          phone: { $regex: phone.slice(-10) },
        });

        const saved = await WhatsAppMessage.create({
          phone,
          direction: "inbound",
          body,
          relatedLead: relatedLead?._id || null,
          status: "received",
        });

        try {
          getIO().emit("whatsapp:message", saved);
        } catch (error) {
          // ignore
        }
      } catch (error) {
        console.log("WA incoming message error:", error.message);
      }
    }
  });
};

// ======================================
// Send Message
// ======================================

export const sendWhatsAppMessage = async (
  phone,
  text,
  userId,
  relatedLeadId
) => {
  if (!sock || connectionStatus !== "connected") {
    throw new Error("WhatsApp is not connected");
  }

  let cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const jid = `${cleanPhone}@s.whatsapp.net`;

  await sock.sendMessage(jid, { text });

  const saved = await WhatsAppMessage.create({
    phone: cleanPhone,
    direction: "outbound",
    body: text,
    relatedLead: relatedLeadId || null,
    sentBy: userId || null,
    status: "sent",
  });

  return saved;
};

// ======================================
// Logout / Disconnect
// ======================================

export const logoutWhatsApp = async () => {
  if (sock) {
    try {
      await sock.logout();
    } catch (error) {
      // ignore — socket may already be closed
    }

    sock = null;
  }

  clearSession();

  connectionStatus = "disconnected";
  currentQR = null;
  connectedNumber = null;
  emitStatus();
};
