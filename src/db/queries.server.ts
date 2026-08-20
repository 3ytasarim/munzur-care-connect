/**
 * Server-only data access layer for MunzurDestek (Neon PostgreSQL).
 */
import { and, asc, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";

import { safeDb } from "./client.server";
import {
  bankSettings,
  caregiverProfiles,
  caregiverServices,
  caregiverSkills,
  caregiverWorkingTypes,
  contactSettings,
  languages,
  searchEvents,
  serviceCategories,
  siteSettings,
  skills,
  workingTypes,
} from "./schema.server";

export type SiteSettingsMap = Record<string, string>;

export const SITE_SETTINGS_FALLBACK: SiteSettingsMap = {
  site_name: "MunzurDestek",
  logo_url: "",
  dark_logo_url: "",
  mobile_logo_url: "",
  favicon_url: "/favicon.png",
  primary_color: "#57B614",
  secondary_color: "#FFDE58",
  company_name: "MunzurDestek",
  default_currency: "TRY",
  candidate_payment_required: "false",
};

export type PublicSettings = {
  settings: SiteSettingsMap;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    instagramUrl: string;
    facebookUrl: string;
    linkedinUrl: string;
    youtubeUrl: string;
    twitterUrl: string;
    tiktokUrl: string;
  };
};

export async function loadPublicSettings(): Promise<PublicSettings> {
  return safeDb(async (db) => {
    const [rows, contactRows] = await Promise.all([
      db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings),
      db.select().from(contactSettings).where(eq(contactSettings.active, true)).limit(1),
    ]);

    const settings: SiteSettingsMap = { ...SITE_SETTINGS_FALLBACK };
    for (const row of rows) settings[row.key] = row.value ?? "";

    const c = contactRows[0];
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
        youtubeUrl: c?.youtubeUrl ?? "",
        twitterUrl: c?.twitterUrl ?? "",
        tiktokUrl: c?.tiktokUrl ?? "",
      },
    };
  });
}

export async function loadBankSettings() {
  return safeDb(async (db) => {
    const rows = await db
      .select()
      .from(bankSettings)
      .where(eq(bankSettings.active, true))
      .limit(1);
    return rows[0] ?? null;
  });
}

export type FilterOption = { id: string; slug: string; name: string };

export type FilterOptions = {
  services: FilterOption[];
  workingTypes: FilterOption[];
  skills: FilterOption[];
  languages: FilterOption[];
  cities: string[];
};

export async function loadFilterOptions(): Promise<FilterOptions> {
  return safeDb(async (db) => {
    const [svc, wt, sk, lang, cityRows] = await Promise.all([
      db
        .select({ id: serviceCategories.id, slug: serviceCategories.slug, name: serviceCategories.name })
        .from(serviceCategories)
        .where(eq(serviceCategories.active, true))
        .orderBy(asc(serviceCategories.sortOrder)),
      db
        .select({ id: workingTypes.id, slug: workingTypes.slug, name: workingTypes.name })
        .from(workingTypes)
        .where(eq(workingTypes.active, true))
        .orderBy(asc(workingTypes.sortOrder)),
      db
        .select({ id: skills.id, slug: skills.slug, name: skills.name })
        .from(skills)
        .where(eq(skills.active, true))
        .orderBy(asc(skills.sortOrder)),
      db
        .select({ id: languages.id, slug: languages.code, name: languages.name })
        .from(languages)
        .where(eq(languages.active, true))
        .orderBy(asc(languages.sortOrder)),
      db
        .selectDistinct({ city: caregiverProfiles.city })
        .from(caregiverProfiles)
        .where(
          and(
            eq(caregiverProfiles.approvalStatus, "APPROVED"),
            eq(caregiverProfiles.publicVisibility, true),
            isNull(caregiverProfiles.deletedAt),
          ),
        ),
    ]);

    return {
      services: svc,
      workingTypes: wt,
      skills: sk,
      languages: lang,
      cities: cityRows.map((r) => r.city).filter((c): c is string => Boolean(c)).sort(),
    };
  });
}

export type CaregiverSearchInput = {
  serviceSlugs?: string[] | undefined;
  workingTypeSlugs?: string[] | undefined;
  skillSlugs?: string[] | undefined;
  city?: string | undefined;
  district?: string | undefined;
  minExperience?: number | undefined;
  featuredOnly?: boolean | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
};

export type CaregiverCard = {
  id: string;
  candidateCode: string;
  displayName: string;
  city: string | null;
  district: string | null;
  yearsOfExperience: number;
  featured: boolean;
  availabilityStatus: string;
  about: string | null;
  primaryPhotoUrl: string | null;
  services: string[];
  workingTypes: string[];
};

export type CaregiverSearchResult = {
  items: CaregiverCard[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Real PostgreSQL query — filters are applied in the database, never in JS.
 */
export async function searchCaregivers(
  input: CaregiverSearchInput,
): Promise<CaregiverSearchResult> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, input.pageSize ?? 12));

  return safeDb(async (db) => {
    const conditions = [
      eq(caregiverProfiles.approvalStatus, "APPROVED"),
      eq(caregiverProfiles.publicVisibility, true),
      eq(caregiverProfiles.availabilityStatus, "AVAILABLE"),
      isNull(caregiverProfiles.deletedAt),
    ];

    if (input.city) conditions.push(eq(caregiverProfiles.city, input.city));
    if (input.district) conditions.push(eq(caregiverProfiles.district, input.district));
    if (typeof input.minExperience === "number" && input.minExperience > 0) {
      conditions.push(gte(caregiverProfiles.yearsOfExperience, input.minExperience));
    }
    if (input.featuredOnly) conditions.push(eq(caregiverProfiles.featured, true));

    if (input.serviceSlugs?.length) {
      conditions.push(
        sql`exists (select 1 from ${caregiverServices}
          join ${serviceCategories} on ${serviceCategories.id} = ${caregiverServices.serviceId}
          where ${caregiverServices.caregiverId} = ${caregiverProfiles.id}
            and ${inArray(serviceCategories.slug, input.serviceSlugs)})`,
      );
    }
    if (input.workingTypeSlugs?.length) {
      conditions.push(
        sql`exists (select 1 from ${caregiverWorkingTypes}
          join ${workingTypes} on ${workingTypes.id} = ${caregiverWorkingTypes.workingTypeId}
          where ${caregiverWorkingTypes.caregiverId} = ${caregiverProfiles.id}
            and ${inArray(workingTypes.slug, input.workingTypeSlugs)})`,
      );
    }
    if (input.skillSlugs?.length) {
      conditions.push(
        sql`exists (select 1 from ${caregiverSkills}
          join ${skills} on ${skills.id} = ${caregiverSkills.skillId}
          where ${caregiverSkills.caregiverId} = ${caregiverProfiles.id}
            and ${inArray(skills.slug, input.skillSlugs)})`,
      );
    }

    const where = and(...conditions);

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: caregiverProfiles.id,
          candidateCode: caregiverProfiles.candidateCode,
          publicDisplayName: caregiverProfiles.publicDisplayName,
          firstName: caregiverProfiles.firstName,
          lastName: caregiverProfiles.lastName,
          city: caregiverProfiles.city,
          district: caregiverProfiles.district,
          yearsOfExperience: caregiverProfiles.yearsOfExperience,
          featured: caregiverProfiles.featured,
          availabilityStatus: caregiverProfiles.availabilityStatus,
          about: caregiverProfiles.about,
          primaryPhotoUrl: caregiverProfiles.primaryPhotoUrl,
          services: sql<string[]>`coalesce((select array_agg(sc.name order by sc.sort_order)
            from caregiver_services cs join service_categories sc on sc.id = cs.service_id
            where cs.caregiver_id = ${caregiverProfiles.id}), '{}')`,
          workingTypes: sql<string[]>`coalesce((select array_agg(wt.name order by wt.sort_order)
            from caregiver_working_types cwt join working_types wt on wt.id = cwt.working_type_id
            where cwt.caregiver_id = ${caregiverProfiles.id}), '{}')`,
        })
        .from(caregiverProfiles)
        .where(where)
        .orderBy(desc(caregiverProfiles.featured), desc(caregiverProfiles.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(caregiverProfiles)
        .where(where),
    ]);

    const items: CaregiverCard[] = rows.map((r) => ({
      id: r.id,
      candidateCode: r.candidateCode,
      displayName: r.publicDisplayName?.trim()
        ? r.publicDisplayName
        : `${r.firstName} ${r.lastName.slice(0, 1)}.`,
      city: r.city,
      district: r.district,
      yearsOfExperience: r.yearsOfExperience,
      featured: r.featured,
      availabilityStatus: r.availabilityStatus,
      about: r.about,
      primaryPhotoUrl: r.primaryPhotoUrl,
      services: r.services ?? [],
      workingTypes: r.workingTypes ?? [],
    }));

    const total = countRows[0]?.count ?? 0;

    try {
      await db.insert(searchEvents).values({ filters: input, resultCount: total });
    } catch {
      /* analytics must never break search */
    }

    return { items, total, page, pageSize };
  });
}
