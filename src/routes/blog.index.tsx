import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { BlogCard } from "@/components/blog-card";
import { Reveal } from "@/components/reveal";
import { listBlogPosts } from "@/lib/blog.functions";

const postsQuery = queryOptions({
  queryKey: ["blog-posts"],
  queryFn: () => listBlogPosts(),
});

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | MunzurDestek Bakıcı Rehberi" },
      {
        name: "description",
        content:
          "Bakıcı seçimi, ücretler, mülakat soruları ve bakım hizmetleri hakkında MunzurDestek rehber yazıları.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Blog | MunzurDestek Bakıcı Rehberi" },
      {
        property: "og:description",
        content: "Bakıcı bulma, ücretler ve güvenli işe alım hakkında güncel rehber yazıları.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: BlogIndex,
});

function BlogIndex() {
  const { data } = useSuspenseQuery(postsQuery);

  return (
    <main className="container-page py-14">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-strong">blog</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground">
          Bakıcı bulma rehberi
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Doğru bakıcıyı seçmek, ücretleri planlamak ve güvenli bir süreç yürütmek için hazırladığımız
          yazılar.
        </p>
      </Reveal>

      {data.items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Henüz yayınlanmış blog yazısı bulunmuyor.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className="h-full">
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
