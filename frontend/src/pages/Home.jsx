import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import BlogCard from "../components/BlogCard.jsx";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    api.getPosts().then((d) => setPosts(d.posts.slice(0, 3))).catch(() => {});
    api.getPhotos().then((d) => setPhotos(d.photos.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink bg-parang border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-24 md:py-36 relative z-10">
          <p className="text-gold uppercase tracking-[0.3em] text-xs mb-5">
            Ikatan Pencak Silat Nahdlatul Ulama
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-cream max-w-3xl">
            GENG PUKUL <span className="text-gold">KLATEN</span>
          </h1>
          <p className="mt-6 max-w-xl text-muted text-base md:text-lg font-serif2 italic">
            "Sekali Pagar Nusa, tetap Pagar Nusa." Wadah latihan, silaturahmi,
            dan pelestarian pencak silat Pagar Nusa di Klaten.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/tentang"
              className="px-6 py-3 bg-gold text-ink font-semibold text-sm uppercase tracking-wide hover:bg-goldSoft transition-colors"
            >
              Kenali GPLKLTN
            </Link>
            <Link
              to="/blog"
              className="px-6 py-3 border border-cream/30 text-cream text-sm uppercase tracking-wide hover:border-gold hover:text-gold transition-colors"
            >
              Baca Berita
            </Link>
          </div>
        </div>
        <div className="slash-divider absolute bottom-0 left-0 right-0" />
      </section>

      {/* NILAI / PILAR */}
      <section className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-3 gap-8">
        {[
          { title: "Latihan Rutin", desc: "Jadwal latihan jurus, fisik, dan mental ala pesantren setiap pekan." },
          { title: "Ukhuwah", desc: "Menjaga silaturahmi antar anggota dan warga Nahdlatul Ulama Klaten." },
          { title: "Pelestarian Budaya", desc: "Menjaga warisan pencak silat sebagai identitas dan bela diri bangsa." },
        ].map((item) => (
          <div key={item.title} className="border-t-2 border-gold pt-5">
            <h3 className="font-serif2 text-xl text-cream mb-2">{item.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* BLOG TERBARU */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl text-cream">BERITA TERBARU</h2>
            <Link to="/blog" className="text-gold text-sm uppercase tracking-wide hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* GALERI PREVIEW */}
      {photos.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl text-cream">GALERI KEGIATAN</h2>
            <Link to="/galeri" className="text-gold text-sm uppercase tracking-wide hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((p) => (
              <div key={p.filename} className="aspect-square overflow-hidden bg-surface2">
                <img src={p.url} alt="Kegiatan GPLKLTN" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
