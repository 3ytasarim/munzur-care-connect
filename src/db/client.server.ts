/**
 * Neon PostgreSQL connection. Server-only.
 * DATABASE_URL is read from the secure server environment and is never
 * exposed to the browser (no VITE_ prefix, no client import).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema.server";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | undefined;

export function getDb(): Db {
  if (cached) return cached;
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not configured");
  cached = drizzle(neon(url), { schema });
  return cached;
}

/** Public-facing, sanitized error message for any database failure. */
export const DB_ERROR_MESSAGE = "Şu anda veriler yüklenemiyor. Lütfen tekrar deneyin.";

/** Runs a db operation, logging details server-side and sanitizing the error. */
export async function safeDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  try {
    return await fn(getDb());
  } catch (error) {
    console.error("[db]", error);
    throw new Error(DB_ERROR_MESSAGE);
  }
}

export { schema };
