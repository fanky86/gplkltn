import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../lib/api.js";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPost(null);
    setError("");
    api
      .getPost(slug)
      .then((d) => setPost(d.post))
      .catch(() => setError("Blog tidak ditemukan."));
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <p className="text-merah mb-4">{error}</p>
        <Link to="/blog" className="text-gold hover:underline">
          Kembali ke daftar blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return <div className="max-w-3xl mx-auto px-5 py-24 text-muted">Memuat...</div>;
  }

  return (
    <article className="max-w-3xl mx-auto px-5 py-20">
      <Link to="/blog" className="text-gold text-sm uppercase tracking-wide hover:underline">
        ← Kembali
      </Link>

      <p className="text-gold uppercase tracking-[0.3em] text-xs mt-6 mb-3">
        {post.date
          ? new Date(post.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          : ""}{" "}
        &middot; {post.author}
      </p>
      <h1 className="font-display text-3xl md:text-5xl text-cream mb-8 leading-tight">
        {post.title}
      </h1>

      {post.cover && (
        <div className="aspect-[16/9] bg-surface2 mb-10 overflow-hidden">
          <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose-blog">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
