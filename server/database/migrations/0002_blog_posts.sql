-- MunzurDestek — blog module
CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" varchar(180) NOT NULL,
  "title" varchar(200) NOT NULL,
  "excerpt" text,
  "content" text NOT NULL DEFAULT '',
  "cover_image" text,
  "category" varchar(120) NOT NULL DEFAULT 'Bakıcı Bulma Rehberi',
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "active" boolean NOT NULL DEFAULT true,
  "published_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz,
  "author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_unique" ON "blog_posts" ("slug");
CREATE INDEX IF NOT EXISTS "blog_posts_published_idx" ON "blog_posts" ("published_at");
CREATE INDEX IF NOT EXISTS "blog_posts_active_idx" ON "blog_posts" ("active");
