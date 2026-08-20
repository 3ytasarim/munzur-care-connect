import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, HeartHandshake, Search, ShieldCheck } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { CaregiverCard } from "@/components/caregiver-card";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { getServiceImage } from "@/components/service-image";



import { Button3D } from "@/components/ui/button-3d";
import StatsSection from "@/components/ui/stats";
import { findCaregivers, getFilterOptions } from "@/lib/caregivers.functions";

const filterOptionsQuery = queryOptions({
  queryKey: ["filter-options"],
  queryFn: () => getFilterOptions(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MunzurDestek | Güvenilir Bakıcı ve Bakım Hizmetleri" },
      {
        name: "description",
        content:
          "MunzurDestek; yaşlı, bebek, çocuk ve hasta bakımı için titizlikle incelenmiş, onaylı bakıcı adaylarını ailelerle buluşturur.",
      },
      { property: "og:title", content: "MunzurDestek | Güvenilir Bakıcı ve Bakım Hizmetleri" },
      {
        property: "og:description",
        content: "Onaylı bakıcı adaylarını inceleyin, ailenize uygun desteği güvenle bulun.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(filterOptionsQuery),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { data: options } = useSuspenseQuery(filterOptionsQuery);
  const featured = useQuery({
    queryKey: ["caregivers", "home-featured"],
    queryFn: () => findCaregivers({ data: { pageSize: 3, page: 1 } }),
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div
          className="animate-float-slow pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-float-slow pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-highlight/25 blur-3xl [animation-delay:-3s]"
          aria-hidden
        />
        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-strong">
              <ShieldCheck className="size-4" aria-hidden />
              Belge ve referans kontrolü yapılmış adaylar
            </span>
            <h1 className="animate-fade-up mt-6 font-display text-4xl font-bold leading-[1.1] text-foreground [animation-delay:100ms] sm:text-5xl">
              Ailenize <span className="text-brand">güvenle</span> bakım desteği
            </h1>
            <p className="animate-fade-up mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground [animation-delay:200ms]">
              Yaşlı, bebek, çocuk ve hasta bakımı için deneyimli adayları inceleyin; size uygun
              olanla doğrudan iletişime geçin.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:300ms]">
              <Button3D size="lg" onClick={() => navigate({ to: "/bakicilar" })}>
                <Search className="size-4" aria-hidden />
                Bakıcı Ara
              </Button3D>
              <Button3D
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/bakicilar", search: {} })}
              >
                Hizmetleri İncele
              </Button3D>
            </div>
            <StatsSection
              className="mt-12 max-w-lg"
              stats={[
                { label: "Hizmet alanı", value: options.services.length },
                { label: "Çalışma şekli", value: options.workingTypes.length },
                { label: "Uzmanlık", value: options.skills.length },
              ]}
            />

          </div>

          <div className="animate-fade-up relative [animation-delay:250ms]">
            <div
              className="animate-float-slow absolute -left-6 -top-6 size-24 rounded-2xl bg-highlight/70"
              aria-hidden
            />
            <div
              className="animate-float-slow absolute -bottom-8 -right-6 size-32 rounded-full bg-brand/10 blur-2xl [animation-delay:800ms]"
              aria-hidden
            />

            {/* gradient border shell */}
            <div className="hover-lift group/card relative rounded-3xl bg-gradient-to-br from-brand/40 via-highlight/50 to-brand/20 p-px shadow-soft transition-shadow duration-500 hover:shadow-glow">
              <div className="relative overflow-hidden rounded-3xl bg-background/85 p-8 backdrop-blur-xl">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand/10 blur-3xl transition-opacity duration-500 group-hover/card:opacity-100 opacity-60"
                  aria-hidden
                />

                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-strong">
                      <span className="size-1.5 animate-pulse rounded-full bg-brand" aria-hidden />
                      3 adım
                    </span>
                    <h2 className="font-display mt-3 text-xl font-bold text-foreground">
                      Nasıl çalışır?
                    </h2>
                  </div>
                </div>

                <StepsFlow />
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* Services from the database */}
      <section className="container-page py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-foreground">Bakım hizmetleri</h2>
          <p className="mt-2 text-muted-foreground">
            Hizmet kategorileri yönetim panelinden düzenlenebilir.
          </p>
        </Reveal>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {options.services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 70} className="h-full">
              <Link
                to="/bakicilar"
                className="group hover-lift block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:border-brand"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={getServiceImage(s.slug)}
                    alt={`${s.name} hizmeti`}
                    loading="lazy"
                    width={768}
                    height={576}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span
                    className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent"
                    aria-hidden
                  />
                  <span className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/90 text-brand-strong backdrop-blur">
                      <ServiceIcon slug={s.slug} className="size-4" />
                    </span>
                    <span className="font-display text-base font-semibold text-background drop-shadow">
                      {s.name}
                    </span>
                  </span>
                </span>
                <span className="flex items-center justify-between px-4 py-3 text-sm font-medium text-brand-strong">
                  Adayları gör
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

      </section>


      {/* Featured caregivers straight from Neon */}
      <section className="container-page pb-20">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-foreground">Öne çıkan adaylar</h2>
          <Button3D variant="outline" onClick={() => navigate({ to: "/bakicilar" })}>
            Tümünü gör
          </Button3D>
        </Reveal>

        <div className="mt-8">
          {featured.isPending ? (
            <p className="animate-fade-soft text-sm text-muted-foreground">Adaylar yükleniyor…</p>
          ) : featured.isError ? (
            <p className="text-sm text-muted-foreground">
              Şu anda veriler yüklenemiyor. Lütfen tekrar deneyin.
            </p>
          ) : featured.data.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Henüz yayınlanan aday bulunmuyor. Onaylanan adaylar burada listelenecek.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.items.map((c, i) => (
                <Reveal key={c.id} delay={i * 90} className="h-full">
                  <CaregiverCard caregiver={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
