/**
 * Server-only customer inquiry (CTA lead) data access.
 */
import { and, desc, eq, isNull } from "drizzle-orm";

import { safeDb } from "./client.server";
import { customerInquiries } from "./schema.server";
import { logAudit } from "@/lib/auth.server";

export type Inquiry = {
  id: string;
  fullName: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
};

const columns = {
  id: customerInquiries.id,
  fullName: customerInquiries.fullName,
  phone: customerInquiries.phone,
  message: customerInquiries.message,
  source: customerInquiries.source,
  status: customerInquiries.status,
  createdAt: customerInquiries.createdAt,
};

function toInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: row["id"] as string,
    fullName: (row["fullName"] as string | null) ?? null,
    phone: (row["phone"] as string | null) ?? null,
    message: (row["message"] as string | null) ?? null,
    source: (row["source"] as string) ?? "WEBSITE",
    status: (row["status"] as string) ?? "NEW",
    createdAt: new Date(row["createdAt"] as string | Date).toISOString(),
  };
}

export async function createInquiry(input: {
  fullName: string;
  phone: string;
  message?: string | undefined;
  source?: string | undefined;
}): Promise<{ ok: true }> {
  await safeDb(async (db) => {
    await db.insert(customerInquiries).values({
      fullName: input.fullName,
      phone: input.phone,
      message: input.message ?? null,
      source: input.source ?? "CTA_FOOTER",
    });
  });
  return { ok: true };
}

export async function listInquiries(limit = 200): Promise<Inquiry[]> {
  return safeDb(async (db) => {
    const rows = await db
      .select(columns)
      .from(customerInquiries)
      .where(isNull(customerInquiries.deletedAt))
      .orderBy(desc(customerInquiries.createdAt))
      .limit(limit);
    return rows.map(toInquiry);
  });
}

export async function countNewInquiries(): Promise<number> {
  return safeDb(async (db) => {
    const rows = await db
      .select({ id: customerInquiries.id })
      .from(customerInquiries)
      .where(and(isNull(customerInquiries.deletedAt), eq(customerInquiries.status, "NEW")));
    return rows.length;
  });
}

export async function setInquiryStatus(input: {
  adminUserId: string;
  id: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "MATCHED" | "CLOSED" | "SPAM";
}): Promise<{ ok: true }> {
  await safeDb(async (db) => {
    await db
      .update(customerInquiries)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(customerInquiries.id, input.id));
  });
  await logAudit({
    actorId: input.adminUserId,
    action: "INQUIRY_STATUS",
    entity: "customer_inquiries",
    entityId: input.id,
    metadata: { status: input.status },
  });
  return { ok: true };
}

export async function deleteInquiry(input: {
  adminUserId: string;
  id: string;
}): Promise<{ ok: true }> {
  await safeDb(async (db) => {
    await db
      .update(customerInquiries)
      .set({ deletedAt: new Date() })
      .where(eq(customerInquiries.id, input.id));
  });
  await logAudit({
    actorId: input.adminUserId,
    action: "INQUIRY_DELETE",
    entity: "customer_inquiries",
    entityId: input.id,
  });
  return { ok: true };
}
