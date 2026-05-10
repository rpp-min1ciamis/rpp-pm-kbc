# 📁 Panduan Upload File ke GitHub (Manual via Browser)

Jika kamu **tidak menggunakan Git** di komputer, kamu bisa upload
file satu per satu melalui **browser** di github.com.

---

## LANGKAH 1 — Buat Repository

1. Login ke [github.com](https://github.com)
2. Klik tombol **"+"** (pojok kanan atas) → **"New repository"**
3. Isi:
   - **Repository name**: `rpp-pm-kbc`
   - **Description**: `Generator RPP KBC Kurikulum Merdeka`
   - Pilih **Public**
   - ✅ Centang **"Add a README file"**
4. Klik **"Create repository"**

---

## LANGKAH 2 — Upload File

Di halaman repository, klik **"Add file"** → **"Upload files"**
atau klik **"."** (titik) untuk membuka editor web.

### ⚠️ PENTING: Buat folder dulu, lalu upload isinya

Di GitHub browser, kamu **TIDAK bisa upload folder langsung**.
Caranya: saat membuat file baru, ketik `nama-folder/nama-file`
di kolom nama file. Contoh: `src/app/page.tsx`

---

## DAFTAR FILE YANG HARUS DIUPLOAD

Upload file-file berikut **sesuai struktur folder**.
File yang bertanda ❌ **JANGAN diupload**.

### 📂 Root (folder utama)

| # | File | Keterangan |
|---|------|------------|
| 1 | `package.json` | ✅ Wajib — daftar dependency |
| 2 | `package-lock.json` | ✅ Wajib — lock versi dependency |
| 3 | `tsconfig.json` | ✅ Wajib — konfigurasi TypeScript |
| 4 | `next.config.ts` | ✅ Wajib — konfigurasi Next.js |
| 5 | `postcss.config.mjs` | ✅ Wajib — konfigurasi PostCSS |
| 6 | `eslint.config.mjs` | ✅ Wajib — konfigurasi ESLint |
| 7 | `drizzle.config.json` | ✅ Wajib — konfigurasi Drizzle ORM |
| 8 | `vercel.json` | ✅ Wajib — konfigurasi Vercel deploy |
| 9 | `.gitignore` | ✅ Wajib — daftar file yang di-ignore |
| 10 | `.env.example` | ✅ Wajib — template env var |
| 11 | `README.md` | ✅ Wajib — dokumentasi project |
| 12 | `DEPLOY.md` | ✅ Wajib — panduan deploy |
| 13 | `UPLOAD-GITHUB.md` | ⬜ Opsional — panduan ini |
| — | `.env` | ❌ JANGAN upload — berisi secret |
| — | `next-env.d.ts` | ❌ Tidak perlu — auto-generate |
| — | `node_modules/` | ❌ JANGAN upload — auto-install |
| — | `.next/` | ❌ JANGAN upload — hasil build |

### 📂 scripts/

| # | File | Keterangan |
|---|------|------------|
| 14 | `scripts/init-db.sql` | ✅ SQL bootstrap |

### 📂 src/app/ — Halaman Utama

| # | File | Keterangan |
|---|------|------------|
| 15 | `src/app/globals.css` | ✅ Styling global |
| 16 | `src/app/layout.tsx` | ✅ Layout utama |
| 17 | `src/app/page.tsx` | ✅ Halaman root (redirect) |

### 📂 src/app/login/

| # | File | Keterangan |
|---|------|------------|
| 18 | `src/app/login/page.tsx` | ✅ Halaman login |

### 📂 src/app/dashboard/

| # | File | Keterangan |
|---|------|------------|
| 19 | `src/app/dashboard/layout.tsx` | ✅ Layout dashboard + navbar |
| 20 | `src/app/dashboard/page.tsx` | ✅ Halaman generator RPP |

### 📂 src/app/pengaturan/

| # | File | Keterangan |
|---|------|------------|
| 21 | `src/app/pengaturan/page.tsx` | ✅ Halaman pengaturan |

### 📂 src/app/riwayat/

| # | File | Keterangan |
|---|------|------------|
| 22 | `src/app/riwayat/page.tsx` | ✅ Halaman riwayat RPP |

### 📂 src/app/rpp/[id]/

| # | File | Keterangan |
|---|------|------------|
| 23 | `src/app/rpp/[id]/page.tsx` | ✅ Halaman preview RPP |
| 24 | `src/app/rpp/[id]/RppActions.tsx` | ✅ Tombol aksi (Print/DOCX/Hapus) |

### 📂 src/app/wizard/

| # | File | Keterangan |
|---|------|------------|
| 25 | `src/app/wizard/page.tsx` | ✅ Halaman wizard |
| 26 | `src/app/wizard/WizardClient.tsx` | ✅ Komponen wizard |

### 📂 src/app/api/ — API Routes

| # | File | Keterangan |
|---|------|------------|
| 27 | `src/app/api/health/route.ts` | ✅ Health check |
| 28 | `src/app/api/generate/route.ts` | ✅ Generate RPP |
| 29 | `src/app/api/generate-tujuan/route.ts` | ✅ Generate tujuan pembelajaran |
| 30 | `src/app/api/recommend/route.ts` | ✅ Rekomendasi AI KBC |
| 31 | `src/app/api/rpp/route.ts` | ✅ List & create RPP |
| 32 | `src/app/api/rpp/[id]/route.ts` | ✅ Get & delete RPP |
| 33 | `src/app/api/rpp/[id]/docx/route.ts` | ✅ Download DOCX |

### 📂 src/db/ — Database

| # | File | Keterangan |
|---|------|------------|
| 34 | `src/db/index.ts` | ✅ Koneksi database |
| 35 | `src/db/schema.ts` | ✅ Skema tabel |
| 36 | `src/db/ensure-schema.ts` | ✅ Auto-create tabel |

### 📂 src/lib/ — Library / Engine

| # | File | Keterangan |
|---|------|------------|
| 37 | `src/lib/rpp-types.ts` | ✅ Type definitions |
| 38 | `src/lib/rpp-generator.ts` | ✅ AI engine generate RPP |
| 39 | `src/lib/render-rpp-html.ts` | ✅ Render RPP ke HTML |
| 40 | `src/lib/generate-docx.ts` | ✅ Generate file DOCX |

---

## TOTAL: 40 File yang harus diupload

### Ringkasan Struktur Folder:

```
rpp-pm-kbc/
├── package.json                          ← 1
├── package-lock.json                     ← 2
├── tsconfig.json                         ← 3
├── next.config.ts                        ← 4
├── postcss.config.mjs                    ← 5
├── eslint.config.mjs                     ← 6
├── drizzle.config.json                   ← 7
├── vercel.json                           ← 8
├── .gitignore                            ← 9
├── .env.example                          ← 10
├── README.md                             ← 11
├── DEPLOY.md                             ← 12
├── scripts/
│   └── init-db.sql                       ← 14
└── src/
    ├── app/
    │   ├── globals.css                   ← 15
    │   ├── layout.tsx                    ← 16
    │   ├── page.tsx                      ← 17
    │   ├── login/
    │   │   └── page.tsx                  ← 18
    │   ├── dashboard/
    │   │   ├── layout.tsx                ← 19
    │   │   └── page.tsx                  ← 20
    │   ├── pengaturan/
    │   │   └── page.tsx                  ← 21
    │   ├── riwayat/
    │   │   └── page.tsx                  ← 22
    │   ├── rpp/
    │   │   └── [id]/
    │   │       ├── page.tsx              ← 23
    │   │       └── RppActions.tsx        ← 24
    │   ├── wizard/
    │   │   ├── page.tsx                  ← 25
    │   │   └── WizardClient.tsx          ← 26
    │   └── api/
    │       ├── health/
    │       │   └── route.ts              ← 27
    │       ├── generate/
    │       │   └── route.ts              ← 28
    │       ├── generate-tujuan/
    │       │   └── route.ts              ← 29
    │       ├── recommend/
    │       │   └── route.ts              ← 30
    │       └── rpp/
    │           ├── route.ts              ← 31
    │           └── [id]/
    │               ├── route.ts          ← 32
    │               └── docx/
    │                   └── route.ts      ← 33
    ├── db/
    │   ├── index.ts                      ← 34
    │   ├── schema.ts                     ← 35
    │   └── ensure-schema.ts             ← 36
    └── lib/
        ├── rpp-types.ts                  ← 37
        ├── rpp-generator.ts              ← 38
        ├── render-rpp-html.ts            ← 39
        └── generate-docx.ts              ← 40
```

---

## CARA UPLOAD VIA BROWSER GITHUB

### Metode 1: Drag & Drop (Rekomendasi)

1. Di halaman repository, klik **"Add file"** → **"Upload files"**
2. **Drag & drop** semua file dari folder project ke area upload
   ⚠️ GitHub browser **mendukung upload folder** via drag & drop!
3. Tulis commit message: `Initial upload`
4. Klik **"Commit changes"**

### Metode 2: Satu per satu (jika drag & drop tidak bisa)

1. Klik **"Add file"** → **"Create new file"**
2. Di kolom nama, ketik path lengkap, contoh:
   `src/app/page.tsx`
   (GitHub otomatis membuat folder `src/app/`)
3. Paste isi file di editor
4. Klik **"Commit changes"**
5. Ulangi untuk semua 40 file

### Metode 3: GitHub Desktop (Paling Mudah)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Login dengan akun GitHub
3. Clone repository yang sudah dibuat
4. Copy semua file project ke folder clone
5. Di GitHub Desktop, commit & push

---

## SETELAH UPLOAD SELESAI

Lanjutkan ke **DEPLOY.md** → TAHAP 3 (Deploy ke Vercel).

---

*Panduan ini dibuat oleh Agus Arifien © 2026*
