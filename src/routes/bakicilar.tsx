import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { CaregiverCard } from "@/components/caregiver-card";
import { Button3D } from "@/components/ui/button-3d";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import { Hero } from "@/components/ui/tailwind-css-background-snippet";

import { findCaregivers, getFilterOptions } from "@/lib/caregivers.functions";
import type { CaregiverSearchParams } from "@/lib/caregiver-search-schema";


const filterOptionsQuery = queryOptions({
  queryKey: ["filter-options"],
  queryFn: () => getFilterOptions(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/bakicilar")({
  head: () => ({
    meta: [
      { title: "Bakıcı Ara | MunzurDestek" },
      {
        name: "description",
        content:
          "Yaşlı bakımı, bebek bakımı ve hasta bakımı için onaylı MunzurDestek adaylarını şehir, çalışma şekli ve deneyime göre filtreleyin.",
      },
      { property: "og:title", content: "Bakıcı Ara | MunzurDestek" },
      {
        property: "og:description",
        content: "Onaylı bakıcı adaylarını şehir, hizmet ve deneyime göre filtreleyin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(filterOptionsQuery),
  component: CaregiverSearchPage,
});

const EXPERIENCE_STEPS = [0, 1, 3, 5, 10];

function CaregiverSearchPage() {
  const { data: options } = useSuspenseQuery(filterOptionsQuery);
  const [filters, setFilters] = useState<CaregiverSearchParams>({ page: 1, pageSize: 12 });

  const results = useQuery({
    queryKey: ["caregivers", filters],
    queryFn: () => findCaregivers({ data: filters }),
  });

  function toggle(key: "serviceSlugs" | "workingTypeSlugs" | "skillSlugs", slug: string) {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      return { ...prev, [key]: next, page: 1 };
    });
  }

  const locations = options.locations ?? [];
  const districts = Array.from(
    new Set(
      locations
        .filter((l) => l.city === filters.city && l.district)
        .map((l) => l.district as string),
    ),
  ).sort((a, b) => a.localeCompare(b, "tr"));
  const neighborhoods = Array.from(
    new Set(
      locations
        .filter(
          (l) => l.city === filters.city && l.district === filters.district && l.neighborhood,
        )
        .map((l) => l.neighborhood as string),
    ),
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const activeCount =
    (filters.serviceSlugs?.length ?? 0) +
    (filters.workingTypeSlugs?.length ?? 0) +
    (filters.skillSlugs?.length ?? 0) +
    (filters.city ? 1 : 0) +
    (filters.district ? 1 : 0) +
    (filters.neighborhood ? 1 : 0) +
    (filters.minExperience ? 1 : 0);

  return (
    <main className="pb-12">
      <Hero>
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
              <ShieldCheck className="size-3.5" aria-hidden />
              Kimlik ve referans kontrolünden geçmiş adaylar
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Bakıcı <span className="text-brand">adaylarını</span> keşfedin
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Tüm sonuçlar veritabanındaki onaylı ve yayında olan adaylardan gelir. Şehir, hizmet
              alanı, çalışma şekli ve deneyime göre filtreleyerek ailenize en uygun adayı bulun.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Yayındaki aday", value: results.data?.total ?? "—" },
                { label: "Şehir", value: options.cities.length || "—" },
                { label: "Hizmet alanı", value: options.services.length || "—" },
              ].map((s, i) => (
                <StatCard key={s.label} value={String(s.value)} label={s.label} delay={i * 120} />
              ))}
            </div>

          </div>
        </div>
      </Hero>

      <div className="container-page">


      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Filtreler</h2>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={() => setFilters({ page: 1, pageSize: 12 })}
                className="text-xs font-medium text-brand-strong hover:underline"
              >
                Temizle ({activeCount})
              </button>
            ) : null}
          </div>

          <FilterGroup title="Hizmet">
            {options.services.map((s) => (
              <CheckRow
                key={s.id}
                id={`svc-${s.slug}`}
                label={s.name}
                checked={filters.serviceSlugs?.includes(s.slug) ?? false}
                onChange={() => toggle("serviceSlugs", s.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Çalışma Şekli">
            {options.workingTypes.map((w) => (
              <CheckRow
                key={w.id}
                id={`wt-${w.slug}`}
                label={w.name}
                checked={filters.workingTypeSlugs?.includes(w.slug) ?? false}
                onChange={() => toggle("workingTypeSlugs", w.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="İl / İlçe / Mahalle">
            {options.cities.length ? (
              <div className="space-y-2">
                <select
                  value={filters.city ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      city: e.target.value || undefined,
                      district: undefined,
                      neighborhood: undefined,
                      page: 1,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="">Tüm iller</option>
                  {options.cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.district ?? ""}
                  disabled={!filters.city || districts.length === 0}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      district: e.target.value || undefined,
                      neighborhood: undefined,
                      page: 1,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none disabled:opacity-50"
                >
                  <option value="">Tüm ilçeler</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.neighborhood ?? ""}
                  disabled={!filters.district || neighborhoods.length === 0}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      neighborhood: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none disabled:opacity-50"
                >
                  <option value="">Tüm mahalleler</option>
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Henüz konum verisi yok.</p>
            )}
          </FilterGroup>

          <FilterGroup title="Deneyim">
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_STEPS.map((y) => {
                const active = (filters.minExperience ?? 0) === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() =>
                      setFilters((p) => ({ ...p, minExperience: y || undefined, page: 1 }))
                    }
                    className={
                      active
                        ? "rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-strong ring-1 ring-brand"
                        : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-brand hover:text-brand-strong"
                    }
                  >
                    {y === 0 ? "Tümü" : `${y}+ yıl`}
                  </button>
                );
              })}
            </div>
          </FilterGroup>
        </aside>

        <section>
          {results.isPending ? (
            <p className="text-sm text-muted-foreground">Adaylar yükleniyor…</p>
          ) : results.isError ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Şu anda veriler yüklenemiyor. Lütfen tekrar deneyin.
              </p>
              <Button3D className="mt-4" onClick={() => results.refetch()}>
                Tekrar dene
              </Button3D>
            </div>
          ) : results.data.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <h2 className="font-display text-lg font-semibold">Sonuç bulunamadı</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Seçtiğiniz kriterlere uyan yayında bir aday bulunmuyor.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.data.total}</span> aday
                bulundu
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.data.items.map((c) => (
                  <CaregiverCard key={c.id} caregiver={c} />
                ))}
              </div>
            </>
          )}
        </section>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-border pt-5 first-of-type:border-0">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-foreground">
        {label}
      </Label>
    </div>
  );
}
