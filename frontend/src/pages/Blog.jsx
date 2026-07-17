import React, { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import BlogCard from "../components/BlogCard.jsx";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPosts()
      .then((d) => setPosts(d.posts))
      .catch(() => setError("Gagal memuat blog. Coba muat ulang halaman."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">Berita &amp; Blog</p>
      <h1 className="font-display text-4xl md:text-5xl text-cream mb-10">
        KABAR GPLKLTN
      </h1>

      {loading && <p className="text-muted">Memuat berita...</p>}
      {error && <p className="text-merah">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="text-muted">Belum ada blog yang diterbitkan. Nantikan kabar terbaru dari pengurus.</p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <BlogCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
