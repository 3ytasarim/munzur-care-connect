/**
 * Server-only authentication data access (Neon PostgreSQL).
 */
import { and, eq, isNull } from "drizzle-orm";

import { getDb, safeDb } from "./client.server";
import {
  caregiverProfiles,
  caregiverServices,
  caregiverWorkingTypes,
  serviceCategories,
  users,
  workingTypes as workingTypesTable,
} from "./schema.server";
import {
  candidateRegisteredAdminEmail,
  dataUrlToAttachment,
  getAdminNotifyAddress,
  sendMail,
} from "@/lib/email.server";
import { inArray } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password.server";
import { logAudit, startSession } from "@/lib/auth.server";
import type { LoginInput, RegisterInput } from "@/lib/auth-schemas";

export type AuthResult = { ok: true; role: string } | { ok: false; message: string };

const GENERIC_LOGIN_ERROR = "E-posta veya şifre hatalı.";

export async function signInWithPassword(input: LoginInput): Promise<AuthResult> {
  const rows = await safeDb((db) =>
    db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(and(eq(users.email, input.email), isNull(users.deletedAt)))
      .limit(1),
  );

  const user = rows[0];
  // Always run a verification to keep timing consistent for unknown emails.
  const stored = user?.passwordHash ?? "pbkdf2$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAA==";
  const valid = await verifyPassword(input.password, stored);
  if (!user || !valid) return { ok: false, message: GENERIC_LOGIN_ERROR };
  if (user.status !== "ACTIVE")
    return { ok: false, message: "Hesabınız askıya alınmış. Lütfen bizimle iletişime geçin." };

  await safeDb((db) =>
    db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id)),
  );
  await startSession(user.id);
  await logAudit({ adminUserId: user.id, action: "LOGIN", entityType: "user", entityId: user.id });
  return { ok: true, role: user.role };
}

export type RegisterResult =
  | { ok: true; candidateCode: string }
  | { ok: false; message: string };

export async function registerCaregiverAccount(input: RegisterInput): Promise<RegisterResult> {
  const db = getDb();

  const existing = await safeDb((d) =>
    d.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1),
  );
  if (existing[0]) {
    return { ok: false, message: "Bu e-posta adresi ile bir kayıt zaten mevcut." };
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: "CAREGIVER",
        status: "ACTIVE",
      })
      .returning({ id: users.id });
    if (!user) throw new Error("user insert failed");

    const [profile] = await db
      .insert(caregiverProfiles)
      .values({
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        city: input.city,
        district: input.district || null,
        neighborhood: input.neighborhood || null,
        about: input.about || null,
        yearsOfExperience: input.yearsOfExperience,
        primaryPhotoUrl: input.photoDataUrl ?? null,
        approvalStatus: "PENDING",
        publicVisibility: false,
        profileCompletionPercentage: input.about ? 60 : 45,
      })
      .returning({ id: caregiverProfiles.id, candidateCode: caregiverProfiles.candidateCode });
    if (!profile) throw new Error("profile insert failed");

    if (input.serviceIds.length) {
      await db
        .insert(caregiverServices)
        .values(input.serviceIds.map((serviceId) => ({ caregiverId: profile.id, serviceId })))
        .onConflictDoNothing();
    }
    if (input.workingTypeIds.length) {
      await db
        .insert(caregiverWorkingTypes)
        .values(
          input.workingTypeIds.map((workingTypeId) => ({ caregiverId: profile.id, workingTypeId })),
        )
        .onConflictDoNothing();
    }

    await startSession(user.id);
    await logAudit({
      adminUserId: user.id,
      action: "CAREGIVER_REGISTERED",
      entityType: "caregiver_profile",
      entityId: profile.id,
      newData: { candidateCode: profile.candidateCode, city: input.city },
    });

    try {
      const serviceNames = input.serviceIds.length
        ? (
            await db
              .select({ name: serviceCategories.name })
              .from(serviceCategories)
              .where(inArray(serviceCategories.id, input.serviceIds))
          ).map((r) => r.name)
        : [];
      const workingTypeNames = input.workingTypeIds.length
        ? (
            await db
              .select({ name: workingTypesTable.name })
              .from(workingTypesTable)
              .where(inArray(workingTypesTable.id, input.workingTypeIds))
          ).map((r) => r.name)
        : [];
      const photo = dataUrlToAttachment(
        input.photoDataUrl,
        `aday-${profile.candidateCode}`,
        "candidate-photo",
      );
      const mail = candidateRegisteredAdminEmail({
        fullName: `${input.firstName} ${input.lastName}`,
        candidateCode: profile.candidateCode,
        email: input.email,
        phone: input.phone,
        city: input.city,
        district: input.district || null,
        neighborhood: input.neighborhood || null,
        yearsOfExperience: input.yearsOfExperience,
        services: serviceNames,
        workingTypes: workingTypeNames,
        about: input.about || null,
        photoCid: photo ? "candidate-photo" : null,
      });
      await sendMail({
        to: getAdminNotifyAddress(),
        ...mail,
        ...(photo ? { attachments: [photo] } : {}),
      });
    } catch (mailError) {
      console.error("[auth] admin notification mail failed", mailError);
    }

    return { ok: true, candidateCode: profile.candidateCode };
  } catch (error) {
    console.error("[auth] registration failed", error);
    return { ok: false, message: "Kayıt tamamlanamadı. Lütfen tekrar deneyin." };
  }
}
