import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Lazy-initialized database connection.
 *
 * Pool dan Drizzle instance TIDAK dibuat saat import/build time,
 * melainkan saat pertama kali `db` atau `pool` diakses (runtime).
 * Ini mencegah error "DATABASE_URL is required" saat `next build`
 * di Vercel yang belum meng-inject env var pada fase build.
 */

function shouldUseSsl(url: string): boolean {
  if (process.env.PGSSLMODE === "disable") return false;
  if (process.env.PGSSLMODE === "require") return true;
  if (/[?&]sslmode=require/i.test(url)) return true;
  if (/@(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(url)) return false;
  return process.env.NODE_ENV === "production";
}

const globalForDb = globalThis as typeof globalThis & {
  __pgPool?: Pool;
  __drizzle?: NodePgDatabase;
};

function getPool(): Pool {
  if (globalForDb.__pgPool) return globalForDb.__pgPool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Pastikan environment variable sudah diset di Vercel → Settings → Environment Variables."
    );
  }

  const useSsl = shouldUseSsl(databaseUrl);

  const p = new Pool({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__pgPool = p;
  }

  return p;
}

function getDb(): NodePgDatabase {
  if (globalForDb.__drizzle) return globalForDb.__drizzle;

  const d = drizzle(getPool());

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__drizzle = d;
  }

  return d;
}

/**
 * Gunakan `pool` hanya jika perlu raw SQL.
 * Gunakan `db` untuk semua operasi Drizzle ORM.
 *
 * Keduanya lazy-initialized — aman di-import saat build time.
 */
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(getPool(), prop, receiver);
  },
});

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
