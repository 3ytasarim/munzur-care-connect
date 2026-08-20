/**
 * Server-only admin data access (Neon PostgreSQL).
 */
import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb, safeDb } from "./client.server";
import { caregiverProfiles, users } from "./schema.server";
import { hashPassword, verifyPassword } from "@/lib/password.server";
import { logAudit } from "@/lib/auth.server";

export type AdminCandidate = {
  id: string;
  candidateCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  about: string | null;
  yearsOfExperience: number;
  approvalStatus: string;
  publicVisibility: boolean;
  featured: boolean;
  primaryPhotoUrl: string | null;
  createdAt: string;
  services: string[];
  workingTypes: string[];
};

export async function listCandidates(status?: string): Promise<AdminCandidate[]> {
  return safeDb(async (db) => {
    const conditions = [isNull(caregiverProfiles.deletedAt)];
    if (status && status !== "ALL") {
      conditions.push(sql`${caregiverProfiles.approvalStatus}::text = ${status}`);
    }

    const rows = await db
      .select({
        id: caregiverProfiles.id,
        candidateCode: caregiverProfiles.candidateCode,
        firstName: caregiverProfiles.firstName,
        lastName: caregiverProfiles.lastName,
        email: users.email,
        phone: users.phone,
        city: caregiverProfiles.city,
        district: caregiverProfiles.district,
        about: caregiverProfiles.about,
        yearsOfExperience: caregiverProfiles.yearsOfExperience,
        approvalStatus: caregiverProfiles.approvalStatus,
        publicVisibility: caregiverProfiles.publicVisibility,
        featured: caregiverProfiles.featured,
        primaryPhotoUrl: caregiverProfiles.primaryPhotoUrl,
        createdAt: caregiverProfiles.createdAt,
        services: sql<string[]>`coalesce((select array_agg(sc.name order by sc.sort_order)
          from caregiver_services cs join service_categories sc on sc.id = cs.service_id
          where cs.caregiver_id = ${caregiverProfiles.id}), '{}')`,
        workingTypes: sql<string[]>`coalesce((select array_agg(wt.name order by wt.sort_order)
          from caregiver_working_types cwt join working_types wt on wt.id = cwt.working_type_id
          where cwt.caregiver_id = ${caregiverProfiles.id}), '{}')`,
      })
      .from(caregiverProfiles)
      .innerJoin(users, eq(users.id, caregiverProfiles.userId))
      .where(and(...conditions))
      .orderBy(desc(caregiverProfiles.createdAt))
      .limit(200);

    return rows.map((r) => ({
      id: r.id,
      candidateCode: r.candidateCode,
      fullName: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
      phone: r.phone,
      city: r.city,
      district: r.district,
      about: r.about,
      yearsOfExperience: r.yearsOfExperience,
      approvalStatus: r.approvalStatus,
      publicVisibility: r.publicVisibility,
      featured: r.featured,
      primaryPhotoUrl: r.primaryPhotoUrl,
      createdAt: r.createdAt.toISOString(),
      services: r.services ?? [],
      workingTypes: r.workingTypes ?? [],
    }));
  });
}

export async function getAdminStats() {
  return safeDb(async (db) => {
    const rows = await db
      .select({
        status: sql<string>`${caregiverProfiles.approvalStatus}::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(caregiverProfiles)
      .where(isNull(caregiverProfiles.deletedAt))
      .groupBy(sql`${caregiverProfiles.approvalStatus}`);

    const map: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      map[r.status] = r.count;
      total += r.count;
    }
    return { byStatus: map, total };
  });
}

type Decision = "APPROVED" | "REJECTED" | "PENDING" | "SUSPENDED";

export async function setCandidateStatus(input: {
  adminUserId: string;
  candidateId: string;
  status: Decision;
}) {
  const approved = input.status === "APPROVED";
  await safeDb((db) =>
    db
      .update(caregiverProfiles)
      .set({
        approvalStatus: input.status,
        publicVisibility: approved,
        approvedAt: approved ? new Date() : null,
        approvedBy: approved ? input.adminUserId : null,
        updatedAt: new Date(),
      })
      .where(eq(caregiverProfiles.id, input.candidateId)),
  );
  await logAudit({
    adminUserId: input.adminUserId,
    action: `CANDIDATE_${input.status}`,
    entityType: "caregiver_profile",
    entityId: input.candidateId,
    newData: { approvalStatus: input.status },
  });

  let emailSent = false;
  if (approved) {
    const recipient = await safeDb(async (db) => {
      const rows = await db
        .select({
          email: users.email,
          firstName: caregiverProfiles.firstName,
          lastName: caregiverProfiles.lastName,
          candidateCode: caregiverProfiles.candidateCode,
        })
        .from(caregiverProfiles)
        .innerJoin(users, eq(users.id, caregiverProfiles.userId))
        .where(eq(caregiverProfiles.id, input.candidateId))
        .limit(1);
      return rows[0] ?? null;
    });

    if (recipient?.email) {
      const mail = candidateApprovedEmail({
        fullName: `${recipient.firstName} ${recipient.lastName}`.trim(),
        candidateCode: recipient.candidateCode,
      });
      const result = await sendMail({ to: recipient.email, ...mail });
      emailSent = result.sent;
    }
  }

  return { ok: true as const, emailSent };
}


export async function setCandidateFeatured(input: {
  adminUserId: string;
  candidateId: string;
  featured: boolean;
}) {
  await safeDb((db) =>
    db
      .update(caregiverProfiles)
      .set({ featured: input.featured, updatedAt: new Date() })
      .where(eq(caregiverProfiles.id, input.candidateId)),
  );
  await logAudit({
    adminUserId: input.adminUserId,
    action: "CANDIDATE_FEATURED",
    entityType: "caregiver_profile",
    entityId: input.candidateId,
    newData: { featured: input.featured },
  });
  return { ok: true as const };
}

export async function softDeleteCandidate(input: { adminUserId: string; candidateId: string }) {
  await safeDb((db) =>
    db
      .update(caregiverProfiles)
      .set({ deletedAt: new Date(), publicVisibility: false, updatedAt: new Date() })
      .where(eq(caregiverProfiles.id, input.candidateId)),
  );
  await logAudit({
    adminUserId: input.adminUserId,
    action: "CANDIDATE_DELETED",
    entityType: "caregiver_profile",
    entityId: input.candidateId,
  });
  return { ok: true as const };
}

export async function changeOwnPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; message?: string }> {
  const db = getDb();
  const rows = await safeDb((d) =>
    d.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, input.userId)).limit(1),
  );
  const row = rows[0];
  if (!row) return { ok: false, message: "Kullanıcı bulunamadı." };
  const valid = await verifyPassword(input.currentPassword, row.passwordHash);
  if (!valid) return { ok: false, message: "Mevcut şifre hatalı." };

  const passwordHash = await hashPassword(input.newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, input.userId));
  await logAudit({
    adminUserId: input.userId,
    action: "PASSWORD_CHANGED",
    entityType: "user",
    entityId: input.userId,
  });
  return { ok: true };
}
