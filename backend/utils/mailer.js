import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // belum dikonfigurasi -> pakai fallback console
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

/**
 * Kirim kode OTP ke email. Kalau SMTP belum dikonfigurasi, kode akan
 * ditampilkan di terminal server supaya development tetap jalan.
 */
export async function sendOtpEmail(email, code) {
  const tx = getTransporter();

  if (!tx) {
    console.log("\n================ [DEV MODE - OTP EMAIL] ================");
    console.log(`Ke     : ${email}`);
    console.log(`Kode   : ${code}`);
    console.log("SMTP belum dikonfigurasi di .env, jadi kode ini hanya");
    console.log("ditampilkan di sini. Isi SMTP_HOST/USER/PASS untuk kirim");
    console.log("email sungguhan.");
    console.log("==========================================================\n");
    return { devMode: true };
  }

  await tx.sendMail({
    from: process.env.MAIL_FROM || `"GPLKLTN" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Kode OTP Login - GPLKLTN",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; background:#0B0F0D; color:#F2EDE4; border-radius:12px;">
        <h2 style="color:#C9A227; margin-bottom:4px;">GPLKLTN</h2>
        <p style="color:#9BA39B; margin-top:0;">Geng Pukul Klaten - Pagar Nusa</p>
        <p>Kode OTP untuk login ke panel admin website:</p>
        <div style="font-size:32px; letter-spacing:8px; font-weight:bold; color:#C9A227; margin:16px 0;">${code}</div>
        <p style="color:#9BA39B; font-size:13px;">Kode berlaku 5 menit. Jangan bagikan kode ini ke siapapun.</p>
      </div>
    `,
  });

  return { devMode: false };
}
