import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../lib/api.js";

export default function AdminPostEditor({ mode }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [cover, setCover] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (mode === "edit" && slug) {
      api.getPost(slug).then((d) => {
        setTitle(d.post.title);
        setExcerpt(d.post.excerpt);
        setCover(d.post.cover || "");
        setContent(d.post.content);
      }).catch((e) => setError(e.message));
    }
  }, [mode, slug]);

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await api.uploadPhoto(file);
      setCover(res.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = { title, excerpt, cover, content };
      if (mode === "create") {
        const res = await api.createPost(payload);
        navigate(`/admin/edit/${res.post.slug}`);
      } else {
        await api.updatePost(slug, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">Panel Pengurus</p>
      <h1 className="font-display text-3xl text-cream mb-10">
        {mode === "create" ? "TULIS BLOG BARU" : "EDIT BLOG"}
      </h1>

      {error && <p className="text-merah bg-merah/10 border border-merah/30 text-sm p-3 mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-1">Judul</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-white/10 px-4 py-3 text-cream focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Ringkasan Singkat</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full bg-surface border border-white/10 px-4 py-3 text-cream focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Foto Cover</label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 border border-gold text-gold text-sm uppercase tracking-wide hover:bg-gold hover:text-ink cursor-pointer transition-colors">
                {uploadingCover ? "Mengunggah..." : "Unggah Foto"}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
              {cover && <span className="text-muted text-xs">{cover}</span>}
            </div>
            {cover && (
              <div className="mt-3 aspect-video bg-surface2 overflow-hidden max-w-xs">
                <img src={cover} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Isi Blog (Markdown)</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="Tulis isi blog di sini. Bisa pakai Markdown: **tebal**, ## judul, - list, dll."
              className="w-full bg-surface border border-white/10 px-4 py-3 text-cream font-mono text-sm focus:border-gold outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-gold text-ink font-semibold uppercase text-sm tracking-wide hover:bg-goldSoft transition-colors disabled:opacity-50"
          >
            {busy ? "Menyimpan..." : mode === "create" ? "Terbitkan Blog" : "Simpan Perubahan"}
          </button>
        </div>

        <div>
          <p className="text-sm text-muted mb-1 uppercase tracking-wide">Pratinjau</p>
          <div className="bg-surface border border-white/10 p-6 min-h-[400px]">
            <h2 className="font-serif2 text-2xl text-cream mb-4">{title || "Judul blog..."}</h2>
            <div className="prose-blog">
              <ReactMarkdown>{content || "*Isi blog akan muncul di sini...*"}</ReactMarkdown>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
