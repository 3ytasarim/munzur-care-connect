import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { BlogCard } from "@/components/blog-card";
import { Reveal } from "@/components/reveal";
import StatCard from "@/components/ui/stat-card";
import { Hero } from "@/components/ui/tailwind-css-background-snippet";
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

  const tagCount = new Set(data.items.flatMap((p) => p.tags ?? [])).size;

  return (
    <main className="pb-14">
      <Hero>
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
              <BookOpen className="size-3.5" aria-hidden />
              MunzurDestek rehber yazıları
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Bakıcı bulma <span className="text-brand">rehberi</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Doğru bakıcıyı seçmek, ücretleri planlamak ve güvenli bir süreç yürütmek için
              hazırladığımız yazılar.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Yazı", value: data.items.length || "—" },
                { label: "Etiket", value: tagCount || "—" },
                { label: "Güncel rehber", value: "7/24" },
              ].map((s, i) => (
                <StatCard key={s.label} value={String(s.value)} label={s.label} delay={i * 120} />
              ))}
            </div>
          </div>
        </div>
      </Hero>

      <div className="container-page">
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
      </div>
    </main>
  );
}

