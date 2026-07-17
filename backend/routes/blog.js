import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listPosts, getPost, createPost, updatePost, deletePost } from "../utils/blogStore.js";

const router = Router();

// Publik: daftar semua blog (otomatis kebaca dari folder content/blog)
router.get("/", (req, res) => {
  try {
    const posts = listPosts().map(({ content, ...meta }) => meta); // list tanpa isi penuh
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memuat daftar blog." });
  }
});

// Publik: detail 1 blog
router.get("/:slug", (req, res) => {
  const post = getPost(req.params.slug);
  if (!post) return res.status(404).json({ error: "Blog tidak ditemukan." });
  res.json({ post });
});

// Admin only: buat blog baru -> otomatis jadi file .md baru di content/blog/
router.post("/", requireAuth, (req, res) => {
  const { title, content, excerpt, cover } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Judul dan isi blog wajib diisi." });
  }

  const post = createPost({
    title,
    content,
    excerpt,
    cover,
    author: req.user.name || req.user.email,
  });

  res.status(201).json({ ok: true, post });
});

// Admin only: edit blog
router.put("/:slug", requireAuth, (req, res) => {
  const { title, content, excerpt, cover } = req.body;
  const post = updatePost(req.params.slug, { title, content, excerpt, cover });
  if (!post) return res.status(404).json({ error: "Blog tidak ditemukan." });
  res.json({ ok: true, post });
});

// Admin only: hapus blog
router.delete("/:slug", requireAuth, (req, res) => {
  const success = deletePost(req.params.slug);
  if (!success) return res.status(404).json({ error: "Blog tidak ditemukan." });
  res.json({ ok: true });
});

export default router;
