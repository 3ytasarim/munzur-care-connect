/**
 * Secure Super Admin bootstrap.
 *
 * Usage (credentials come from the environment, never from source control):
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... bun server/database/seed-admin.ts
 *
 * Re-running is safe: an existing account is upgraded to SUPER_ADMIN and its
 * password hash is refreshed. Plain text passwords are never stored.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import { users } from "../../src/db/schema.server";
import { hashPassword } from "../../src/lib/password.server";

const email = process.env["SEED_ADMIN_EMAIL"]?.trim().toLowerCase();
const password = process.env["SEED_ADMIN_PASSWORD"];
const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) throw new Error("DATABASE_URL is not set");
if (!email || !password) {
  throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required");
}
if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");

const db = drizzle(neon(databaseUrl));
const passwordHash = await hashPassword(password);

const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

if (existing[0]) {
  await db
    .update(users)
    .set({ passwordHash, role: "SUPER_ADMIN", status: "ACTIVE", updatedAt: new Date() })
    .where(eq(users.id, existing[0].id));
  console.log(`Updated existing account as SUPER_ADMIN: ${email}`);
} else {
  await db.insert(users).values({
    email,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    emailVerified: true,
  });
  console.log(`Created SUPER_ADMIN: ${email}`);
}
