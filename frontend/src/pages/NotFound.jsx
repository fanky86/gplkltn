import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-5 py-32 text-center">
      <h1 className="font-display text-6xl text-gold mb-4">404</h1>
      <p className="text-muted mb-8">Halaman yang kamu cari tidak ditemukan.</p>
      <Link to="/" className="text-gold hover:underline">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
