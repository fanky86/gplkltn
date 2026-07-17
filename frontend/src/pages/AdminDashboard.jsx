import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [tab, setTab] = useState("blog"); // 'blog' | 'foto'
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function loadPosts() {
    api.getPosts().then((d) => setPosts(d.posts)).catch((e) => setError(e.message));
  }
  function loadPhotos() {
    api.getPhotos().then((d) => setPhotos(d.photos)).catch((e) => setError(e.message));
  }

  useEffect(() => {
    loadPosts();
    loadPhotos();
  }, []);

  async function handleDeletePost(slug) {
    if (!confirm(`Hapus blog "${slug}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.deletePost(slug);
      loadPosts();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleUploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadPhoto(file);
      loadPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeletePhoto(filename) {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await api.deletePhoto(filename);
      loadPhotos();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-gold uppercase tracking-[0.3em] text-xs mb-2">Panel Pengurus</p>
          <h1 className="font-display text-3xl text-cream">
            Halo, {user?.name || user?.email}
          </h1>
        </div>
        <button
          onClick={logout}
          className="px-5 py-2 border border-white/20 text-muted text-sm hover:text-cream hover:border-cream/40 transition-colors"
        >
          Keluar
        </button>
      </div>

      {error && <p className="text-merah bg-merah/10 border border-merah/30 text-sm p-3 mb-6">{error}</p>}

      <div className="flex gap-2 mb-8 border-b border-white/10">
        <button
          onClick={() => setTab("blog")}
          className={`px-4 py-2 text-sm uppercase tracking-wide ${tab === "blog" ? "text-gold border-b-2 border-gold" : "text-muted"}`}
        >
          Kelola Blog
        </button>
        <button
          onClick={() => setTab("foto")}
          className={`px-4 py-2 text-sm uppercase tracking-wide ${tab === "foto" ? "text-gold border-b-2 border-gold" : "text-muted"}`}
        >
          Kelola Foto
        </button>
      </div>

      {tab === "blog" && (
        <div>
          <div className="flex justify-end mb-5">
            <Link
              to="/admin/new"
              className="px-5 py-2 bg-gold text-ink text-sm font-semibold uppercase tracking-wide hover:bg-goldSoft transition-colors"
            >
              + Tulis Blog Baru
            </Link>
          </div>

          <div className="divide-y divide-white/5 border border-white/5">
            {posts.length === 0 && <p className="text-muted p-5">Belum ada blog.</p>}
            {posts.map((p) => (
              <div key={p.slug} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-cream">{p.title}</p>
                  <p className="text-muted text-xs">{p.date} &middot; {p.author}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link to={`/blog/${p.slug}`} className="text-muted hover:text-cream">Lihat</Link>
                  <Link to={`/admin/edit/${p.slug}`} className="text-gold hover:underline">Edit</Link>
                  <button onClick={() => handleDeletePost(p.slug)} className="text-merah hover:underline">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted text-xs mt-5">
            Tips: kamu juga bisa menambah blog langsung dengan menaruh file{" "}
            <code className="text-gold">.md</code> baru di folder{" "}
            <code className="text-gold">backend/content/blog/</code> — otomatis muncul di sini.
          </p>
        </div>
      )}

      {tab === "foto" && (
        <div>
          <div className="flex justify-end mb-5">
            <label className="px-5 py-2 bg-gold text-ink text-sm font-semibold uppercase tracking-wide hover:bg-goldSoft transition-colors cursor-pointer">
              {uploading ? "Mengunggah..." : "+ Unggah Foto"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadPhoto}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {photos.length === 0 && <p className="text-muted">Belum ada foto.</p>}
            {photos.map((p) => (
              <div key={p.filename} className="relative group aspect-square bg-surface2 overflow-hidden">
                <img src={p.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeletePhoto(p.filename)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-merah text-sm flex items-center justify-center"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <p className="text-muted text-xs mt-5">
            Tips: kamu juga bisa menaruh foto langsung ke folder{" "}
            <code className="text-gold">backend/content/img/</code> — otomatis muncul di galeri.
          </p>
        </div>
      )}
    </div>
  );
}
