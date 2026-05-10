# 📚 RPP PM-KBC

**Generator RPP Kurikulum Merdeka Deep Learning**
Terintegrasi Kurikulum Berbasis Cinta (KBC) / Panca Cinta

Aplikasi web untuk guru madrasah/sekolah agar dapat menyusun RPP otomatis
lengkap dengan Lampiran, Rubrik, LKPD, Soal, dan Kunci Jawaban —
tanpa memerlukan API Key apapun.

---

## 🚀 Deploy ke Internet (Gratis)

👉 Baca **[DEPLOY.md](./DEPLOY.md)** untuk panduan lengkap step-by-step
upload ke GitHub dan deploy ke Vercel.

**Ringkasan singkat:**

```bash
# 1. Push ke GitHub
git init && git add . && git commit -m "deploy"
git remote add origin https://github.com/USERNAME/rpp-pm-kbc.git
git push -u origin main

# 2. Import di vercel.com/new → tambahkan env var DATABASE_URL → Deploy
```

---

## 🔐 Login Default

| Username | Password   |
|----------|------------|
| `admin`  | `admin123` |
| `guru`   | `guru123`  |

---

## ✨ Fitur Utama

- ✅ Wizard form input data RPP
- ✅ AI auto-generate Tujuan Pembelajaran
- ✅ AI rekomendasi KBC & Profil Lulusan
- ✅ Multi-pertemuan dengan pembagian waktu otomatis (1 JP = 35 menit)
- ✅ Integrasi Panca Cinta (5 nilai KBC)
- ✅ Sintaks Deep Learning (Memahami → Mengaplikasi → Merefleksi)
- ✅ Lampiran lengkap: Rubrik, LKPD, Kisi-kisi, Soal PG, Kunci Jawaban
- ✅ Export DOCX (file Word asli)
- ✅ Print / PDF
- ✅ Upload logo madrasah custom
- ✅ Pengaturan tema warna
- ✅ Riwayat RPP tersimpan di database
- ✅ Auto-create tabel database saat deploy pertama kali

---

## 🌐 Environment Variables

| Nama           | Wajib | Deskripsi                    |
|----------------|-------|------------------------------|
| `DATABASE_URL` | ✅    | PostgreSQL connection string |

Tidak ada API key yang diperlukan.

---

## 🛠️ Development Lokal

```bash
# Install
npm install

# Buat .env
cp .env.example .env
# Edit .env → isi DATABASE_URL

# Jalankan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📂 Struktur Project

```
├── DEPLOY.md              ← Panduan deploy lengkap
├── vercel.json            ← Konfigurasi Vercel
├── .env.example           ← Template environment vars
├── scripts/init-db.sql    ← SQL bootstrap (opsional)
├── src/
│   ├── app/
│   │   ├── login/         ← Halaman login
│   │   ├── dashboard/     ← Generator RPP
│   │   ├── pengaturan/    ← Identitas madrasah, logo, tema
│   │   ├── riwayat/       ← Daftar RPP tersimpan
│   │   ├── rpp/[id]/      ← Preview RPP + export
│   │   └── api/           ← API routes
│   ├── db/
│   │   ├── index.ts       ← Drizzle client (auto-SSL)
│   │   ├── ensure-schema.ts ← Auto-migration
│   │   └── schema.ts      ← Drizzle schema
│   └── lib/
│       ├── rpp-types.ts
│       ├── rpp-generator.ts
│       ├── generate-docx.ts
│       └── render-rpp-html.ts
└── README.md
```

---

## 📜 Lisensi

MIT — Bebas digunakan untuk kebutuhan pendidikan.

---

*Dibuat oleh Agus Arifien © 2026*
