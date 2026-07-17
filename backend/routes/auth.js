import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import db from "../db/init.js";
import { sendOtpEmail } from "../utils/mailer.js";

// Kode OTP tidak pernah disimpan sebagai teks polos di database -- hanya
// hash-nya. Jadi walau file database bocor, kode OTP tidak bisa dibaca.
function hashCode(code) {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(code)
    .digest("hex");
}

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  return getAdminEmails().includes(email.toLowerCase());
}

function issueSessionCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("gplkltn_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function upsertUser({ email, name, avatar_url, provider }) {
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (existing) {
    db.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE email = ?").run(
      name || existing.name,
      avatar_url || existing.avatar_url,
      email
    );
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  const info = db
    .prepare(
      "INSERT INTO users (email, name, avatar_url, provider, role) VALUES (?, ?, ?, ?, 'admin')"
    )
    .run(email, name || null, avatar_url || null, provider);

  return db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
}

/* ---------------- GOOGLE LOGIN ---------------- */
// Frontend kirim Google ID token (credential) hasil dari Google Identity Services
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Credential Google tidak ditemukan." });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    if (!isAdminEmail(email)) {
      return res.status(403).json({
        error: "Email ini belum terdaftar sebagai admin GPLKLTN. Hubungi pengurus untuk didaftarkan.",
      });
    }

    const user = upsertUser({
      email,
      name: payload.name,
      avatar_url: payload.picture,
      provider: "google",
    });

    issueSessionCookie(res, user);
    res.json({ ok: true, user: { email: user.email, name: user.name, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Login Google gagal diverifikasi." });
  }
});

/* ---------------- EMAIL OTP LOGIN ---------------- */
const GENERIC_OTP_MESSAGE =
  "Kalau email ini terdaftar sebagai admin GPLKLTN, kode OTP sudah dikirim.";

router.post("/otp/request", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email wajib diisi." });

  const normalizedEmail = email.toLowerCase();

  // PENTING: kalau email BUKAN admin, kita tetap balas seolah-olah berhasil
  // (pesan generik) dan TIDAK mengirim email/menyimpan kode apapun. Ini
  // mencegah orang luar "menebak-nebak" email mana saja yang jadi admin
  // hanya dengan mencoba satu per satu (email enumeration attack).
  if (!isAdminEmail(normalizedEmail)) {
    return res.json({ ok: true, message: GENERIC_OTP_MESSAGE, devMode: false });
  }

  // Cegah spam kirim OTP berkali-kali dalam waktu dekat (jeda 60 detik)
  const recent = db
    .prepare(
      "SELECT created_at FROM otp_codes WHERE email = ? ORDER BY id DESC LIMIT 1"
    )
    .get(normalizedEmail);
  const recentTime = recent ? new Date(recent.created_at.replace(" ", "T") + "Z").getTime() : 0;
  if (recent && Date.now() - recentTime < 60 * 1000) {
    return res.json({ ok: true, message: GENERIC_OTP_MESSAGE, devMode: false });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  db.prepare(
    "INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)"
  ).run(normalizedEmail, hashCode(code), expiresAt);

  const result = await sendOtpEmail(normalizedEmail, code);

  res.json({
    ok: true,
    message: GENERIC_OTP_MESSAGE,
    devMode: result.devMode || false, // kalau true, cek terminal server untuk kode
  });
});

router.post("/otp/verify", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "Email dan kode OTP wajib diisi." });

  const normalizedEmail = email.toLowerCase();

  // Selalu tolak email non-admin, tanpa membedakan pesan errornya dari
  // kasus "kode salah" -- supaya tidak membocorkan status admin/bukan.
  if (!isAdminEmail(normalizedEmail)) {
    return res.status(400).json({ error: "Email atau kode OTP tidak valid." });
  }

  const otpRow = db
    .prepare(
      "SELECT * FROM otp_codes WHERE email = ? AND used = 0 ORDER BY id DESC LIMIT 1"
    )
    .get(normalizedEmail);

  if (!otpRow) {
    return res.status(400).json({ error: "Email atau kode OTP tidak valid." });
  }

  if (new Date(otpRow.expires_at) < new Date()) {
    return res.status(400).json({ error: "Kode OTP sudah kedaluwarsa. Minta kode baru." });
  }

  if (otpRow.attempts >= 5) {
    return res.status(400).json({ error: "Terlalu banyak percobaan salah. Minta kode baru." });
  }

  if (otpRow.code !== hashCode(String(code))) {
    db.prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?").run(otpRow.id);
    return res.status(400).json({ error: "Kode OTP salah." });
  }

  db.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?").run(otpRow.id);

  const user = upsertUser({ email: normalizedEmail, name: null, avatar_url: null, provider: "otp" });
  issueSessionCookie(res, user);

  res.json({ ok: true, user: { email: user.email, name: user.name } });
});

/* ---------------- SESSION ---------------- */
router.get("/me", (req, res) => {
  const token = req.cookies?.gplkltn_token;
  if (!token) return res.json({ user: null });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.json({ user: null });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("gplkltn_token");
  res.json({ ok: true });
});

export default router;
