import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  deletePost,
  getPublishedPost,
  listAllPosts,
  listPublishedPosts,
  savePost,
  setPostActive,
} from "@/db/blog.server";
import { requireRole } from "@/lib/auth.server";

export const listBlogPosts = createServerFn({ method: "GET" }).handler(async () => ({
  items: await listPublishedPosts(24),
}));

export const getBlogPost = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(180) }).parse(input))
  .handler(async ({ data }) => ({ post: await getPublishedPost(data.slug) }));

export const adminListBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return { items: await listAllPosts() };
});

export const adminSaveBlogPost = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı.").max(200),
        slug: z.string().trim().max(180).optional(),
        excerpt: z.string().trim().max(500).optional(),
        content: z.string().max(200_000).default(""),
        coverImage: z.string().max(3_000_000).optional(),
        category: z.string().trim().max(120).optional(),
        tags: z.array(z.string().trim().max(40)).max(12).default([]),
        active: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return savePost({ adminUserId: admin.id, ...data });
  });

export const adminSetBlogPostActive = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return setPostActive({ adminUserId: admin.id, ...data });
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return deletePost({ adminUserId: admin.id, id: data.id });
  });
