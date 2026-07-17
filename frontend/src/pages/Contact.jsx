import React from "react";

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20">
      <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">Hubungi Kami</p>
      <h1 className="font-display text-4xl md:text-5xl text-cream mb-8">KONTAK</h1>

      <div className="space-y-4 text-muted">
        <p>Ingin bergabung dengan GPLKLTN atau punya pertanyaan? Silakan hubungi pengurus melalui:</p>
        <ul className="space-y-2">
          <li><strong className="text-cream">Alamat</strong> — Klaten, Jawa Tengah</li>
          <li><strong className="text-cream">Email</strong> — info@gplkltn.site</li>
          <li><strong className="text-cream">Instagram</strong> — @gplkltn</li>
        </ul>
      </div>
    </div>
  );
}
