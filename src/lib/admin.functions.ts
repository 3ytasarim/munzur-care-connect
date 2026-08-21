import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  changeOwnPassword,
  getAdminStats,
  listCandidates,
  setCandidateFeatured,
  setCandidateStatus,
  softDeleteCandidate,
  updateCandidate,
} from "@/db/admin-queries.server";
import { getSessionUser, requireRole } from "@/lib/auth.server";

const statusSchema = z.enum(["ALL", "PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "SUSPENDED", "DRAFT"]);

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return { ...user, isAdmin: false as const };
  return { ...user, isAdmin: true as const };
});

export const adminListCandidates = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ status: statusSchema.default("ALL") }).parse(input))
  .handler(async ({ data }) => {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);
    const [items, stats] = await Promise.all([listCandidates(data.status), getAdminStats()]);
    return { items, stats };
  });

export const adminSetCandidateStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        candidateId: z.string().uuid(),
        status: z.enum(["APPROVED", "REJECTED", "PENDING", "SUSPENDED"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return setCandidateStatus({ adminUserId: admin.id, ...data });
  });

export const adminSetFeatured = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ candidateId: z.string().uuid(), featured: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return setCandidateFeatured({ adminUserId: admin.id, ...data });
  });

export const adminDeleteCandidate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ candidateId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return softDeleteCandidate({ adminUserId: admin.id, candidateId: data.candidateId });
  });

export const adminChangePassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı."),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return changeOwnPassword({ userId: admin.id, ...data });
  });

/* ------------------------------ taxonomies, settings, audit log ------- */

import {
  deleteTaxonomyItem,
  listAllTaxonomies,
  listAuditLogs,
  loadAdminSettings,
  saveBankSettings,
  saveContactSettings,
  saveSiteSettings,
  setTaxonomyActive,
  upsertTaxonomyItem,
} from "@/db/admin-settings.server";

const kindSchema = z.enum(["services", "workingTypes", "skills"]);

export const adminGetTaxonomies = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return listAllTaxonomies();
});

export const adminSaveTaxonomyItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: kindSchema,
        id: z.string().uuid().optional(),
        name: z.string().min(2, "En az 2 karakter."),
        slug: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().min(0).default(0),
        active: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return upsertTaxonomyItem({ adminUserId: admin.id, ...data });
  });

export const adminSetTaxonomyActive = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ kind: kindSchema, id: z.string().uuid(), active: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return setTaxonomyActive({ adminUserId: admin.id, ...data });
  });

export const adminDeleteTaxonomyItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ kind: kindSchema, id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return deleteTaxonomyItem({ adminUserId: admin.id, ...data });
  });

export const adminGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return loadAdminSettings();
});

export const adminSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        settings: z.record(z.string(), z.string()),
        contact: z.object({
          phone: z.string().default(""),
          whatsapp: z.string().default(""),
          email: z.string().default(""),
          address: z.string().default(""),
          instagramUrl: z.string().default(""),
          facebookUrl: z.string().default(""),
          linkedinUrl: z.string().default(""),
          youtubeUrl: z.string().default(""),
          twitterUrl: z.string().default(""),
          tiktokUrl: z.string().default(""),
        }),
        bank: z.object({
          bankName: z.string().default(""),
          accountHolder: z.string().default(""),
          iban: z.string().default(""),
          paymentAmount: z.string().default("0"),
          currency: z.string().default("TRY"),
          paymentDescriptionTemplate: z.string().default(""),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    await saveSiteSettings({ adminUserId: admin.id, settings: data.settings });
    await saveContactSettings({ adminUserId: admin.id, contact: data.contact });
    if (data.bank.bankName || data.bank.iban) {
      await saveBankSettings({ adminUserId: admin.id, bank: data.bank });
    }
    return { ok: true as const };
  });

export const adminGetAuditLogs = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return listAuditLogs(60);
});
