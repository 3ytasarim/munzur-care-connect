import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button3D } from "@/components/ui/button-3d";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminDeleteBlogPost,
  adminListBlogPosts,
  adminSaveBlogPost,
  adminSetBlogPostActive,
} from "@/lib/blog.functions";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  active: boolean;
};

const emptyDraft: Draft = {
  title: "",
  slug: "",
  category: "Bakıcı Bulma Rehberi",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: [],
  active: true,
};

export function BlogPanel() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [tagInput, setTagInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["admin-blog"], queryFn: () => adminListBlogPosts() });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    await queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  const save = useMutation({
    mutationFn: (d: Draft) =>
      adminSaveBlogPost({
        data: {
          ...(d.id ? { id: d.id } : {}),
          title: d.title,
          slug: d.slug,
          excerpt: d.excerpt,
          content: d.content,
          coverImage: d.coverImage,
          category: d.category,
          tags: d.tags,
          active: d.active,
        },
      }),
    onSuccess: async () => {
      setDraft(emptyDraft);
      setTagInput("");
      setNotice("Yazı kaydedildi.");
      await refresh();
    },
    onError: () => setNotice("Kaydedilemedi. Başlık en az 3 karakter olmalı."),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => adminSetBlogPostActive({ data: v }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteBlogPost({ data: { id } }),
    onSuccess: async () => {
      setNotice("Yazı silindi.");
      await refresh();
    },
  });

  function addTag() {
    const t = tagInput.trim();
    if (!t || draft.tags.includes(t) || draft.tags.length >= 12) return;
    setDraft((d) => ({ ...d, tags: [...d.tags, t] }));
    setTagInput("");
  }

  const posts = query.data?.items ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      {/* editor */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {draft.id ? "Yazıyı düzenle" : "Yeni blog yazısı"}
          </h2>
          {draft.id ? (
            <button
              type="button"
              onClick={() => setDraft(emptyDraft)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Vazgeç
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="blog-title">Başlık</Label>
            <Input
              id="blog-title"
              value={draft.title}
              maxLength={200}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Yabancı Bakıcı mı Arıyorsunuz?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="blog-category">Kategori</Label>
              <Input
                id="blog-category"
                value={draft.category}
                maxLength={120}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="blog-slug">URL (opsiyonel)</Label>
              <Input
                id="blog-slug"
                value={draft.slug}
                maxLength={180}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="otomatik"
              />
            </div>
          </div>

          <ImageField
            label="Kapak görseli"
            hint="Önerilen 1200 × 800 px (JPG/PNG)"
            maxWidth={1200}
            maxHeight={800}
            value={draft.coverImage}
            onChange={(next) => setDraft((d) => ({ ...d, coverImage: next }))}
          />

          <div>
            <Label htmlFor="blog-excerpt">Özet (opsiyonel)</Label>
            <Input
              id="blog-excerpt"
              value={draft.excerpt}
              maxLength={500}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              placeholder="Boş bırakırsanız içerikten otomatik oluşturulur."
            />
          </div>

          <div>
            <Label>İçerik</Label>
            <div className="mt-2">
              <RichTextEditor
                value={draft.content}
                onChange={(html) => setDraft((d) => ({ ...d, content: html }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="blog-tags">Etiketler</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="blog-tags"
                value={tagInput}
                maxLength={40}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Etiket yazıp Enter'a basın"
              />
              <Button3D type="button" variant="outline" onClick={addTag}>
                <Plus className="size-4" />
              </Button3D>
            </div>
            {draft.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand-strong"
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`${t} etiketini kaldır`}
                      onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }))}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              className="size-4 accent-[var(--color-brand,#57B614)]"
            />
            Yayında (aktif)
          </label>

          {notice ? <p className="text-sm text-brand-strong">{notice}</p> : null}

          <Button3D onClick={() => save.mutate(draft)} disabled={save.isPending} className="w-full">
            {save.isPending ? "Kaydediliyor…" : draft.id ? "Değişiklikleri kaydet" : "Yazıyı yayınla"}
          </Button3D>
        </div>
      </section>

      {/* list */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Blog yazıları ({posts.length})
        </h2>

        {query.isLoading ? (
          <Loader2 className="size-5 animate-spin text-brand" />
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Henüz blog yazısı yok. Soldaki formdan ilk yazınızı ekleyin.
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-48 flex-1">
                  <p className="font-medium text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · {new Date(p.publishedAt).toLocaleDateString("tr-TR")} ·{" "}
                    {p.active ? "Yayında" : "Pasif"}
                  </p>
                  {p.tags.length ? (
                    <p className="mt-1 text-xs text-brand-strong">{p.tags.join(", ")}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button3D
                    variant="outline"
                    onClick={() =>
                      setDraft({
                        id: p.id,
                        title: p.title,
                        slug: p.slug,
                        category: p.category,
                        excerpt: p.excerpt ?? "",
                        content: p.content,
                        coverImage: p.coverImage ?? "",
                        tags: p.tags,
                        active: p.active,
                      })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button3D>
                  <Button3D
                    variant="outline"
                    onClick={() => toggle.mutate({ id: p.id, active: !p.active })}
                  >
                    {p.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button3D>
                  <Button3D
                    variant="outline"
                    onClick={() => {
                      if (window.confirm("Bu yazı silinsin mi?")) remove.mutate(p.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button3D>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
