import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, HeartHandshake, Search, ShieldCheck } from "lucide-react";

import { CaregiverCard } from "@/components/caregiver-card";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";


import { Button } from "@/components/ui/button";
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
  const { data: options } = useSuspenseQuery(filterOptionsQuery);
  const featured = useQuery({
    queryKey: ["caregivers", "home-featured"],
    queryFn: () => findCaregivers({ data: { pageSize: 3, page: 1 } }),
  });

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-strong">
              <ShieldCheck className="size-4" aria-hidden />
              Belge ve referans kontrolü yapılmış adaylar
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-foreground sm:text-5xl">
              Ailenize <span className="text-brand">güvenle</span> bakım desteği
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Yaşlı, bebek, çocuk ve hasta bakımı için deneyimli adayları inceleyin; size uygun
              olanla doğrudan iletişime geçin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/bakicilar">
                  <Search className="size-4" aria-hidden />
                  Bakıcı Ara
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/bakicilar" search={{}}>
                  Hizmetleri İncele
                </Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                { label: "Hizmet alanı", value: options.services.length },
                { label: "Çalışma şekli", value: options.workingTypes.length },
                { label: "Uzmanlık", value: options.skills.length },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                  <dd className="font-display text-2xl font-bold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 size-24 rounded-2xl bg-highlight/70" aria-hidden />
            <div className="relative rounded-2xl border border-border bg-background p-8 shadow-soft">
              <h2 className="font-display text-lg font-semibold">Nasıl çalışır?</h2>
              <ol className="mt-6 space-y-6">
                {[
                  {
                    icon: Search,
                    title: "Filtreleyin",
                    text: "Hizmet, çalışma şekli, şehir ve deneyime göre arayın.",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Profili inceleyin",
                    text: "Yalnızca ekibimiz tarafından onaylanan adaylar yayınlanır.",
                  },
                  {
                    icon: HeartHandshake,
                    title: "İletişime geçin",
                    text: "Aday kodu ile WhatsApp üzerinden hızlıca bilgi alın.",
                  },
                ].map((step) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                      <step.icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
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
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 70} className="h-full">
              <Link
                to="/bakicilar"
                className="group hover-lift flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-card hover:border-brand"
              >
                <span className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-strong transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <ServiceIcon slug={s.slug} className="size-5" />
                  </span>
                  <span className="font-display text-base font-semibold text-foreground">{s.name}</span>
                </span>
                <span className="mt-4 text-sm font-medium text-brand-strong">
                  Adayları gör
                  <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
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
          <Button asChild variant="outline">
            <Link to="/bakicilar">Tümünü gör</Link>
          </Button>
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
