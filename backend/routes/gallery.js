import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, "..", "content", "img");
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// Publik: daftar semua foto yang ada di folder content/img
// (kalau kamu taruh foto manual langsung ke folder ini, otomatis muncul)
router.get("/", (req, res) => {
  const files = fs
    .readdirSync(IMG_DIR)
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort()
    .reverse();

  res.json({ photos: files.map((f) => ({ filename: f, url: `/img/${f}` })) });
});

// Admin only: upload foto baru lewat panel admin
router.post("/", requireAuth, upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file foto yang dikirim." });
  res.status(201).json({ ok: true, url: `/img/${req.file.filename}` });
});

// Admin only: hapus foto
router.delete("/:filename", requireAuth, (req, res) => {
  const filePath = path.join(IMG_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Foto tidak ditemukan." });
  fs.unlinkSync(filePath);
  res.json({ ok: true });
});

export default router;
