import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang" },
  { to: "/blog", label: "Berita & Blog" },
  { to: "/galeri", label: "Galeri" },
  { to: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur border-b border-white/5">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-wide text-cream">
          <span className="text-gold">GPLKLTN</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `uppercase tracking-wide transition-colors ${
                  isActive ? "text-gold" : "text-muted hover:text-cream"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to={user ? "/admin" : "/admin/login"}
            className="px-4 py-2 border border-gold text-gold text-xs uppercase tracking-wider hover:bg-gold hover:text-ink transition-colors"
          >
            {user ? "Panel Admin" : "Login Admin"}
          </Link>
        </nav>

        <button
          className="md:hidden text-cream"
          onClick={() => setOpen((o) => !o)}
          aria-label="Buka menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-surface border-t border-white/5 px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-muted uppercase text-sm tracking-wide"
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to={user ? "/admin" : "/admin/login"}
            onClick={() => setOpen(false)}
            className="text-gold uppercase text-sm tracking-wide"
          >
            {user ? "Panel Admin" : "Login Admin"}
          </Link>
        </nav>
      )}
    </header>
  );
}
