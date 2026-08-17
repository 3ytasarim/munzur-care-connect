/**
 * MunzurDestek — PostgreSQL (Neon) schema.
 * Server-only module: never imported from client code.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  date,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ enums */

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "CONSULTANT",
  "CAREGIVER",
]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "ARCHIVED"]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "DRAFT",
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);
export const availabilityStatusEnum = pgEnum("availability_status", [
  "AVAILABLE",
  "BUSY",
  "UNAVAILABLE",
]);
export const genderEnum = pgEnum("gender", ["FEMALE", "MALE", "OTHER"]);
export const salaryPeriodEnum = pgEnum("salary_period", ["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "WAITING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "WAIVED",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "MATCHED",
  "CLOSED",
  "SPAM",
]);
export const documentTypeEnum = pgEnum("document_type", [
  "ID_CARD",
  "PASSPORT",
  "CRIMINAL_RECORD",
  "HEALTH_REPORT",
  "CERTIFICATE",
  "REFERENCE_LETTER",
  "OTHER",
]);
export const proficiencyEnum = pgEnum("proficiency", [
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
  "NATIVE",
]);

/* ------------------------------------------------------------------ users */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("CAREGIVER"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    emailVerified: boolean("email_verified").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_status_idx").on(t.status),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    index("sessions_user_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------- caregiver profile */

export const caregiverProfiles = pgTable(
  "caregiver_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    candidateCode: varchar("candidate_code", { length: 16 }).notNull(),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 80 }).notNull(),
    publicDisplayName: varchar("public_display_name", { length: 120 }),
    birthDate: date("birth_date"),
    gender: genderEnum("gender"),
    nationality: varchar("nationality", { length: 80 }),
    city: varchar("city", { length: 80 }),
    district: varchar("district", { length: 80 }),
    about: text("about"),
    yearsOfExperience: integer("years_of_experience").notNull().default(0),
    expectedSalary: numeric("expected_salary", { precision: 12, scale: 2 }),
    salaryCurrency: varchar("salary_currency", { length: 8 }).notNull().default("TRY"),
    salaryPeriod: salaryPeriodEnum("salary_period").notNull().default("MONTHLY"),
    drivingLicense: boolean("driving_license").notNull().default(false),
    hasCar: boolean("has_car").notNull().default(false),
    smoking: boolean("smoking").notNull().default(false),
    petFriendly: boolean("pet_friendly").notNull().default(false),
    canCook: boolean("can_cook").notNull().default(false),
    canTravel: boolean("can_travel").notNull().default(false),
    canStayOvernight: boolean("can_stay_overnight").notNull().default(false),
    canWorkAbroad: boolean("can_work_abroad").notNull().default(false),
    hasPassport: boolean("has_passport").notNull().default(false),
    profileCompletionPercentage: integer("profile_completion_percentage").notNull().default(0),
    approvalStatus: approvalStatusEnum("approval_status").notNull().default("DRAFT"),
    availabilityStatus: availabilityStatusEnum("availability_status")
      .notNull()
      .default("AVAILABLE"),
    featured: boolean("featured").notNull().default(false),
    publicVisibility: boolean("public_visibility").notNull().default(false),
    primaryPhotoUrl: text("primary_photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("caregiver_candidate_code_unique").on(t.candidateCode),
    index("caregiver_user_idx").on(t.userId),
    index("caregiver_approval_idx").on(t.approvalStatus),
    index("caregiver_availability_idx").on(t.availabilityStatus),
    index("caregiver_visibility_idx").on(t.publicVisibility),
    index("caregiver_city_idx").on(t.city),
    index("caregiver_district_idx").on(t.district),
    index("caregiver_experience_idx").on(t.yearsOfExperience),
    index("caregiver_featured_idx").on(t.featured),
    index("caregiver_created_idx").on(t.createdAt),
  ],
);

/* ------------------------------------------------------------ taxonomies */

export const serviceCategories = pgTable(
  "service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 60 }),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("service_categories_slug_unique").on(t.slug)],
);

export const workingTypes = pgTable(
  "working_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("working_types_slug_unique").on(t.slug)],
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("skills_slug_unique").on(t.slug)],
);

export const languages = pgTable(
  "languages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 12 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("languages_code_unique").on(t.code)],
);

/* -------------------------------------------------- junction (many-to-many) */

export const caregiverServices = pgTable(
  "caregiver_services",
  {
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.caregiverId, t.serviceId] }),
    index("caregiver_services_caregiver_idx").on(t.caregiverId),
    index("caregiver_services_service_idx").on(t.serviceId),
  ],
);

export const caregiverWorkingTypes = pgTable(
  "caregiver_working_types",
  {
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    workingTypeId: uuid("working_type_id")
      .notNull()
      .references(() => workingTypes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.caregiverId, t.workingTypeId] }),
    index("caregiver_working_types_caregiver_idx").on(t.caregiverId),
    index("caregiver_working_types_type_idx").on(t.workingTypeId),
  ],
);

export const caregiverSkills = pgTable(
  "caregiver_skills",
  {
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.caregiverId, t.skillId] }),
    index("caregiver_skills_caregiver_idx").on(t.caregiverId),
    index("caregiver_skills_skill_idx").on(t.skillId),
  ],
);

export const caregiverLanguages = pgTable(
  "caregiver_languages",
  {
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    proficiency: proficiencyEnum("proficiency").notNull().default("INTERMEDIATE"),
  },
  (t) => [
    primaryKey({ columns: [t.caregiverId, t.languageId] }),
    index("caregiver_languages_caregiver_idx").on(t.caregiverId),
    index("caregiver_languages_language_idx").on(t.languageId),
  ],
);

/* ------------------------------------------------------ profile sub-records */

export const caregiverExperiences = pgTable(
  "caregiver_experiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    employer: varchar("employer", { length: 160 }),
    city: varchar("city", { length: 80 }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("caregiver_experiences_caregiver_idx").on(t.caregiverId)],
);

export const caregiverEducations = pgTable(
  "caregiver_educations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    school: varchar("school", { length: 160 }).notNull(),
    degree: varchar("degree", { length: 120 }),
    field: varchar("field", { length: 120 }),
    startYear: integer("start_year"),
    endYear: integer("end_year"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("caregiver_educations_caregiver_idx").on(t.caregiverId)],
);

export const caregiverCertificates = pgTable(
  "caregiver_certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    issuer: varchar("issuer", { length: 160 }),
    issuedAt: date("issued_at"),
    expiresAt: date("expires_at"),
    fileUrl: text("file_url"),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("caregiver_certificates_caregiver_idx").on(t.caregiverId)],
);

export const caregiverReferences = pgTable(
  "caregiver_references",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    relation: varchar("relation", { length: 120 }),
    phone: varchar("phone", { length: 32 }),
    note: text("note"),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("caregiver_references_caregiver_idx").on(t.caregiverId)],
);

export const caregiverDocuments = pgTable(
  "caregiver_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull().default("OTHER"),
    fileUrl: text("file_url").notNull(),
    verified: boolean("verified").notNull().default(false),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("caregiver_documents_caregiver_idx").on(t.caregiverId)],
);

export const caregiverPhotos = pgTable(
  "caregiver_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("caregiver_photos_caregiver_idx").on(t.caregiverId)],
);

/* ---------------------------------------------------------------- payments */

export const candidatePayments = pgTable(
  "candidate_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("TRY"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    description: text("description"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("candidate_payments_caregiver_idx").on(t.caregiverId),
    index("candidate_payments_status_idx").on(t.status),
  ],
);

export const candidatePaymentReceipts = pgTable(
  "candidate_payment_receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => candidatePayments.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    note: text("note"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("candidate_payment_receipts_payment_idx").on(t.paymentId)],
);

/* ------------------------------------------------------- review / workflow */

export const profileReviews = pgTable(
  "profile_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    decision: approvalStatusEnum("decision").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("profile_reviews_caregiver_idx").on(t.caregiverId)],
);

export const candidateStatusHistory = pgTable(
  "candidate_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id")
      .notNull()
      .references(() => caregiverProfiles.id, { onDelete: "cascade" }),
    fromStatus: approvalStatusEnum("from_status"),
    toStatus: approvalStatusEnum("to_status").notNull(),
    changedBy: uuid("changed_by").references(() => users.id, { onDelete: "set null" }),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("candidate_status_history_caregiver_idx").on(t.caregiverId)],
);

/* ------------------------------------------------------------------- leads */

export const customerInquiries = pgTable(
  "customer_inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id").references(() => caregiverProfiles.id, {
      onDelete: "set null",
    }),
    candidateCode: varchar("candidate_code", { length: 16 }),
    fullName: varchar("full_name", { length: 160 }),
    phone: varchar("phone", { length: 32 }),
    email: varchar("email", { length: 255 }),
    city: varchar("city", { length: 80 }),
    message: text("message"),
    source: varchar("source", { length: 60 }).notNull().default("WEBSITE"),
    status: inquiryStatusEnum("status").notNull().default("NEW"),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("customer_inquiries_status_idx").on(t.status),
    index("customer_inquiries_caregiver_idx").on(t.caregiverId),
    index("customer_inquiries_created_idx").on(t.createdAt),
  ],
);

export const customerInquiryStatusHistory = pgTable(
  "customer_inquiry_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => customerInquiries.id, { onDelete: "cascade" }),
    fromStatus: inquiryStatusEnum("from_status"),
    toStatus: inquiryStatusEnum("to_status").notNull(),
    changedBy: uuid("changed_by").references(() => users.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("customer_inquiry_status_history_inquiry_idx").on(t.inquiryId)],
);

/* ------------------------------------------------------------- analytics */

export const whatsappClicks = pgTable(
  "whatsapp_clicks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id").references(() => caregiverProfiles.id, {
      onDelete: "set null",
    }),
    candidateCode: varchar("candidate_code", { length: 16 }),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("whatsapp_clicks_caregiver_idx").on(t.caregiverId),
    index("whatsapp_clicks_created_idx").on(t.createdAt),
  ],
);

export const profileViews = pgTable(
  "profile_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caregiverId: uuid("caregiver_id").references(() => caregiverProfiles.id, {
      onDelete: "cascade",
    }),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("profile_views_caregiver_idx").on(t.caregiverId),
    index("profile_views_created_idx").on(t.createdAt),
  ],
);

export const searchEvents = pgTable(
  "search_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filters: jsonb("filters"),
    resultCount: integer("result_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("search_events_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------- admin / settings */

export const adminNotes = pgTable(
  "admin_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("admin_notes_entity_idx").on(t.entityType, t.entityId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

/** Flexible key/value site settings (branding, contact, feature flags). */
export const siteSettings = pgTable(
  "site_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 80 }).notNull(),
    value: text("value"),
    group: varchar("group", { length: 40 }).notNull().default("general"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [uniqueIndex("site_settings_key_unique").on(t.key)],
);

export const bankSettings = pgTable("bank_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankName: varchar("bank_name", { length: 120 }).notNull(),
  accountHolder: varchar("account_holder", { length: 160 }).notNull(),
  iban: varchar("iban", { length: 40 }).notNull(),
  paymentAmount: numeric("payment_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 8 }).notNull().default("TRY"),
  paymentDescriptionTemplate: text("payment_description_template"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactSettings = pgTable("contact_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 32 }),
  whatsapp: varchar("whatsapp", { length: 32 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUserId: uuid("admin_user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: uuid("entity_id"),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    ip: varchar("ip", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_admin_idx").on(t.adminUserId),
    index("audit_logs_created_idx").on(t.createdAt),
  ],
);
