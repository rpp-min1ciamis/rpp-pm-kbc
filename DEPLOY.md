# 🚀 Panduan Upload ke GitHub & Deploy ke Vercel

Panduan ini menjelaskan langkah demi langkah cara mempublikasikan
aplikasi **RPP PM-KBC** ke internet menggunakan **GitHub** (penyimpanan kode)
dan **Vercel** (hosting gratis). Tidak membutuhkan API Key apapun.

> ⏱ Estimasi waktu: **15–20 menit** (pertama kali).

---

## TAHAP 1 — Persiapan Akun (Sekali Saja)

### 1.1 Buat Akun GitHub (Gratis)

1. Buka [github.com/signup](https://github.com/signup)
2. Daftar dengan email → verifikasi email
3. Selesai ✅

### 1.2 Buat Akun Vercel (Gratis)

1. Buka [vercel.com/signup](https://vercel.com/signup)
2. Klik **"Continue with GitHub"** → login dengan akun GitHub yang baru dibuat
3. Izinkan akses → Selesai ✅

### 1.3 Buat Akun Neon Database (Gratis)

1. Buka [neon.tech](https://neon.tech)
2. Klik **"Sign Up"** → pilih **"Continue with GitHub"**
3. Klik **"Create a project"**
   - **Name**: `rpp-kbc` (bebas)
   - **Region**: `Asia Pacific (Singapore)` ← pilih yang paling dekat
4. Setelah project dibuat, kamu akan melihat **Connection String**
   yang berbentuk seperti:
   ```
   postgresql://neondb_owner:xxxxxxxxxxxx@ep-xxxxxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **Salin** connection string tersebut — akan digunakan di Tahap 3
6. Selesai ✅

---

## TAHAP 2 — Upload Kode ke GitHub

### 2.1 Install Git (jika belum)

- **Windows**: Download di [git-scm.com/download/win](https://git-scm.com/download/win) → install
- **Mac**: Buka Terminal, ketik `git --version` → jika belum ada, ikuti petunjuk
- **Linux**: `sudo apt install git`

### 2.2 Buat Repository di GitHub

1. Buka [github.com/new](https://github.com/new)
2. Isi:
   - **Repository name**: `rpp-pm-kbc` (atau nama lain)
   - **Description**: `Generator RPP Kurikulum Merdeka Deep Learning + KBC`
   - Pilih **Public** (gratis) atau **Private**
   - ❌ JANGAN centang "Add a README file" (kita sudah punya)
3. Klik **"Create repository"**
4. Kamu akan melihat halaman instruksi — **biarkan halaman ini terbuka**

### 2.3 Upload Kode dari Komputer

Buka **Terminal** (Mac/Linux) atau **Git Bash** (Windows), lalu jalankan
perintah berikut satu per satu:

```bash
# 1. Masuk ke folder project
cd /path/ke/folder/project

# 2. Inisialisasi git
git init

# 3. Tambahkan semua file
git add .

# 4. Commit pertama
git commit -m "Initial commit: RPP PM-KBC"

# 5. Hubungkan ke repository GitHub
#    ⚠️ Ganti USERNAME dengan username GitHub kamu
#    ⚠️ Ganti rpp-pm-kbc dengan nama repository kamu
git remote add origin https://github.com/USERNAME/rpp-pm-kbc.git

# 6. Push / upload
git branch -M main
git push -u origin main
```

> 💡 Jika diminta login, masukkan username dan **Personal Access Token**
> GitHub (bukan password). Buat token di:
> [github.com/settings/tokens](https://github.com/settings/tokens)
> → Generate new token → centang `repo` → Generate → salin token.

Setelah berhasil, refresh halaman repository GitHub — kode kamu sudah terupload! ✅

---

## TAHAP 3 — Deploy ke Vercel

### 3.1 Import Project

1. Buka [vercel.com/new](https://vercel.com/new)
2. Kamu akan melihat daftar repository GitHub
3. Cari **`rpp-pm-kbc`** → klik **"Import"**

### 3.2 Konfigurasi Project

Di halaman konfigurasi, isi:

| Setting | Nilai |
|---------|-------|
| **Framework Preset** | `Next.js` (otomatis terdeteksi) ✅ |
| **Root Directory** | `.` (biarkan default) ✅ |
| **Build Command** | `next build` (biarkan default) ✅ |
| **Install Command** | `npm install` (biarkan default) ✅ |

### 3.3 Tambahkan Environment Variable

⚠️ **INI BAGIAN PALING PENTING** — tanpa ini, aplikasi tidak bisa connect ke database.

1. Klik **"Environment Variables"** (di bagian bawah halaman konfigurasi)
2. Tambahkan variabel:

| Name | Value |
|------|-------|
| `DATABASE_URL` | *(paste connection string Neon dari Tahap 1.3)* |

Contoh value:
```
postgresql://neondb_owner:AbCdEfGh1234@ep-cool-moon-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

3. Pastikan environment **Production**, **Preview**, dan **Development** semuanya tercentang ✅

### 3.4 Deploy!

1. Klik tombol **"Deploy"** 🚀
2. Tunggu proses build (±1–2 menit)
3. Jika berhasil, kamu akan melihat tampilan **"Congratulations!"** 🎉
4. Klik **"Continue to Dashboard"**
5. Klik link domain seperti: `https://rpp-pm-kbc.vercel.app`

**Aplikasi kamu sudah live di internet!** 🎉

---

## TAHAP 4 — Verifikasi

### 4.1 Test Login

1. Buka `https://rpp-pm-kbc.vercel.app` (ganti dengan domain kamu)
2. Login dengan:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Jika halaman dashboard muncul → **berhasil!** ✅

### 4.2 Test Generate RPP

1. Isi form: Mapel, Kelas, Materi Pokok
2. Klik **"Generate RPP KBC"**
3. Jika RPP ter-generate dan halaman preview muncul → **database berhasil!** ✅
4. Test **Download DOCX** dan **Print/PDF**

### 4.3 Jika Error

| Error | Solusi |
|-------|--------|
| **"DATABASE_URL is required"** | Environment variable belum diset. Buka Vercel → Settings → Environment Variables → tambahkan `DATABASE_URL` → **Redeploy** |
| **Build failed** | Cek build log di Vercel → biasanya typo atau dependency error |
| **500 Internal Server Error** | Cek connection string Neon — pastikan benar dan ada `?sslmode=require` di akhir |
| **Halaman blank / loading terus** | Clear cache browser (Ctrl+Shift+R) atau buka di incognito |

---

## TAHAP 5 — Custom Domain (Opsional)

Jika kamu punya domain sendiri (misal `rpp.min1ciamis.sch.id`):

1. Di Vercel Dashboard → **Settings** → **Domains**
2. Klik **"Add"** → ketik domain kamu
3. Vercel akan memberikan **CNAME record** atau **A record**
4. Login ke panel domain kamu (Niagahoster, Cloudflare, dll)
5. Tambahkan DNS record sesuai instruksi Vercel
6. Tunggu propagasi (5–30 menit)
7. Selesai — aplikasi bisa diakses via domain sendiri ✅

---

## Rangkuman Akun yang Dibutuhkan

| Layanan | URL | Biaya | Fungsi |
|---------|-----|-------|--------|
| **GitHub** | github.com | Gratis | Menyimpan kode |
| **Vercel** | vercel.com | Gratis (Hobby) | Hosting aplikasi |
| **Neon** | neon.tech | Gratis (512 MB) | Database PostgreSQL |

Total biaya: **Rp 0** (semua menggunakan free tier) 🆓

---

## Update Aplikasi di Kemudian Hari

Jika kamu mengubah kode dan ingin mengupdate yang sudah live:

```bash
# 1. Edit file-file yang ingin diubah

# 2. Simpan perubahan ke git
git add .
git commit -m "deskripsi perubahan"

# 3. Push ke GitHub
git push

# Vercel akan otomatis rebuild & redeploy dalam 1-2 menit ✅
```

---

## Pertanyaan Umum (FAQ)

**Q: Apakah butuh API Key OpenAI/ChatGPT?**
A: Tidak. Semua narasi RPP dihasilkan oleh template engine internal.

**Q: Berapa batas gratis Neon?**
A: 512 MB storage, cukup untuk ribuan RPP.

**Q: Berapa batas gratis Vercel?**
A: 100 GB bandwidth/bulan, 100 deploy/hari — sangat cukup.

**Q: Bisa diakses dari HP?**
A: Ya, aplikasi responsive — bisa diakses dari browser HP.

**Q: Data RPP aman?**
A: Data tersimpan di database Neon (cloud) dengan enkripsi SSL.

**Q: Bisa digunakan banyak guru?**
A: Ya, setiap guru bisa login dan membuat RPP masing-masing.

---

*Panduan ini dibuat oleh Agus Arifien © 2026*
