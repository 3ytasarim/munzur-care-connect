/**
 * Session authentication for MunzurDestek.
 * Server-only: opaque random session tokens stored as SHA-256 hashes,
 * delivered in an HttpOnly cookie. Passwords use PBKDF2 (password.server.ts).
 */
import { and, eq, gt, isNull } from "drizzle-orm";
import { getRequestHeader, getRequestIP, setResponseHeader } from "@tanstack/react-start/server";

import { getDb, safeDb } from "@/db/client.server";
import { auditLogs, caregiverProfiles, sessions, users } from "@/db/schema.server";

export const SESSION_COOKIE = "md_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CONSULTANT" | "CAREGIVER";
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  displayName: string;
  candidateCode: string | null;
  approvalStatus: string | null;
};

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}

function readCookie(name: string): string | null {
  const header = getRequestHeader("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function writeCookie(value: string, maxAgeSeconds: number) {
  setResponseHeader(
    "set-cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAgeSeconds}`,
  );
}

/** Creates a session row and sets the session cookie. */
export async function startSession(userId: string): Promise<void> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await safeDb((db) => db.insert(sessions).values({ userId, tokenHash, expiresAt }));
  writeCookie(token, SESSION_DAYS * 86_400);
}

/** Deletes the current session row and clears the cookie. */
export async function endSession(): Promise<void> {
  const token = readCookie(SESSION_COOKIE);
  if (token) {
    const tokenHash = await sha256Hex(token);
    try {
      await getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    } catch (error) {
      console.error("[auth] session delete failed", error);
    }
  }
  writeCookie("", 0);
}

/** Resolves the signed-in user, or null. Never throws for anonymous visitors. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = readCookie(SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  try {
    const rows = await getDb()
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        firstName: caregiverProfiles.firstName,
        lastName: caregiverProfiles.lastName,
        candidateCode: caregiverProfiles.candidateCode,
        approvalStatus: caregiverProfiles.approvalStatus,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .leftJoin(
        caregiverProfiles,
        and(eq(caregiverProfiles.userId, users.id), isNull(caregiverProfiles.deletedAt)),
      )
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          gt(sessions.expiresAt, new Date()),
          isNull(users.deletedAt),
          eq(users.status, "ACTIVE"),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    const name = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      status: row.status,
      displayName: name || row.email,
      candidateCode: row.candidateCode ?? null,
      approvalStatus: row.approvalStatus ?? null,
    };
  } catch (error) {
    console.error("[auth] session lookup failed", error);
    return null;
  }
}

/** Throws when there is no signed-in user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
  return user;
}

/** Throws when the signed-in user does not hold one of the given roles. */
export async function requireRole(roles: SessionUser["role"][]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("Bu işlem için yetkiniz bulunmuyor.");
  return user;
}

/** Best-effort audit trail; never blocks the caller's operation. */
export async function logAudit(entry: {
  adminUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldData?: unknown;
  newData?: unknown;
}): Promise<void> {
  try {
    let ip: string | null = null;
    try {
      ip = getRequestIP() ?? null;
    } catch {
      ip = null;
    }
    await getDb()
      .insert(auditLogs)
      .values({
        adminUserId: entry.adminUserId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        oldData: (entry.oldData ?? null) as never,
        newData: (entry.newData ?? null) as never,
        ip,
      });
  } catch (error) {
    console.error("[audit] failed", error);
  }
}
