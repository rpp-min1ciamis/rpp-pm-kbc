import { db } from "./index";
import { sql } from "drizzle-orm";

const CREATE_SQL = `
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
CREATE INDEX IF NOT EXISTS "rpps_created_at_idx" ON "rpps" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "rpps_nama_guru_idx" ON "rpps" ("nama_guru");
CREATE INDEX IF NOT EXISTS "rpps_nama_sekolah_idx" ON "rpps" ("nama_sekolah");
`;

let ensurePromise: Promise<void> | null = null;

/**
 * Idempotently ensure all required tables exist.
 * Runs once per process; subsequent calls return the cached promise.
 *
 * Aman dipanggil di setiap API route — tidak akan mem-block request setelah pertama kali.
 */
export function ensureSchema(): Promise<void> {
  if (ensurePromise) return ensurePromise;
  ensurePromise = (async () => {
    try {
      await db.execute(sql.raw(CREATE_SQL));
    } catch (err) {
      // Reset so we can retry on next request if it failed
      ensurePromise = null;
      throw err;
    }
  })();
  return ensurePromise;
}
