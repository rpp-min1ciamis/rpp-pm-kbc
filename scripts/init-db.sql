-- ============================================================
-- RPP PM-KBC — Database Bootstrap
-- ============================================================
-- Jalankan SEKALI saja setelah membuat database baru
-- (Vercel Postgres / Neon / Supabase / Railway / dll).
--
-- Cara pakai:
--   psql "$DATABASE_URL" -f scripts/init-db.sql
--
-- Atau salin-tempel ke SQL Editor (Supabase / Neon Console).
-- ============================================================

CREATE TABLE IF NOT EXISTS "rpps" (
  "id"            serial PRIMARY KEY,
  "judul"         varchar(255) NOT NULL,
  "nama_guru"     varchar(255) NOT NULL,
  "nama_sekolah"  varchar(255) NOT NULL,
  "mapel"         varchar(120) NOT NULL,
  "kelas"         varchar(60)  NOT NULL,
  "fase"          varchar(20)  NOT NULL,
  "model"         varchar(80)  NOT NULL,
  "input"         jsonb        NOT NULL,
  "output"        jsonb        NOT NULL,
  "created_at"    timestamptz  NOT NULL DEFAULT now()
);

-- Index untuk pengurutan riwayat (terbaru dulu)
CREATE INDEX IF NOT EXISTS "rpps_created_at_idx"
  ON "rpps" ("created_at" DESC);

-- Index untuk pencarian berdasarkan guru / sekolah
CREATE INDEX IF NOT EXISTS "rpps_nama_guru_idx"
  ON "rpps" ("nama_guru");

CREATE INDEX IF NOT EXISTS "rpps_nama_sekolah_idx"
  ON "rpps" ("nama_sekolah");
