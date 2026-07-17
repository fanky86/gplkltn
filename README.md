# Website GPLKLTN (Geng Pukul Klaten — Pagar Nusa)

Website komunitas untuk GPLKLTN: profil, berita/blog, dan galeri foto, dengan
panel admin yang bisa login pakai **Google** atau **email + kode OTP**.

## Struktur Folder

```
gplkltn-site/
├── backend/                  API server (Express + SQLite)
│   ├── content/
│   │   ├── blog/             ⭐ taruh/edit file blog (.md) di sini
│   │   └── img/               ⭐ taruh foto (.jpg/.png/.webp) di sini
│   ├── routes/                auth.js, blog.js, gallery.js
│   ├── middleware/auth.js
│   ├── utils/                 mailer OTP, pengelola file blog
│   ├── db/                    database SQLite (otomatis dibuat)
│   └── server.js
└── frontend/                  Website (React + Vite + Tailwind)
    └── src/
        ├── pages/              Beranda, Tentang, Blog, Galeri, Admin, dll
        └── components/
```

### ⭐ Cara paling gampang nambah konten

- **Nambah blog manual**: buat file baru `backend/content/blog/judul-blog.md`
  dengan format:
  ```
  ---
  title: Judul Blog
  date: '2026-07-20'
  author: Nama Kamu
  cover: /img/nama-foto.jpg
  excerpt: Ringkasan singkat
  ---

  Isi blog di sini, bisa pakai Markdown.
  ```
  Otomatis muncul di website begitu file disimpan — tidak perlu restart server.

- **Nambah foto manual**: taruh file foto ke `backend/content/img/`. Otomatis
  muncul di galeri. Nama file jadi bagian dari URL, jadi pakai nama yang rapi
  (huruf kecil, pakai `-`, tanpa spasi).

- **Lewat panel admin** (lebih praktis untuk yang tidak familiar dengan file):
  login di `/admin/login`, lalu tulis/edit blog dan upload foto langsung dari
  browser. Ini otomatis membuat/mengubah file yang sama di folder di atas.

## Setup & Menjalankan (Development)

Butuh Node.js versi 18 ke atas.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: isi JWT_SECRET, ADMIN_EMAILS, GOOGLE_CLIENT_ID, SMTP (opsional)
npm run dev
```

Backend jalan di `http://localhost:5017`.

> Kalau SMTP belum diisi di `.env`, kode OTP akan otomatis tampil di
> **terminal server** supaya tetap bisa dites tanpa perlu setup email dulu.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# isi VITE_GOOGLE_CLIENT_ID (harus sama dengan punya backend)
npm run dev
```

Buka `http://localhost:5173`.

## Setup Login Admin

### A. Login Google

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Buat **OAuth 2.0 Client ID** tipe "Web application".
3. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:5173` (development)
   - `https://gplkltn.site` (production)
4. Salin Client ID, isi ke `backend/.env` (`GOOGLE_CLIENT_ID`) dan
   `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

### B. Login Email + OTP

1. Isi `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, dll di `backend/.env` — bisa
   pakai Gmail App Password, atau SMTP dari layanan hosting/domain kamu.
2. Kode OTP berlaku 5 menit, maksimal 5x percobaan salah.

### Siapa yang boleh jadi admin?

Isi `ADMIN_EMAILS` di `backend/.env` dengan email pengurus yang boleh login
(pisahkan koma kalau lebih dari satu). Baik login Google maupun OTP, keduanya
dicek terhadap daftar ini — email di luar daftar **tidak akan pernah bisa
login**, termasuk lewat OTP, karena kode hanya dikirim kalau emailnya memang
ada di daftar `ADMIN_EMAILS`.

## Lapisan Keamanan yang Sudah Diterapkan

- **Whitelist admin** — hanya email di `ADMIN_EMAILS` yang bisa login, baik
  lewat Google maupun OTP. Publik/pengunjung biasa sama sekali tidak bisa
  masuk ke panel admin, apapun caranya.
- **Anti email enumeration** — kalau orang coba login pakai email yang bukan
  admin, sistem tetap membalas pesan yang sama seperti email valid (tidak
  membocorkan email siapa saja yang terdaftar sebagai admin).
- **Kode OTP di-hash** — kode tidak pernah disimpan sebagai teks polos di
  database, hanya hash-nya. Kode juga kedaluwarsa dalam 5 menit, maksimal 5x
  percobaan salah per kode, dan ada jeda 60 detik antar permintaan kode baru.
- **Rate limiting** — semua endpoint login dibatasi jumlah percobaannya per
  IP (anti brute force/spam), dengan batas lebih ketat khusus untuk
  verifikasi kode OTP.
- **Cookie sesi HttpOnly** — token login disimpan di cookie yang tidak bisa
  diakses lewat JavaScript (anti pencurian sesi via XSS), otomatis memakai
  flag `Secure` saat production (`NODE_ENV=production`).
- **Helmet** — header keamanan standar browser (anti clickjacking, MIME
  sniffing, dll) aktif di semua respons API.
- **CORS ketat** — API hanya menerima request dari domain frontend yang
  didaftarkan di `FRONTEND_URL`, bukan dari sembarang situs.

Saran tambahan untuk produksi: aktifkan HTTPS penuh (mis. lewat Let's Encrypt
di Nginx), ganti `JWT_SECRET` dengan string acak yang panjang dan unik, dan
jangan pernah commit file `.env` ke Git (sudah otomatis di-ignore lewat
`.gitignore`).

## Deploy ke Produksi (gplkltn.site)

1. **Frontend**: `cd frontend && npm run build` → hasil di folder `dist/`,
   upload ke hosting statis (Vercel, Netlify, atau `public_html` di cPanel).
2. **Backend**: jalankan `backend/server.js` dengan process manager seperti
   PM2 di VPS/hosting yang mendukung Node.js (mis. `pm2 start server.js`).
3. Set `FRONTEND_URL` di backend `.env` ke `https://gplkltn.site`, dan pastikan
   frontend memanggil API lewat domain backend (atau satu domain yang sama
   lewat reverse proxy Nginx: `/api` dan `/img` diarahkan ke backend).
4. Set `NODE_ENV=production` supaya cookie sesi memakai `Secure`.

## Teknologi

- **Frontend**: React 18, Vite, TailwindCSS, React Router, react-markdown
- **Backend**: Node.js, Express, better-sqlite3, JWT (cookie httpOnly),
  Google Identity Services, Nodemailer (OTP email), Multer (upload foto)
- **Konten**: blog berbasis file Markdown, foto berbasis file di folder —
  gampang dikelola manual maupun lewat panel admin
