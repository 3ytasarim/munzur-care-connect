import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  publishedAt: string;
};

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function BlogCard({ post }: { post: BlogCardPost }) {
  const date = new Date(post.publishedAt);

  return (
    <article className="group hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:border-brand">
      <span className="absolute left-4 top-0 z-10 flex flex-col items-center rounded-b-md bg-brand px-3 py-1 text-brand-foreground shadow-md">
        <span className="font-display text-lg font-bold leading-none">{date.getDate()}</span>
        <span className="text-[10px] uppercase tracking-wide">{MONTHS[date.getMonth()]}</span>
      </span>

      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 text-center">
        <p className="text-xs font-medium text-muted-foreground">{post.category}</p>
        <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-left text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 flex justify-start">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand-strong transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            Devamını Oku
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
