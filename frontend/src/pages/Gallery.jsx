import React, { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.getPhotos().then((d) => setPhotos(d.photos)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">Dokumentasi</p>
      <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">GALERI KEGIATAN</h1>
      <p className="text-muted mb-10 max-w-xl">
        Dokumentasi latihan, kegiatan, dan momen kebersamaan GPLKLTN. Foto
        baru otomatis muncul di sini setelah ditambahkan oleh pengurus.
      </p>

      {photos.length === 0 && <p className="text-muted">Belum ada foto yang diunggah.</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((p) => (
          <button
            key={p.filename}
            onClick={() => setActive(p.url)}
            className="aspect-square overflow-hidden bg-surface2"
          >
            <img
              src={p.url}
              alt="Kegiatan GPLKLTN"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6"
          onClick={() => setActive(null)}
        >
          <img src={active} alt="Pratinjau" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
