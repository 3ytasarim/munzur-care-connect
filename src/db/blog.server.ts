/**
 * Server-only blog data access (Neon + Drizzle).
 */
import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { safeDb } from "./client.server";
import { blogPosts } from "./schema.server";
import { slugify } from "./admin-settings.server";
import { logAudit } from "@/lib/auth.server";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  active: boolean;
  publishedAt: string;
};

const columns = {
  id: blogPosts.id,
  slug: blogPosts.slug,
  title: blogPosts.title,
  excerpt: blogPosts.excerpt,
  content: blogPosts.content,
  coverImage: blogPosts.coverImage,
  category: blogPosts.category,
  tags: blogPosts.tags,
  active: blogPosts.active,
  publishedAt: blogPosts.publishedAt,
};

function toPost(row: Record<string, unknown>): BlogPost {
  return {
    ...(row as Omit<BlogPost, "publishedAt" | "tags">),
    tags: Array.isArray(row["tags"]) ? (row["tags"] as string[]) : [],
    publishedAt: new Date(row["publishedAt"] as string | Date).toISOString(),
  };
}

/** Allowlist-based HTML sanitizer for admin-authored rich text. */
export function sanitizeRichText(html: string): string {
  let out = html.slice(0, 200_000);
  out = out.replace(/<\s*(script|style|iframe|object|embed|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  out = out.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi, "");
  // strip event handlers and javascript: urls
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "");
  return out.trim();
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function listPublishedPosts(limit = 24): Promise<BlogPost[]> {
  return safeDb(async (db) => {
    const rows = await db
      .select(columns)
      .from(blogPosts)
      .where(and(eq(blogPosts.active, true), isNull(blogPosts.deletedAt)))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
    return rows.map(toPost);
  });
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  return safeDb(async (db) => {
    const rows = await db
      .select(columns)
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.active, true), isNull(blogPosts.deletedAt)))
      .limit(1);
    const row = rows[0];
    return row ? toPost(row) : null;
  });
}

export async function listAllPosts(): Promise<BlogPost[]> {
  return safeDb(async (db) => {
    const rows = await db
      .select(columns)
      .from(blogPosts)
      .where(isNull(blogPosts.deletedAt))
      .orderBy(desc(blogPosts.publishedAt));
    return rows.map(toPost);
  });
}

export type SavePostInput = {
  adminUserId: string;
  id?: string | undefined;
  title: string;
  slug?: string | undefined;
  excerpt?: string | undefined;
  content: string;
  coverImage?: string | undefined;
  category?: string | undefined;
  tags?: string[] | undefined;
  active?: boolean | undefined;
};

export async function savePost(input: SavePostInput) {
  const content = sanitizeRichText(input.content ?? "");
  const excerpt = (input.excerpt?.trim() || plainText(content).slice(0, 220)) || null;
  const tags = (input.tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 12);
  const category = input.category?.trim() || "Bakıcı Bulma Rehberi";
  const coverImage = input.coverImage?.trim() ? input.coverImage : null;

  return safeDb(async (db) => {
    let slug = slugify(input.slug?.trim() || input.title);
    if (!slug) slug = `yazi-${Date.now()}`;

    const clash = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    if (clash[0] && clash[0].id !== input.id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    if (input.id) {
      await db
        .update(blogPosts)
        .set({
          title: input.title.trim(),
          slug,
          excerpt,
          content,
          coverImage,
          category,
          tags,
          active: input.active ?? true,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, input.id));
      await logAudit({
        adminUserId: input.adminUserId,
        action: "blog.update",
        entityType: "blog_post",
        entityId: input.id,
        newData: { title: input.title, slug },
      });
      return { ok: true as const, id: input.id, slug };
    }

    const inserted = await db
      .insert(blogPosts)
      .values({
        title: input.title.trim(),
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags,
        active: input.active ?? true,
        authorId: input.adminUserId,
      })
      .returning({ id: blogPosts.id });

    const id = inserted[0]?.id as string;
    await logAudit({
      adminUserId: input.adminUserId,
      action: "blog.create",
      entityType: "blog_post",
      entityId: id,
      newData: { title: input.title, slug },
    });
    return { ok: true as const, id, slug };
  });
}

export async function setPostActive(params: { adminUserId: string; id: string; active: boolean }) {
  return safeDb(async (db) => {
    await db
      .update(blogPosts)
      .set({ active: params.active, updatedAt: new Date() })
      .where(eq(blogPosts.id, params.id));
    await logAudit({
      adminUserId: params.adminUserId,
      action: params.active ? "blog.activate" : "blog.deactivate",
      entityType: "blog_post",
      entityId: params.id,
    });
    return { ok: true as const };
  });
}

export async function deletePost(params: { adminUserId: string; id: string }) {
  return safeDb(async (db) => {
    await db
      .update(blogPosts)
      .set({ deletedAt: sql`now()`, active: false })
      .where(eq(blogPosts.id, params.id));
    await logAudit({
      adminUserId: params.adminUserId,
      action: "blog.delete",
      entityType: "blog_post",
      entityId: params.id,
    });
    return { ok: true as const, message: "Yazı silindi." };
  });
}
