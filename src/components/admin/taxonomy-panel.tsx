import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Power, Trash2 } from "lucide-react";

import { Button3D } from "@/components/ui/button-3d";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminDeleteTaxonomyItem,
  adminGetTaxonomies,
  adminSaveTaxonomyItem,
  adminSetTaxonomyActive,
} from "@/lib/admin.functions";

type Kind = "services" | "workingTypes" | "skills";

const KIND_LABELS: Record<Kind, string> = {
  services: "Hizmet alanları",
  workingTypes: "Çalışma şekilleri",
  skills: "Uzmanlıklar",
};

type Item = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  active: boolean;
};

const emptyDraft: Draft = { name: "", slug: "", description: "", sortOrder: 0, active: true };

export function TaxonomyPanel() {
  const [kind, setKind] = useState<Kind>("services");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [notice, setNotice] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["admin-taxonomies"], queryFn: () => adminGetTaxonomies() });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-taxonomies"] });
    await queryClient.invalidateQueries({ queryKey: ["filter-options"] });
  };

  const save = useMutation({
    mutationFn: (input: Draft) =>
      adminSaveTaxonomyItem({
        data: {
          kind,
          ...(input.id ? { id: input.id } : {}),
          name: input.name,
          slug: input.slug,
          description: input.description,
          sortOrder: Number(input.sortOrder) || 0,
          active: input.active,
        },
      }),
    onSuccess: async () => {
      setDraft(emptyDraft);
      setNotice("Kaydedildi.");
      await refresh();
    },
    onError: () => setNotice("Kaydedilemedi. Bilgileri kontrol edin."),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) =>
      adminSetTaxonomyActive({ data: { kind, ...v } }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteTaxonomyItem({ data: { kind, id } }),
    onSuccess: async (res) => {
      setNotice(res.message ?? "Silindi.");
      await refresh();
    },
  });

  const items: Item[] = (query.data?.[kind] as Item[] | undefined) ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(KIND_LABELS) as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setDraft(emptyDraft);
              setNotice(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              kind === k
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setNotice(null);
          save.mutate(draft);
        }}
        className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <h3 className="text-base font-semibold text-foreground">
            {draft.id ? "Kaydı düzenle" : `Yeni ${KIND_LABELS[kind].toLowerCase()} ekle`}
          </h3>
        </div>
        <div>
          <Label htmlFor="tax-name">Ad</Label>
          <Input
            id="tax-name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
            minLength={2}
          />
        </div>
        <div>
          <Label htmlFor="tax-slug">Slug (boş bırakılırsa otomatik)</Label>
          <Input
            id="tax-slug"
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            placeholder="ornek-slug"
          />
        </div>
        {kind === "services" ? (
          <div className="sm:col-span-2">
            <Label htmlFor="tax-desc">Açıklama</Label>
            <Input
              id="tax-desc"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
        ) : null}
        <div>
          <Label htmlFor="tax-order">Sıra</Label>
          <Input
            id="tax-order"
            type="number"
            min={0}
            value={draft.sortOrder}
            onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand)]"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />
            Aktif
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button3D type="submit" disabled={save.isPending}>
            <Plus className="mr-1.5 size-4" /> {draft.id ? "Güncelle" : "Ekle"}
          </Button3D>
          {draft.id ? (
            <Button3D type="button" variant="ghost" onClick={() => setDraft(emptyDraft)}>
              Vazgeç
            </Button3D>
          ) : null}
          {notice ? <span className="text-sm text-muted-foreground">{notice}</span> : null}
        </div>
      </form>

      {query.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-brand" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Sıra</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{it.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{it.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{it.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        it.active
                          ? "bg-brand-soft text-brand-strong"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {it.active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button3D
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDraft({
                            id: it.id,
                            name: it.name,
                            slug: it.slug,
                            description: it.description ?? "",
                            sortOrder: it.sortOrder,
                            active: it.active,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button3D>
                      <Button3D
                        size="sm"
                        variant="outline"
                        onClick={() => toggle.mutate({ id: it.id, active: !it.active })}
                      >
                        <Power className="size-4" />
                      </Button3D>
                      <Button3D
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`${it.name} silinsin mi?`)) remove.mutate(it.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button3D>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Kayıt yok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
