import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const googleBtnRef = useRef(null);

  const [step, setStep] = useState("email"); // 'email' | 'otp'
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // --- Google Sign-In ---
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setError("");
        setBusy(true);
        try {
          await api.loginGoogle(response.credential);
          await refresh();
          navigate("/admin");
        } catch (err) {
          setError(err.message);
        } finally {
          setBusy(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      width: 280,
    });
  }, [navigate, refresh]);

  // --- Email OTP ---
  async function handleRequestOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const res = await api.requestOtp(email);
      setStep("otp");
      setInfo(
        res.devMode
          ? "Mode development: cek terminal server backend untuk melihat kode OTP."
          : res.message
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.verifyOtp(email, code);
      await refresh();
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-24">
      <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4 text-center">Panel Pengurus</p>
      <h1 className="font-display text-3xl text-cream mb-10 text-center">LOGIN ADMIN</h1>

      <div className="bg-surface border border-white/5 p-8">
        {/* Google login */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div ref={googleBtnRef} />
          <p className="text-muted text-xs text-center mt-2">
            Login pakai akun Google yang sudah terdaftar sebagai admin.
          </p>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-muted text-xs uppercase">atau</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Email OTP login */}
        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Email Admin</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gplkltn.site"
                className="w-full bg-ink border border-white/10 px-4 py-3 text-cream focus:border-gold outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-gold text-ink font-semibold uppercase text-sm tracking-wide hover:bg-goldSoft transition-colors disabled:opacity-50"
            >
              {busy ? "Mengirim..." : "Kirim Kode OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Kode OTP (6 digit)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full bg-ink border border-white/10 px-4 py-3 text-cream tracking-[0.5em] text-center text-xl focus:border-gold outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-gold text-ink font-semibold uppercase text-sm tracking-wide hover:bg-goldSoft transition-colors disabled:opacity-50"
            >
              {busy ? "Memverifikasi..." : "Verifikasi & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-muted text-xs hover:text-cream"
            >
              Ganti email / kirim ulang kode
            </button>
          </form>
        )}

        {info && <p className="text-pusaka bg-pusaka/10 border border-pusaka/30 text-sm p-3 mt-5">{info}</p>}
        {error && <p className="text-merah bg-merah/10 border border-merah/30 text-sm p-3 mt-5">{error}</p>}
      </div>
    </div>
  );
}
