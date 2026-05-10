import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Detect whether we should use SSL.
 * Vercel Postgres / Neon / Supabase semuanya membutuhkan SSL.
 * Local Postgres biasanya tidak.
 */
function shouldUseSsl(url: string): boolean {
  // Explicit override via env
  if (process.env.PGSSLMODE === "disable") return false;
  if (process.env.PGSSLMODE === "require") return true;

  // If sslmode=require is in the connection string
  if (/[?&]sslmode=require/i.test(url)) return true;

  // Local connections don't need SSL
  if (/@(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(url)) return false;

  // Default: use SSL for any remote database (Vercel/Neon/Supabase/etc)
  return process.env.NODE_ENV === "production";
}

const useSsl = shouldUseSsl(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // Vercel/Neon/Supabase need SSL with self-signed certs accepted
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    // Tune pool for serverless to avoid connection exhaustion
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
