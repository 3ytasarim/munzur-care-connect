import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { getBlogPost } from "@/lib/blog.functions";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPost({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return { meta: [{ title: "Yazı bulunamadı | MunzurDestek" }, { name: "robots", content: "noindex" }] };
    }
    const { title, excerpt } = loaderData.post;
    const description = excerpt ?? "MunzurDestek blog yazısı.";
    return {
      meta: [
        { title: `${title} | MunzurDestek Blog` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: BlogPostPage,
});

function PostNotFound() {
  return (
    <main className="container-page py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-foreground">Yazı bulunamadı</h1>
      <Link to="/blog" className="mt-4 inline-block text-brand-strong underline">
        Tüm yazılara dön
      </Link>
    </main>
  );
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post;
  if (!post) return <PostNotFound />;

  return (
    <main className="container-page max-w-3xl py-14">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-strong"
      >
        <ArrowLeft className="size-4" /> Tüm yazılar
      </Link>

      <p className="mt-6 text-sm font-medium text-brand-strong">{post.category}</p>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-foreground">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-8 w-full rounded-2xl border border-border object-cover"
        />
      ) : null}

      <article
        className="prose-blog mt-8 text-base leading-relaxed text-foreground"
        // Content is sanitized server-side with an allowlist before it is stored.
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length ? (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand-strong"
            >
              #{t}
            </span>
          ))}
        </div>
      ) : null}
    </main>
  );
}
