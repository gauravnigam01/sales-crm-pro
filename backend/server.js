import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import connectDB from "./database/connectDB.js";
import { initSocket, attachSocket } from "./socket/socket.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import { initWhatsApp } from "./services/whatsappService.js";
import emailRoutes from "./routes/emailRoutes.js";
import { resumeEmailConnection } from "./services/emailService.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// =======================
// Connect Database
// =======================

connectDB();

// =======================
// Middlewares
// =======================

// CSP disabled: the frontend is a same-origin SPA bundle with inline styles;
// a strict default CSP would block it. Other headers (HSTS, X-Frame-Options,
// X-Content-Type-Options, etc.) stay on.
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
  "https://16.16.200.52.sslip.io",
  "http://ec2-16-16-200-52.eu-north-1.compute.amazonaws.com",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Blanket API rate limit — generous enough for normal dashboard use
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter limit on auth endpoints to blunt brute-force login attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiLimiter);

// =======================
// Test Route (only when no frontend build is present)
// =======================

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const frontendDist = path.join(__dirname, "..", "frontend", "dist");

const hasFrontendBuild = fs.existsSync(frontendDist);

// =======================
// ACME (Let's Encrypt) HTTP-01 challenge webroot
// =======================

const acmeWebroot = path.join(__dirname, "public_acme");

if (!fs.existsSync(acmeWebroot)) {
  fs.mkdirSync(acmeWebroot, { recursive: true });
}

app.use(express.static(acmeWebroot, { dotfiles: "allow" }));

if (!hasFrontendBuild) {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "🚀 Sales CRM Backend Running Successfully",
    });
  });
}

// =======================
// API Routes
// =======================

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/email", emailRoutes);

// =======================
// Serve Frontend (production build, if present)
// =======================

if (hasFrontendBuild) {
  app.use(
    express.static(frontendDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
          );
        }
      },
    })
  );

  app.get(/^(?!\/api).*/, (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// =======================
// Error Handler (CORS rejection, etc.)
// =======================

app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Not allowed by CORS",
    });
  }

  next(err);
});

// =======================
// Socket.io
// =======================

initSocket(server);

// =======================
// WhatsApp (resumes existing session, or waits for admin to connect)
// =======================

initWhatsApp().catch((err) =>
  console.log("WhatsApp init error:", err.message)
);

// =======================
// Email (resumes existing IMAP/SMTP connection, if previously connected)
// =======================

resumeEmailConnection().catch((err) =>
  console.log("Email resume error:", err.message)
);

// =======================
// HTTPS (only if a certificate is present)
// =======================

const sslKeyPath = path.join(__dirname, "ssl", "privkey.pem");
const sslCertPath = path.join(__dirname, "ssl", "fullchain.pem");

const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

if (hasSSL) {
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    },
    app
  );

  attachSocket(httpsServer);

  const HTTPS_PORT = process.env.HTTPS_PORT || 443;

  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
  });
}

// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});