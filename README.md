# Munzur Care Connect

IMPORTANT PROJECT UPDATE — BRAND + DATABASE

The project name is:

MunzurDestek

The final logo is not ready yet.

Until the final logo is provided, use a clean typography-based temporary brand mark:

MunzurDestek

Do NOT create a random permanent logo.

The temporary text logo should visually match the project's final brand direction.

1. BRAND COLOR SYSTEM

The provided Munzur brand reference uses a fresh green and warm yellow visual identity.

Use these colors as the basis of the application's design system:

Primary Green

#57B614

Use for:

Primary buttons

Selected filters

Active navigation states

Success states

Icons

Important links

CTA elements

Verification indicators where appropriate

Primary Yellow

#FFDE58

Use for:

Secondary accents

Highlights

Small decorative elements

Selected tags

Important informational areas

CTA backgrounds where contrast is sufficient

Do NOT make the entire website bright yellow or green.

The interface must remain premium and professional.

Use neutral supporting colors such as:

White

Off-white

Very light warm gray

Dark charcoal

Soft gray borders

Recommended surface direction:

Background:
#FAFAF7

Cards:
#FFFFFF

Main text:
#1F2933

Secondary text:
#667085

Borders:
#E5E7EB

Primary green:
#57B614

Warm yellow:
#FFDE58

2. DESIGN PERSONALITY

The platform must feel:

trustworthy

warm

safe

clean

human

professional

modern

family-oriented

This is a care services platform.

It must NOT look like:

a crypto dashboard

a generic SaaS template

an aggressive recruitment portal

a cheap classified ads website

Avoid excessive gradients.

Avoid excessive glassmorphism.

Avoid too many rounded floating cards.

Use subtle shadows.

Use clear hierarchy.

Use excellent whitespace.

3. TEMPORARY HEADER BRAND

Until the final logo is uploaded:

Display:

MunzurDestek

in the header.

Suggested visual style:

Munzur → Green
Destek → Dark charcoal or warm yellow accent

Keep this configurable.

When the final logo is uploaded later, it must be possible to replace the temporary text logo from:

Super Admin → Site Settings → Branding

without changing source code.

Brand settings must support:

Logo

Dark logo

Mobile logo

Favicon

Site name

Primary color

Secondary color

4. DATABASE

Use PostgreSQL with Neon.tech as the primary production database.

The project already has a Neon PostgreSQL database.

Database connection must be handled through:

DATABASE_URL=


The connection string must NEVER be hardcoded into frontend files.

It must NEVER be exposed through:

Vite public environment variables

VITE_DATABASE_URL

client-side JavaScript

browser source code

API responses

Only server-side/backend code may access the database credentials.

5. NEON CONNECTION

The database provider is:

Neon.tech PostgreSQL

Use SSL.

Connection configuration must support Neon pooled PostgreSQL connections.

The developer will provide the actual connection string through the secure environment variable:

DATABASE_URL=postgresql://neondb_owner:npg_GcAEOeVJRn23@ep-hidden-wave-b1vhpx2w-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

Do not create a separate local-only mock database as the main application database.

Development and production functionality should be based on the actual PostgreSQL schema.

6. DATABASE-FIRST DEVELOPMENT

This must be a REAL database-driven application.

Before building large portions of the UI, create the database schema and migrations.

Use a professional ORM/migration architecture compatible with PostgreSQL.

Preferred architecture may use:

Drizzle ORM

or another robust PostgreSQL-compatible ORM if the current Lovable stack requires it.

However:

Do NOT replace Neon with Supabase database unless explicitly requested.

The primary database is Neon PostgreSQL.

7. INITIAL DATABASE TABLES

Create relational tables for at least:

users
caregiver_profiles
service_categories
caregiver_services
working_types
caregiver_working_types
skills
caregiver_skills
languages
caregiver_languages
caregiver_experiences
caregiver_educations
caregiver_certificates
caregiver_references
caregiver_documents
caregiver_photos

candidate_payments
candidate_payment_receipts

profile_reviews
candidate_status_history

customer_inquiries
customer_inquiry_status_history

whatsapp_clicks
profile_views
search_events

admin_notes
notifications
site_settings
bank_settings
contact_settings
audit_logs


Use proper:

primary keys

foreign keys

indexes

timestamps

constraints

unique constraints

many-to-many junction tables

8. USERS TABLE

The users table should support:

id
email
phone
password_hash
role
status
email_verified
phone_verified
created_at
updated_at
last_login_at


Possible roles:

SUPER_ADMIN
ADMIN
CONSULTANT
CAREGIVER


Do not use email addresses as the permission mechanism.

9. CAREGIVER PROFILE TABLE

Core caregiver profile should support fields such as:

id
user_id
candidate_code
first_name
last_name
public_display_name
birth_date
gender
nationality
city
district

about

years_of_experience

expected_salary
salary_currency
salary_period

driving_license
has_car
smoking
pet_friendly
can_cook
can_travel
can_stay_overnight
can_work_abroad
has_passport

profile_completion_percentage

approval_status
availability_status

featured
public_visibility

created_at
updated_at
approved_at
approved_by


Do not store services or work types as comma-separated strings.

Use relational tables.

10. UNIQUE CANDIDATE CODE

Automatically generate a unique candidate code.

Example:

MD-1001
MD-1002
MD-1003


Use:

MD

for:

MunzurDestek

The code must remain stable even if the candidate changes their name.

This code will be used for:

WhatsApp inquiries

Admin searches

Customer inquiries

Candidate profile URL/reference

Internal CRM

11. DATABASE INDEXES

Create indexes for fields heavily used in search.

At minimum consider indexes on:

approval_status
availability_status
public_visibility
city
district
years_of_experience
candidate_code
featured
created_at


And appropriate indexes on junction tables:

caregiver_services.caregiver_id
caregiver_services.service_id

caregiver_working_types.caregiver_id
caregiver_working_types.working_type_id

caregiver_skills.caregiver_id
caregiver_skills.skill_id


Filtering hundreds or thousands of caregivers must remain efficient.

12. CAREGIVER SEARCH MUST QUERY POSTGRESQL

Search filters must NOT filter a hardcoded JavaScript array.

Example request:

Yaşlı Bakımı
+
Yatılı
+
İstanbul
+
5+ yıl deneyim


must produce a real database query against Neon.

Only candidates satisfying:

approval_status = APPROVED
public_visibility = true
availability_status = AVAILABLE


should normally appear publicly.

13. SUPER ADMIN DATABASE SETTINGS

Super Admin should have configuration screens for data that should not be hardcoded.

Examples:

Service Categories

Admin can:

create

edit

deactivate

reorder

Working Types

Admin can:

create

edit

deactivate

reorder

Skills

Admin can:

create

edit

deactivate

Languages

Admin can:

create

edit

deactivate

This data must come from Neon PostgreSQL.

14. SITE SETTINGS TABLE

Create a flexible site settings architecture.

Settings include:

site_name
logo_url
mobile_logo_url
favicon_url

primary_color
secondary_color

company_name

phone
whatsapp
email
address

instagram_url
facebook_url
linkedin_url

candidate_payment_required

default_currency


Initial values:

site_name = MunzurDestek

primary_color = #57B614

secondary_color = #FFDE58


15. CONTACT SETTINGS

The WhatsApp number used by public caregiver profiles must come from database settings.

Do not hardcode:

+90...


inside components.

Retrieve it from application/site settings.

This allows Super Admin to change the WhatsApp number later.

16. BANK SETTINGS

Create database-driven bank settings.

Fields:

bank_name
account_holder
iban
payment_amount
currency
payment_description_template
active


Super Admin can edit these.

Never expose database credentials or backend secrets through this area.

17. PAYMENT FEATURE FLAG

Create system setting:

candidate_payment_required


Boolean:

true
false


When false:

Caregiver registration flow should skip payment and proceed to admin review.

When true:

Caregiver should see payment instructions before final admin approval.

Do not redesign the entire application when this setting changes.

18. ADMIN SEED ACCOUNT

Create the architecture required for an initial Super Admin account.

Do NOT commit a plain-text admin password to Git.

Create the Super Admin through:

a secure seed script

environment variables

or a protected initialization process

Never store plain text passwords.

Passwords must be securely hashed.

19. DATABASE MIGRATIONS

All schema changes must use migrations.

Do not manually rely on creating tables from the Neon dashboard.

The repository should contain migration history so the database can be recreated safely.

Example structure:

server/
database/
schema/
migrations/


or the equivalent clean structure for the selected framework.

20. DATABASE BACKUP / SAFETY

Design the application so accidental UI actions do not permanently destroy critical caregiver data.

Prefer soft deletion for important records.

Example:

deleted_at


rather than immediately physically deleting candidates.

Super Admin should preferably have:

Archive Candidate

instead of irreversible hard delete.

21. AUDITABILITY

Changes performed by Super Admin must create audit records.

Examples:

Candidate approved
Candidate suspended
Candidate profile edited
Candidate payment approved
Bank settings changed
WhatsApp number changed
Service category created
Service category disabled


Store:

admin_user_id
action
entity_type
entity_id
old_data
new_data
created_at


where appropriate.

22. DATABASE CONNECTION ERROR HANDLING

If Neon is temporarily unavailable:

Do not expose raw PostgreSQL errors to users.

Public UI:

"Şu anda veriler yüklenemiyor. Lütfen tekrar deneyin."

Admin may receive more detailed but still sanitized diagnostics.

Never display:

database hostname

database username

database password

SQL query strings containing sensitive information

23. NO MOCK DATA AFTER DATABASE CONNECTION

After Neon connection is established:

Remove fake dashboard counts.

Remove fake caregiver arrays.

Remove fake payment entries.

Remove fake customer inquiries.

All production UI must read from Neon.

Seed data may be added ONLY for controlled development/testing and should be clearly identifiable.

24. HOMEPAGE COLOR IMPLEMENTATION

The homepage should use MunzurDestek colors subtly.

Example:

Hero:

Mostly white/off-white background.

Main headline:

Dark charcoal.

Important highlighted word:

Green.

Primary CTA:

Green background / white text.

Secondary CTA:

White or light background with green border.

Small decorative accents:

Yellow.

25. CAREGIVER CARDS

Caregiver cards should remain mostly white.

Use:

Green for:

active badges

primary CTA

verified indicators

Yellow for:

subtle highlights

featured badge

secondary tags where appropriate

Do NOT make entire cards green/yellow.

Candidate photos must remain the visual focal point.

26. FILTER UI

Selected filters:

Use green accent.

Checkbox/radio selected state:

Green.

Active filter chip can use:

Light green background + dark green text.

Important secondary highlights may use yellow.

27. ADMIN PANEL

Admin panel must follow the same brand identity while remaining professional.

Sidebar:

White or dark neutral.

Active item:

Munzur green.

Dashboard metric accents:

Green/yellow used sparingly.

Do not make the admin panel look like a separate unrelated product.

28. APPLICATION NAME

Use:

MunzurDestek

throughout the project for now.

Examples:

Page title:

MunzurDestek | Güvenilir Bakıcı ve Bakım Hizmetleri


Admin:

MunzurDestek Yönetim Paneli


Candidate panel:

MunzurDestek Aday Paneli


FINAL INSTRUCTION

Connect the application to the Neon PostgreSQL database FIRST.

Do not simply create UI screens with static arrays.

The application must progressively become functional with:

Authentication
→ Database
→ Candidate registration
→ Candidate profile
→ Admin approval
→ Public filtering
→ WhatsApp inquiry
→ Lead management

Every module should use the actual PostgreSQL database.

Keep secrets exclusively server-side.

Use the MunzurDestek green/yellow identity consistently throughout the project.

For now, display the temporary textual brand:

MunzurDestek

and make the final logo replaceable later from Super Admin without source-code modification.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5687aae-da5c-4ed7-bd40-2c5a18d70e10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
