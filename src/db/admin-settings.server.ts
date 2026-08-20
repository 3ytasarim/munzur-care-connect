/**
 * Server-only admin data access for taxonomies, site settings and audit logs.
 */
import { asc, desc, eq, sql } from "drizzle-orm";

import { getDb, safeDb } from "./client.server";
import {
  auditLogs,
  bankSettings,
  contactSettings,
  serviceCategories,
  siteSettings,
  skills,
  users,
  workingTypes,
} from "./schema.server";
import { logAudit } from "@/lib/auth.server";
import { SITE_SETTINGS_FALLBACK } from "./queries.server";

export type TaxonomyKind = "services" | "workingTypes" | "skills";

export type TaxonomyItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

function tableFor(kind: TaxonomyKind) {
  if (kind === "services") return serviceCategories;
  if (kind === "workingTypes") return workingTypes;
  return skills;
}

export function slugify(value: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o",
    ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return value
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function listTaxonomy(kind: TaxonomyKind): Promise<TaxonomyItem[]> {
  return safeDb(async (db) => {
    const t = tableFor(kind);
    const rows = await db
      .select({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: kind === "services" ? serviceCategories.description : sql<string | null>`null`,
        sortOrder: t.sortOrder,
        active: t.active,
      })
      .from(t)
      .orderBy(asc(t.sortOrder), asc(t.name));
    return rows as TaxonomyItem[];
  });
}

export async function listAllTaxonomies() {
  const [services, workingTypesList, skillsList] = await Promise.all([
    listTaxonomy("services"),
    listTaxonomy("workingTypes"),
    listTaxonomy("skills"),
  ]);
  return { services, workingTypes: workingTypesList, skills: skillsList };
}

export async function upsertTaxonomyItem(input: {
  adminUserId: string;
  kind: TaxonomyKind;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}) {
  const db = getDb();
  const t = tableFor(input.kind);
  const slug = slugify(input.slug?.trim() || input.name);
  const isService = input.kind === "services";

  if (input.id) {
    const values: Record<string, unknown> = {
      name: input.name,
      slug,
      sortOrder: input.sortOrder,
      active: input.active,
    };
    if (isService) {
      values["description"] = input.description ?? null;
      values["updatedAt"] = new Date();
    }
    if (input.kind === "workingTypes") values["updatedAt"] = new Date();
    await safeDb(() => db.update(t).set(values as never).where(eq(t.id, input.id!)));
    await logAudit({
      adminUserId: input.adminUserId,
      action: "TAXONOMY_UPDATED",
      entityType: input.kind,
      entityId: input.id,
      newData: { name: input.name, slug, active: input.active },
    });
    return { ok: true as const, id: input.id };
  }

  const values: Record<string, unknown> = {
    name: input.name,
    slug,
    sortOrder: input.sortOrder,
    active: input.active,
  };
  if (isService) values["description"] = input.description ?? null;

  const inserted = await safeDb(() =>
    db.insert(t).values(values as never).returning({ id: t.id }),
  );
  const id = inserted[0]?.id;
  await logAudit({
    adminUserId: input.adminUserId,
    action: "TAXONOMY_CREATED",
    entityType: input.kind,
    entityId: id,
    newData: { name: input.name, slug },
  });
  return { ok: true as const, id };
}

export async function setTaxonomyActive(input: {
  adminUserId: string;
  kind: TaxonomyKind;
  id: string;
  active: boolean;
}) {
  const t = tableFor(input.kind);
  await safeDb((db) => db.update(t).set({ active: input.active } as never).where(eq(t.id, input.id)));
  await logAudit({
    adminUserId: input.adminUserId,
    action: input.active ? "TAXONOMY_ENABLED" : "TAXONOMY_DISABLED",
    entityType: input.kind,
    entityId: input.id,
    newData: { active: input.active },
  });
  return { ok: true as const };
}

export async function deleteTaxonomyItem(input: {
  adminUserId: string;
  kind: TaxonomyKind;
  id: string;
}): Promise<{ ok: boolean; message?: string }> {
  const t = tableFor(input.kind);
  try {
    await safeDb((db) => db.delete(t).where(eq(t.id, input.id)));
  } catch {
    // Referenced by caregivers → deactivate instead of hard delete.
    await setTaxonomyActive({ ...input, active: false });
    return { ok: true, message: "Kayıt kullanımda olduğu için pasife alındı." };
  }
  await logAudit({
    adminUserId: input.adminUserId,
    action: "TAXONOMY_DELETED",
    entityType: input.kind,
    entityId: input.id,
  });
  return { ok: true };
}

/* ------------------------------------------------------------- settings */

export type AdminSettings = {
  settings: Record<string, string>;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    instagramUrl: string;
    facebookUrl: string;
    linkedinUrl: string;
  };
  bank: {
    bankName: string;
    accountHolder: string;
    iban: string;
    paymentAmount: string;
    currency: string;
    paymentDescriptionTemplate: string;
  };
};

export async function loadAdminSettings(): Promise<AdminSettings> {
  return safeDb(async (db) => {
    const [rows, contactRows, bankRows] = await Promise.all([
      db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings),
      db.select().from(contactSettings).where(eq(contactSettings.active, true)).limit(1),
      db.select().from(bankSettings).where(eq(bankSettings.active, true)).limit(1),
    ]);

    const settings: Record<string, string> = { ...SITE_SETTINGS_FALLBACK };
    for (const row of rows) settings[row.key] = row.value ?? "";

    const c = contactRows[0];
    const b = bankRows[0];
    return {
      settings,
      contact: {
        phone: c?.phone ?? "",
        whatsapp: c?.whatsapp ?? "",
        email: c?.email ?? "",
        address: c?.address ?? "",
        instagramUrl: c?.instagramUrl ?? "",
        facebookUrl: c?.facebookUrl ?? "",
        linkedinUrl: c?.linkedinUrl ?? "",
      },
      bank: {
        bankName: b?.bankName ?? "",
        accountHolder: b?.accountHolder ?? "",
        iban: b?.iban ?? "",
        paymentAmount: b?.paymentAmount ?? "0",
        currency: b?.currency ?? "TRY",
        paymentDescriptionTemplate: b?.paymentDescriptionTemplate ?? "",
      },
    };
  });
}

export async function saveSiteSettings(input: {
  adminUserId: string;
  settings: Record<string, string>;
}) {
  const db = getDb();
  const entries = Object.entries(input.settings);
  if (entries.length) {
    await safeDb(() =>
      db
        .insert(siteSettings)
        .values(
          entries.map(([key, value]) => ({
            key,
            value,
            group: "general",
            updatedBy: input.adminUserId,
          })),
        )
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: sql`excluded.value`,
            updatedAt: new Date(),
            updatedBy: input.adminUserId,
          },
        }),
    );
  }
  await logAudit({
    adminUserId: input.adminUserId,
    action: "SETTINGS_UPDATED",
    entityType: "site_settings",
    newData: input.settings,
  });
  return { ok: true as const };
}

export async function saveContactSettings(input: {
  adminUserId: string;
  contact: AdminSettings["contact"];
}) {
  const db = getDb();
  const existing = await safeDb(() =>
    db.select({ id: contactSettings.id }).from(contactSettings).where(eq(contactSettings.active, true)).limit(1),
  );
  const values = { ...input.contact, active: true, updatedAt: new Date() };
  const row = existing[0];
  if (row) {
    await safeDb(() => db.update(contactSettings).set(values).where(eq(contactSettings.id, row.id)));
  } else {
    await safeDb(() => db.insert(contactSettings).values(values));
  }
  await logAudit({
    adminUserId: input.adminUserId,
    action: "CONTACT_SETTINGS_UPDATED",
    entityType: "contact_settings",
    entityId: row?.id,
    newData: input.contact,
  });
  return { ok: true as const };
}

export async function saveBankSettings(input: {
  adminUserId: string;
  bank: AdminSettings["bank"];
}) {
  const db = getDb();
  const existing = await safeDb(() =>
    db.select({ id: bankSettings.id }).from(bankSettings).where(eq(bankSettings.active, true)).limit(1),
  );
  const values = {
    bankName: input.bank.bankName,
    accountHolder: input.bank.accountHolder,
    iban: input.bank.iban,
    paymentAmount: input.bank.paymentAmount || "0",
    currency: input.bank.currency || "TRY",
    paymentDescriptionTemplate: input.bank.paymentDescriptionTemplate,
    active: true,
    updatedAt: new Date(),
  };
  const row = existing[0];
  if (row) {
    await safeDb(() => db.update(bankSettings).set(values).where(eq(bankSettings.id, row.id)));
  } else {
    await safeDb(() => db.insert(bankSettings).values(values));
  }
  await logAudit({
    adminUserId: input.adminUserId,
    action: "BANK_SETTINGS_UPDATED",
    entityType: "bank_settings",
    entityId: row?.id,
    newData: { iban: input.bank.iban, bankName: input.bank.bankName },
  });
  return { ok: true as const };
}

/* ------------------------------------------------------------ audit log */

export type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  adminName: string | null;
  createdAt: string;
};

export async function listAuditLogs(limit = 60): Promise<AuditEntry[]> {
  return safeDb(async (db) => {
    const rows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        adminName: users.displayName,
        adminEmail: users.email,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.adminUserId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      adminName: r.adminName ?? r.adminEmail ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  });
}
