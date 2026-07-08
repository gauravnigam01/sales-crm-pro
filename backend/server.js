import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./database/connectDB.js";
import leadRoutes from "./routes/leadRoutes.js";

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// =======================
// Middlewares
// =======================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Routes
// =======================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Sales CRM Backend Running Successfully",
  });
});

app.use("/api/auth", authRoutes);// Lead Routes
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);

// =======================
// Server
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});