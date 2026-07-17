import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import slugify from "slugify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BLOG_DIR = path.join(__dirname, "..", "content", "blog");

if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

/**
 * Setiap postingan blog = satu file .md di backend/content/blog/
 * Format file:
 * ---
 * title: Judul Blog
 * date: 2026-07-17
 * author: Nama Penulis
 * cover: /img/nama-file.jpg
 * excerpt: Ringkasan singkat
 * ---
 * Isi blog dalam Markdown di sini...
 *
 * Admin bisa nambah blog lewat panel admin (otomatis bikin file ini),
 * ATAU langsung taruh file .md baru di folder content/blog/ -- otomatis
 * kebaca oleh website tanpa perlu restart server.
 */

function readPostFile(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, "");
  return {
    slug,
    title: data.title || slug,
    date: data.date || null,
    author: data.author || "Admin GPLKLTN",
    cover: data.cover || null,
    excerpt: data.excerpt || content.slice(0, 160).replace(/\n/g, " ") + "...",
    content,
  };
}

export function listPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map(readPostFile);
  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return posts;
}

export function getPost(slug) {
  const filename = `${slug}.md`;
  if (!fs.existsSync(path.join(BLOG_DIR, filename))) return null;
  return readPostFile(filename);
}

export function createPost({ title, author, cover, excerpt, content }) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (fs.existsSync(path.join(BLOG_DIR, `${slug}.md`))) {
    slug = `${baseSlug}-${i++}`;
  }

  const date = new Date().toISOString().slice(0, 10);
  const frontmatter = matter.stringify(content || "", {
    title,
    date,
    author: author || "Admin GPLKLTN",
    cover: cover || null,
    excerpt: excerpt || "",
  });

  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), frontmatter, "utf-8");
  return getPost(slug);
}

export function updatePost(slug, { title, author, cover, excerpt, content, date }) {
  const existing = getPost(slug);
  if (!existing) return null;

  const frontmatter = matter.stringify(content ?? existing.content, {
    title: title ?? existing.title,
    date: date ?? existing.date,
    author: author ?? existing.author,
    cover: cover ?? existing.cover,
    excerpt: excerpt ?? existing.excerpt,
  });

  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), frontmatter, "utf-8");
  return getPost(slug);
}

export function deletePost(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
