import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blog.js";
import galleryRoutes from "./routes/gallery.js";
import "./db/init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5017;

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Rate limit auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  },
});

app.use("/api/auth", authLimiter);

// Rate limit verifikasi OTP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak percobaan verifikasi. Coba lagi beberapa menit lagi.",
  },
});

app.use("/api/auth/otp/verify", otpVerifyLimiter);

// Static folder gambar
app.use("/img", express.static(path.join(__dirname, "content", "img")));

// ================= API =================

app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "GPLKLTN API",
    time: new Date().toISOString(),
  });
});

// ============== FRONTEND ==============

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ============== ERROR ==============

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Terjadi kesalahan pada server.",
  });
});

// ============== START ==============

app.listen(PORT, () => {
  console.log(`🥋 GPLKLTN berjalan`);
  console.log(`Frontend : http://localhost:${PORT}`);
  console.log(`API      : http://localhost:${PORT}/api`);
  console.log(`Health   : http://localhost:${PORT}/api/health`);
});
