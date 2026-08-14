import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { MdEmail, MdCheckCircle, MdSend, MdLogout } from "react-icons/md";
import ConfirmDialog from "../components/ConfirmDialog";

import {
  getEmailStatus,
  connectEmailInbox,
  disconnectEmailInbox,
  sendEmail,
  getEmailConversations,
  getMessagesByContact,
} from "../services/emailInboxService";

import "../styles/InboxPage.css";

const socket = io(import.meta.env.PROD ? undefined : "http://localhost:5000");

function EmailInbox() {
  const [status, setStatus] = useState({
    status: "disconnected",
    email: null,
  });

  const [form, setForm] = useState({
    emailAddress: "",
    imapHost: "imap.gmail.com",
    smtpHost: "smtp.gmail.com",
    appPassword: "",
  });

  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loadStatus = async () => {
    try {
      const res = await getEmailStatus();
      setStatus(res);
    } catch (error) {
      console.log(error);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await getEmailConversations();
      setConversations(res.conversations);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMessages = async (email) => {
    try {
      const res = await getMessagesByContact(email);
      setMessages(res.messages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadStatus();
      await loadConversations();
    })();

    socket.on("email:status", (data) => {
      setStatus(data);
    });

    socket.on("email:message", (msg) => {
      loadConversations();

      if (activeContact && msg.contactEmail === activeContact) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("email:status");
      socket.off("email:message");
    };
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConnect = async (e) => {
    e.preventDefault();

    if (
      !form.emailAddress ||
      !form.imapHost ||
      !form.smtpHost ||
      !form.appPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setConnecting(true);

    try {
      const res = await connectEmailInbox(form);
      setStatus(res);
      toast.success("Email Connected Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Connect");
    }

    setConnecting(false);
  };

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = async () => {
    try {
      await disconnectEmailInbox();
      setActiveContact(null);
      setMessages([]);
      await loadStatus();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Disconnect");
    }

    setShowDisconnectConfirm(false);
  };

  const openConversation = async (email) => {
    setActiveContact(email);
    await loadMessages(email);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !activeContact) return;

    setSending(true);

    try {
      const activeConvo = conversations.find((c) => c._id === activeContact);

      const subject = activeConvo?.lastSubject
        ? `Re: ${activeConvo.lastSubject.replace(/^Re:\s*/i, "")}`
        : "(No Subject)";

      const res = await sendEmail(
        activeContact,
        subject,
        replyText.trim(),
        activeConvo?.relatedLead?._id
      );

      setMessages((prev) => [...prev, res.data]);
      setReplyText("");
      await loadConversations();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Send Email");
    }

    setSending(false);
  };

  return (
    <div className="inbox-page">
      <div className="page-header">
        <h1>
          <MdEmail className="inbox-header-icon email" /> Email Inbox
        </h1>
        <p>
          Apna business email connect karo taaki leads ke saath email
          conversations yahan sync ho.
        </p>
      </div>

      <div className="inbox-layout">
        <div className="inbox-connect-card glass-card">
          <h3>
            Connection Status{" "}
            {status.status === "connected" && (
              <span className="connected-pill">
                <MdCheckCircle /> Connected
              </span>
            )}
          </h3>

          {status.status === "connected" ? (
            <>
              <p className="inbox-connect-subtitle">
                Connected as <strong>{status.email}</strong>
              </p>

              {user?.role === "admin" && (
                <button className="wa-disconnect-btn" onClick={handleDisconnect}>
                  <MdLogout /> Disconnect
                </button>
              )}
            </>
          ) : status.status === "connecting" ? (
            <p className="inbox-connect-subtitle">Connecting...</p>
          ) : user?.role === "admin" ? (
            <form className="inbox-form" onSubmit={handleConnect}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.emailAddress}
                  onChange={(e) =>
                    setForm({ ...form, emailAddress: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>IMAP Host (incoming)</label>
                <input
                  type="text"
                  placeholder="imap.gmail.com"
                  value={form.imapHost}
                  onChange={(e) =>
                    setForm({ ...form, imapHost: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>SMTP Host (outgoing)</label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  value={form.smtpHost}
                  onChange={(e) =>
                    setForm({ ...form, smtpHost: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>App Password</label>
                <input
                  type="password"
                  placeholder="16-character app password"
                  value={form.appPassword}
                  onChange={(e) =>
                    setForm({ ...form, appPassword: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="save-btn" disabled={connecting}>
                {connecting ? "Connecting..." : "Save & Connect"}
              </button>
            </form>
          ) : (
            <p className="inbox-empty-sub">
              Sirf Admin email connect kar sakta hai.
            </p>
          )}

          <div className="wa-conversations-list">
            <h4>Conversations</h4>

            {conversations.length === 0 && (
              <p className="inbox-empty-sub">Koi conversation nahi hai abhi.</p>
            )}

            {conversations.map((c) => (
              <div
                key={c._id}
                className={`wa-convo-item ${
                  activeContact === c._id ? "active" : ""
                }`}
                onClick={() => openConversation(c._id)}
              >
                <div className="wa-convo-top">
                  <strong>{c.relatedLead?.customerName || c._id}</strong>
                  {c.unread > 0 && (
                    <span className="wa-unread-badge">{c.unread}</span>
                  )}
                </div>
                <p>{c.lastSubject}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="inbox-messages-card glass-card">
          {!activeContact ? (
            <div className="inbox-empty-state">
              <MdEmail className="inbox-empty-icon email" />
              <p>Koi conversation select karo</p>
              <p className="inbox-empty-sub">
                Left side se kisi conversation pe click karo message dekhne
                ke liye.
              </p>
            </div>
          ) : (
            <>
              <div className="wa-thread">
                {messages.map((msg) => (
                  <div key={msg._id} className={`wa-bubble ${msg.direction}`}>
                    <strong>{msg.subject}</strong>
                    <p>{msg.body}</p>
                    <small>
                      {new Date(msg.createdAt).toLocaleString("en-IN")}
                    </small>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              <form className="wa-reply-form" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={status.status !== "connected"}
                />
                <button
                  type="submit"
                  disabled={sending || status.status !== "connected"}
                >
                  <MdSend />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDisconnectConfirm}
        title="Disconnect Email"
        message="Disconnect this email account? Live sync will stop until you reconnect."
        confirmLabel="Disconnect"
        onConfirm={confirmDisconnect}
        onClose={() => setShowDisconnectConfirm(false)}
      />
    </div>
  );
}

export default EmailInbox;
