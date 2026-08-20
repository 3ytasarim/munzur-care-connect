import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  changeOwnPassword,
  getAdminStats,
  listCandidates,
  setCandidateFeatured,
  setCandidateStatus,
  softDeleteCandidate,
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
