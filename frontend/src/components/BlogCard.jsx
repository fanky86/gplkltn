import React from "react";
import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-surface border border-white/5 hover:border-gold/40 transition-colors"
    >
      <div className="aspect-[16/10] bg-surface2 overflow-hidden">
        {post.cover ? (
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted font-display text-3xl">
            GPLKLTN
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-gold uppercase tracking-wider mb-2">
          {post.date ? new Date(post.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
        </p>
        <h3 className="font-serif2 text-xl text-cream mb-2 group-hover:text-gold transition-colors">
          {post.title}
        </h3>
        <p className="text-muted text-sm line-clamp-2">{post.excerpt}</p>
      </div>
    </Link>
  );
}
