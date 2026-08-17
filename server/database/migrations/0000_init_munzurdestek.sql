CREATE TYPE "public"."approval_status" AS ENUM('DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('ID_CARD', 'PASSPORT', 'CRIMINAL_RECORD', 'HEALTH_REPORT', 'CERTIFICATE', 'REFERENCE_LETTER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('FEMALE', 'MALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'MATCHED', 'CLOSED', 'SPAM');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'WAIVED');--> statement-breakpoint
CREATE TYPE "public"."proficiency" AS ENUM('BASIC', 'INTERMEDIATE', 'ADVANCED', 'NATIVE');--> statement-breakpoint
CREATE TYPE "public"."salary_period" AS ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'CONSULTANT', 'CAREGIVER');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "admin_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" uuid NOT NULL,
	"author_id" uuid,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" uuid,
	"old_data" jsonb,
	"new_data" jsonb,
	"ip" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_name" varchar(120) NOT NULL,
	"account_holder" varchar(160) NOT NULL,
	"iban" varchar(40) NOT NULL,
	"payment_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(8) DEFAULT 'TRY' NOT NULL,
	"payment_description_template" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_payment_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"note" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'TRY' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"description" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"from_status" "approval_status",
	"to_status" "approval_status" NOT NULL,
	"changed_by" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"issuer" varchar(160),
	"issued_at" date,
	"expires_at" date,
	"file_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"type" "document_type" DEFAULT 'OTHER' NOT NULL,
	"file_url" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "caregiver_educations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"school" varchar(160) NOT NULL,
	"degree" varchar(120),
	"field" varchar(120),
	"start_year" integer,
	"end_year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"employer" varchar(160),
	"city" varchar(80),
	"start_date" date,
	"end_date" date,
	"is_current" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_languages" (
	"caregiver_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"proficiency" "proficiency" DEFAULT 'INTERMEDIATE' NOT NULL,
	CONSTRAINT "caregiver_languages_caregiver_id_language_id_pk" PRIMARY KEY("caregiver_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "caregiver_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"url" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "caregiver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"candidate_code" varchar(16) NOT NULL,
	"first_name" varchar(80) NOT NULL,
	"last_name" varchar(80) NOT NULL,
	"public_display_name" varchar(120),
	"birth_date" date,
	"gender" "gender",
	"nationality" varchar(80),
	"city" varchar(80),
	"district" varchar(80),
	"about" text,
	"years_of_experience" integer DEFAULT 0 NOT NULL,
	"expected_salary" numeric(12, 2),
	"salary_currency" varchar(8) DEFAULT 'TRY' NOT NULL,
	"salary_period" "salary_period" DEFAULT 'MONTHLY' NOT NULL,
	"driving_license" boolean DEFAULT false NOT NULL,
	"has_car" boolean DEFAULT false NOT NULL,
	"smoking" boolean DEFAULT false NOT NULL,
	"pet_friendly" boolean DEFAULT false NOT NULL,
	"can_cook" boolean DEFAULT false NOT NULL,
	"can_travel" boolean DEFAULT false NOT NULL,
	"can_stay_overnight" boolean DEFAULT false NOT NULL,
	"can_work_abroad" boolean DEFAULT false NOT NULL,
	"has_passport" boolean DEFAULT false NOT NULL,
	"profile_completion_percentage" integer DEFAULT 0 NOT NULL,
	"approval_status" "approval_status" DEFAULT 'DRAFT' NOT NULL,
	"availability_status" "availability_status" DEFAULT 'AVAILABLE' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"public_visibility" boolean DEFAULT false NOT NULL,
	"primary_photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "caregiver_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"relation" varchar(120),
	"phone" varchar(32),
	"note" text,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_services" (
	"caregiver_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caregiver_services_caregiver_id_service_id_pk" PRIMARY KEY("caregiver_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "caregiver_skills" (
	"caregiver_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caregiver_skills_caregiver_id_skill_id_pk" PRIMARY KEY("caregiver_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "caregiver_working_types" (
	"caregiver_id" uuid NOT NULL,
	"working_type_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caregiver_working_types_caregiver_id_working_type_id_pk" PRIMARY KEY("caregiver_id","working_type_id")
);
--> statement-breakpoint
CREATE TABLE "contact_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(32),
	"whatsapp" varchar(32),
	"email" varchar(255),
	"address" text,
	"instagram_url" text,
	"facebook_url" text,
	"linkedin_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid,
	"candidate_code" varchar(16),
	"full_name" varchar(160),
	"phone" varchar(32),
	"email" varchar(255),
	"city" varchar(80),
	"message" text,
	"source" varchar(60) DEFAULT 'WEBSITE' NOT NULL,
	"status" "inquiry_status" DEFAULT 'NEW' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_inquiry_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"from_status" "inquiry_status",
	"to_status" "inquiry_status" NOT NULL,
	"changed_by" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(12) NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"title" varchar(200) NOT NULL,
	"body" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"reviewer_id" uuid,
	"decision" "approval_status" NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filters" jsonb,
	"result_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"icon" varchar(60),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(80) NOT NULL,
	"value" text,
	"group" varchar(40) DEFAULT 'general' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(32),
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'CAREGIVER' NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "whatsapp_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid,
	"candidate_code" varchar(16),
	"referrer" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "working_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_payment_receipts" ADD CONSTRAINT "candidate_payment_receipts_payment_id_candidate_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."candidate_payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_payments" ADD CONSTRAINT "candidate_payments_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_payments" ADD CONSTRAINT "candidate_payments_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_status_history" ADD CONSTRAINT "candidate_status_history_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_status_history" ADD CONSTRAINT "candidate_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_certificates" ADD CONSTRAINT "caregiver_certificates_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_documents" ADD CONSTRAINT "caregiver_documents_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_educations" ADD CONSTRAINT "caregiver_educations_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_experiences" ADD CONSTRAINT "caregiver_experiences_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_languages" ADD CONSTRAINT "caregiver_languages_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_languages" ADD CONSTRAINT "caregiver_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_photos" ADD CONSTRAINT "caregiver_photos_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_profiles" ADD CONSTRAINT "caregiver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_profiles" ADD CONSTRAINT "caregiver_profiles_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_references" ADD CONSTRAINT "caregiver_references_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_services" ADD CONSTRAINT "caregiver_services_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_services" ADD CONSTRAINT "caregiver_services_service_id_service_categories_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_skills" ADD CONSTRAINT "caregiver_skills_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_skills" ADD CONSTRAINT "caregiver_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_working_types" ADD CONSTRAINT "caregiver_working_types_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_working_types" ADD CONSTRAINT "caregiver_working_types_working_type_id_working_types_id_fk" FOREIGN KEY ("working_type_id") REFERENCES "public"."working_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_inquiries" ADD CONSTRAINT "customer_inquiries_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_inquiries" ADD CONSTRAINT "customer_inquiries_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_inquiry_status_history" ADD CONSTRAINT "customer_inquiry_status_history_inquiry_id_customer_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."customer_inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_inquiry_status_history" ADD CONSTRAINT "customer_inquiry_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_reviews" ADD CONSTRAINT "profile_reviews_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_reviews" ADD CONSTRAINT "profile_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_clicks" ADD CONSTRAINT "whatsapp_clicks_caregiver_id_caregiver_profiles_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregiver_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_notes_entity_idx" ON "admin_notes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_admin_idx" ON "audit_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "candidate_payment_receipts_payment_idx" ON "candidate_payment_receipts" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "candidate_payments_caregiver_idx" ON "candidate_payments" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "candidate_payments_status_idx" ON "candidate_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "candidate_status_history_caregiver_idx" ON "candidate_status_history" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_certificates_caregiver_idx" ON "caregiver_certificates" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_documents_caregiver_idx" ON "caregiver_documents" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_educations_caregiver_idx" ON "caregiver_educations" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_experiences_caregiver_idx" ON "caregiver_experiences" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_languages_caregiver_idx" ON "caregiver_languages" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_languages_language_idx" ON "caregiver_languages" USING btree ("language_id");--> statement-breakpoint
CREATE INDEX "caregiver_photos_caregiver_idx" ON "caregiver_photos" USING btree ("caregiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "caregiver_candidate_code_unique" ON "caregiver_profiles" USING btree ("candidate_code");--> statement-breakpoint
CREATE INDEX "caregiver_user_idx" ON "caregiver_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "caregiver_approval_idx" ON "caregiver_profiles" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "caregiver_availability_idx" ON "caregiver_profiles" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX "caregiver_visibility_idx" ON "caregiver_profiles" USING btree ("public_visibility");--> statement-breakpoint
CREATE INDEX "caregiver_city_idx" ON "caregiver_profiles" USING btree ("city");--> statement-breakpoint
CREATE INDEX "caregiver_district_idx" ON "caregiver_profiles" USING btree ("district");--> statement-breakpoint
CREATE INDEX "caregiver_experience_idx" ON "caregiver_profiles" USING btree ("years_of_experience");--> statement-breakpoint
CREATE INDEX "caregiver_featured_idx" ON "caregiver_profiles" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "caregiver_created_idx" ON "caregiver_profiles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "caregiver_references_caregiver_idx" ON "caregiver_references" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_services_caregiver_idx" ON "caregiver_services" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_services_service_idx" ON "caregiver_services" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "caregiver_skills_caregiver_idx" ON "caregiver_skills" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_skills_skill_idx" ON "caregiver_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "caregiver_working_types_caregiver_idx" ON "caregiver_working_types" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_working_types_type_idx" ON "caregiver_working_types" USING btree ("working_type_id");--> statement-breakpoint
CREATE INDEX "customer_inquiries_status_idx" ON "customer_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customer_inquiries_caregiver_idx" ON "customer_inquiries" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "customer_inquiries_created_idx" ON "customer_inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "customer_inquiry_status_history_inquiry_idx" ON "customer_inquiry_status_history" USING btree ("inquiry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_code_unique" ON "languages" USING btree ("code");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_reviews_caregiver_idx" ON "profile_reviews" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "profile_views_caregiver_idx" ON "profile_views" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "profile_views_created_idx" ON "profile_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "search_events_created_idx" ON "search_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "service_categories_slug_unique" ON "service_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "site_settings_key_unique" ON "site_settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_slug_unique" ON "skills" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "whatsapp_clicks_caregiver_idx" ON "whatsapp_clicks" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "whatsapp_clicks_created_idx" ON "whatsapp_clicks" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "working_types_slug_unique" ON "working_types" USING btree ("slug");