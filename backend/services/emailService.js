import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";

import Integration from "../models/Integration.js";
import EmailMessage from "../models/EmailMessage.js";
import Lead from "../models/Lead.js";
import { getIO } from "../socket/socket.js";

let imapClient = null;
let smtpTransporter = null;
let connectionStatus = "disconnected"; // disconnected | connecting | connected
let connectedEmail = null;
let lastUid = 0;
let idleFailedAttempts = 0;

const MAX_IDLE_RETRIES = 3;

// ======================================
// Emit Status Over Socket.io
// ======================================

const emitStatus = () => {
  try {
    getIO().emit("email:status", {
      status: connectionStatus,
      email: connectedEmail,
    });
  } catch (error) {
    // Socket.io not ready yet — safe to ignore
  }
};

export const getEmailStatus = () => ({
  status: connectionStatus,
  email: connectedEmail,
});

// ======================================
// Fetch + Store New Messages (since lastUid)
// ======================================

const fetchNewMessages = async () => {
  if (!imapClient?.usable) return;

  const lock = await imapClient.getMailboxLock("INBOX");

  try {
    const range = `${lastUid + 1}:*`;

    for await (const msg of imapClient.fetch(range, {
      uid: true,
      envelope: true,
      source: true,
    })) {
      if (msg.uid <= lastUid) continue;

      lastUid = Math.max(lastUid, msg.uid);

      try {
        const parsed = await simpleParser(msg.source);

        const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase();

        if (!fromAddress) continue;

        const messageId = parsed.messageId || "";

        if (messageId) {
          const existing = await EmailMessage.findOne({ messageId });
          if (existing) continue;
        }

        const relatedLead = await Lead.findOne({ email: fromAddress });

        const saved = await EmailMessage.create({
          contactEmail: fromAddress,
          direction: "inbound",
          subject: parsed.subject || "(No Subject)",
          body: parsed.text || parsed.html || "",
          messageId,
          relatedLead: relatedLead?._id || null,
          status: "received",
        });

        try {
          getIO().emit("email:message", saved);
        } catch (error) {
          // ignore
        }
      } catch (error) {
        console.log("Email parse error:", error.message);
      }
    }
  } finally {
    lock.release();
  }
};

// ======================================
// IDLE Loop (real-time new-mail push)
// ======================================

const startIdleLoop = async () => {
  while (imapClient?.usable) {
    try {
      await imapClient.idle();
      idleFailedAttempts = 0;
    } catch (error) {
      break;
    }
  }
};

// ======================================
// Connect (test IMAP + SMTP, then persist + start listening)
// ======================================

export const connectEmail = async ({
  emailAddress,
  imapHost,
  smtpHost,
  appPassword,
}) => {
  connectionStatus = "connecting";
  emitStatus();

  let testClient;

  try {
    testClient = new ImapFlow({
      host: imapHost,
      port: 993,
      secure: true,
      auth: { user: emailAddress, pass: appPassword },
      logger: false,
    });

    await testClient.connect();

    const lock = await testClient.getMailboxLock("INBOX");
    lastUid = Math.max(0, (testClient.mailbox.uidNext || 1) - 1);
    lock.release();
  } catch (error) {
    connectionStatus = "disconnected";
    emitStatus();
    throw new Error(`IMAP connection failed: ${error.message}`);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 587,
    secure: false,
    auth: { user: emailAddress, pass: appPassword },
  });

  try {
    await transporter.verify();
  } catch (error) {
    await testClient.logout().catch(() => {});
    connectionStatus = "disconnected";
    emitStatus();
    throw new Error(`SMTP connection failed: ${error.message}`);
  }

  if (imapClient) {
    await imapClient.logout().catch(() => {});
  }

  imapClient = testClient;
  smtpTransporter = transporter;
  connectedEmail = emailAddress;
  connectionStatus = "connected";
  idleFailedAttempts = 0;

  imapClient.on("exists", () => {
    fetchNewMessages().catch((err) =>
      console.log("Email fetch error:", err.message)
    );
  });

  imapClient.on("close", () => {
    connectionStatus = "disconnected";
    emitStatus();

    idleFailedAttempts += 1;

    if (idleFailedAttempts < MAX_IDLE_RETRIES) {
      setTimeout(() => {
        reconnectEmail().catch((err) =>
          console.log("Email reconnect error:", err.message)
        );
      }, 5000);
    }
  });

  startIdleLoop();

  await Integration.findOneAndUpdate(
    { provider: "email" },
    {
      emailAddress,
      imapHost,
      smtpHost,
      emailAppPassword: appPassword,
      connected: true,
    },
    { new: true, upsert: true }
  );

  emitStatus();

  return { status: connectionStatus, email: connectedEmail };
};

// ======================================
// Reconnect (uses saved credentials, no re-verification)
// ======================================

const reconnectEmail = async () => {
  const integration = await Integration.findOne({ provider: "email" });

  if (!integration?.connected) return;

  await connectEmail({
    emailAddress: integration.emailAddress,
    imapHost: integration.imapHost,
    smtpHost: integration.smtpHost,
    appPassword: integration.emailAppPassword,
  });
};

// ======================================
// Resume On Server Boot
// ======================================

export const resumeEmailConnection = async () => {
  try {
    const integration = await Integration.findOne({ provider: "email" });

    if (!integration?.connected) return;

    await connectEmail({
      emailAddress: integration.emailAddress,
      imapHost: integration.imapHost,
      smtpHost: integration.smtpHost,
      appPassword: integration.emailAppPassword,
    });
  } catch (error) {
    console.log("Email auto-resume failed:", error.message);
  }
};

// ======================================
// Send Email
// ======================================

export const sendEmailMessage = async (
  to,
  subject,
  text,
  userId,
  relatedLeadId
) => {
  if (!smtpTransporter || connectionStatus !== "connected") {
    throw new Error("Email is not connected");
  }

  await smtpTransporter.sendMail({
    from: connectedEmail,
    to,
    subject,
    text,
  });

  const saved = await EmailMessage.create({
    contactEmail: to.toLowerCase(),
    direction: "outbound",
    subject,
    body: text,
    relatedLead: relatedLeadId || null,
    sentBy: userId || null,
    status: "sent",
  });

  return saved;
};

// ======================================
// Disconnect
// ======================================

export const disconnectEmail = async () => {
  if (imapClient) {
    imapClient.removeAllListeners("close");
    await imapClient.logout().catch(() => {});
    imapClient = null;
  }

  smtpTransporter = null;
  connectionStatus = "disconnected";
  connectedEmail = null;
  lastUid = 0;

  await Integration.findOneAndUpdate(
    { provider: "email" },
    { connected: false }
  );

  emitStatus();
};

// ======================================
// System Email (transactional — password resets etc.)
// Uses whatever SMTP credentials were last saved, independent of the live
// Email Inbox connection state, so it still works if the inbox feature was
// never "connected" or is currently offline.
// ======================================

export const sendSystemEmail = async (to, subject, text) => {
  const integration = await Integration.findOne({ provider: "email" });

  if (!integration?.emailAddress || !integration?.smtpHost || !integration?.emailAppPassword) {
    throw new Error("No email credentials saved to send from");
  }

  const transporter = nodemailer.createTransport({
    host: integration.smtpHost,
    port: 587,
    secure: false,
    auth: {
      user: integration.emailAddress,
      pass: integration.emailAppPassword,
    },
  });

  await transporter.sendMail({
    from: integration.emailAddress,
    to,
    subject,
    text,
  });
};
