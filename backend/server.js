import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blog.js";
import galleryRoutes from "./routes/gallery.js";
import "./db/init.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5017;

// Header keamanan standar (anti clickjacking, sniffing, dll)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Hanya frontend GPLKLTN yang boleh memanggil API ini
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Batasi jumlah request ke semua endpoint auth (anti brute force/spam).
// Maksimal 20 percobaan per 15 menit per IP untuk request/verifikasi OTP
// maupun login Google.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
});
app.use("/api/auth", authLimiter);

// Batasi khusus percobaan verifikasi kode OTP lebih ketat (anti tebak kode)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan verifikasi. Coba lagi beberapa menit lagi." },
});
app.use("/api/auth/otp/verify", otpVerifyLimiter);

// Folder foto (content/img) diakses publik lewat /img/nama-file.jpg
// -> ini folder yang dimaksud "tinggal taruh foto di sini"
app.use("/img", express.static(path.join(__dirname, "content", "img")));

app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "GPLKLTN API", time: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

app.listen(PORT, () => {
  console.log(`\n🥋 GPLKLTN backend jalan di http://localhost:${PORT}`);
  console.log(`   Folder foto : backend/content/img`);
  console.log(`   Folder blog : backend/content/blog\n`);
});
