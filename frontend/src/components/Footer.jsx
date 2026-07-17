import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-6xl mx-auto px-5 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg text-gold mb-2">GPLKLTN</h3>
          <p className="text-muted text-sm leading-relaxed">
            Geng Pukul Klaten — komunitas Pagar Nusa (IPS NU) di Klaten. Wadah
            latihan, silaturahmi, dan pelestarian pencak silat untuk warga NU.
          </p>
        </div>
        <div>
          <h4 className="text-cream text-sm uppercase tracking-wider mb-3">Tautan</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="/tentang" className="hover:text-gold">Tentang Kami</a></li>
            <li><a href="/blog" className="hover:text-gold">Berita &amp; Blog</a></li>
            <li><a href="/galeri" className="hover:text-gold">Galeri Kegiatan</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-cream text-sm uppercase tracking-wider mb-3">Kontak</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>Klaten, Jawa Tengah</li>
            <li>gplkltn.site</li>
            <li>info@gplkltn.site</li>
          </ul>
        </div>
      </div>
      <div className="slash-divider max-w-6xl mx-auto" />
      <p className="text-center text-xs text-muted py-6">
        &copy; {new Date().getFullYear()} GPLKLTN — Pagar Nusa Klaten. Sekali Pagar Nusa, Tetap Pagar Nusa.
      </p>
    </footer>
  );
}
