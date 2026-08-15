import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { MdWhatsapp, MdCheckCircle, MdSend, MdLogout } from "react-icons/md";
import ConfirmDialog from "../components/ConfirmDialog";

import {
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendWhatsAppMessage,
  getConversations,
  getMessagesByPhone,
} from "../services/whatsappService";

import "../styles/InboxPage.css";

const socket = io(import.meta.env.PROD ? undefined : "http://localhost:5000");

function WhatsappInbox() {
  const [status, setStatus] = useState({
    status: "disconnected",
    qr: null,
    number: null,
  });

  const [conversations, setConversations] = useState([]);
  const [activePhone, setActivePhone] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loadStatus = async () => {
    try {
      const res = await getWhatsAppStatus();
      setStatus(res);
    } catch (error) {
      console.log(error);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.conversations);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMessages = async (phone) => {
    try {
      const res = await getMessagesByPhone(phone);
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

    socket.on("whatsapp:status", (data) => {
      setStatus(data);
    });

    socket.on("whatsapp:message", (msg) => {
      loadConversations();

      if (activePhone && msg.phone.slice(-10) === activePhone.slice(-10)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("whatsapp:status");
      socket.off("whatsapp:message");
    };
  }, [activePhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConnect = async () => {
    setConnecting(true);

    try {
      const res = await connectWhatsApp();
      setStatus(res);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Start Connection");
    }

    setConnecting(false);
  };

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = async () => {
    try {
      await disconnectWhatsApp();
      setActivePhone(null);
      setMessages([]);
      await loadStatus();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Disconnect");
    }

    setShowDisconnectConfirm(false);
  };

  const openConversation = async (phone) => {
    setActivePhone(phone);
    await loadMessages(phone);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !activePhone) return;

    setSending(true);

    try {
      const activeConvo = conversations.find(
        (c) => c._id.slice(-10) === activePhone.slice(-10)
      );

      const res = await sendWhatsAppMessage(
        activePhone,
        replyText.trim(),
        activeConvo?.relatedLead?._id
      );

      setMessages((prev) => [...prev, res.data]);
      setReplyText("");
      await loadConversations();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Send Message");
    }

    setSending(false);
  };

  return (
    <div className="inbox-page">
      <div className="page-header">
        <h1>
          <MdWhatsapp className="inbox-header-icon whatsapp" /> WhatsApp
          Inbox
        </h1>
        <p>Connect a real WhatsApp number and chat directly from here.</p>
      </div>

      <div className="inbox-layout wa-layout">
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
                Connected as <strong>+{status.number}</strong>
              </p>

              {user?.role === "admin" && (
                <button className="wa-disconnect-btn" onClick={handleDisconnect}>
                  <MdLogout /> Disconnect
                </button>
              )}
            </>
          ) : status.status === "qr" && status.qr ? (
            <>
              <p className="inbox-connect-subtitle">
                Open WhatsApp on your phone → Linked Devices → Link a Device
                → Scan this QR code.
              </p>

              <img src={status.qr} alt="WhatsApp QR Code" className="wa-qr-img" />
            </>
          ) : status.status === "connecting" ? (
            <p className="inbox-connect-subtitle">Connecting...</p>
          ) : (
            <>
              <p className="inbox-connect-subtitle">
                WhatsApp isn't connected. Connect and scan the QR code
                with your business number.
              </p>

              {user?.role === "admin" ? (
                <button
                  className="save-btn"
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? "Starting..." : "Connect WhatsApp"}
                </button>
              ) : (
                <p className="inbox-empty-sub">
                  Only an Admin can connect WhatsApp.
                </p>
              )}
            </>
          )}

          <div className="wa-conversations-list">
            <h4>Conversations</h4>

            {conversations.length === 0 && (
              <p className="inbox-empty-sub">No conversations yet.</p>
            )}

            {conversations.map((c) => (
              <div
                key={c._id}
                className={`wa-convo-item ${
                  activePhone?.slice(-10) === c._id.slice(-10) ? "active" : ""
                }`}
                onClick={() => openConversation(c._id)}
              >
                <div className="wa-convo-top">
                  <strong>
                    {c.relatedLead?.customerName || `+${c._id}`}
                  </strong>
                  {c.unread > 0 && (
                    <span className="wa-unread-badge">{c.unread}</span>
                  )}
                </div>
                <p>{c.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="inbox-messages-card glass-card">
          {!activePhone ? (
            <div className="inbox-empty-state">
              <MdWhatsapp className="inbox-empty-icon whatsapp" />
              <p>Select a conversation</p>
              <p className="inbox-empty-sub">
                Click a conversation on the left to view messages.
              </p>
            </div>
          ) : (
            <>
              <div className="wa-thread">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`wa-bubble ${msg.direction}`}
                  >
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
                  placeholder="Type a message..."
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
        title="Disconnect WhatsApp"
        message="Disconnect WhatsApp? You'll need to scan the QR code again to reconnect."
        confirmLabel="Disconnect"
        onConfirm={confirmDisconnect}
        onClose={() => setShowDisconnectConfirm(false)}
      />
    </div>
  );
}

export default WhatsappInbox;
