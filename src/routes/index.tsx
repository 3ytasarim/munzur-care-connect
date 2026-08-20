import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, HeartHandshake, Search, ShieldCheck } from "lucide-react";

import { BlogCard } from "@/components/blog-card";
import { CaregiverCard } from "@/components/caregiver-card";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { getServiceImage } from "@/components/service-image";
import { StarField } from "@/components/star-field";


import { Button3D } from "@/components/ui/button-3d";
import { InfoCard } from "@/components/ui/info-card";
import { StatCard } from "@/components/ui/stat-card";
import FaqSection, { type FaqData } from "@/components/ui/habit-faq-scroller";
import { findCaregivers, getFilterOptions } from "@/lib/caregivers.functions";
import { listBlogPosts } from "@/lib/blog.functions";
import whatsappShareAsset from "@/assets/munzurdestek-whatsapp-share.jpg.asset.json";
import heroMobileImage from "@/assets/hero-mobile-bakici.jpg";

const SITE_ORIGIN = "https://id-preview--e5687aae-da5c-4ed7-bd40-2c5a18d70e10.lovable.app";
const WHATSAPP_SHARE_IMAGE = `${SITE_ORIGIN}${whatsappShareAsset.url}`;

const WHY_CARDS = [
  {
    slug: "yasli-bakimi",
    title: "İncelenmiş Adaylar",
    text: "Her başvuru ekibimizce tek tek incelenir; belge ve referans kontrolü yapılmadan hiçbir profil yayına alınmaz.",
  },
  {
    slug: "bebek-bakimi",
    title: "Aday Kodu ile Takip",
    text: "Her adaya MD-1001 gibi benzersiz bir kod verilir; görüşmelerinizi bu kodla hızlı ve karışıklıksız yürütürsünüz.",
  },
  {
    slug: "hasta-bakimi",
    title: "Doğru Eşleşme",
    text: "Hizmet türü, çalışma şekli, şehir ve deneyim filtreleriyle ailenizin ihtiyacına en uygun adayı kolayca bulun.",
  },
  {
    slug: "refakatci",
    title: "Hızlı Geri Dönüş",
    text: "Geri arama talebinizi bırakın; ekibimiz kısa sürede sizi arayarak uygun adayları birlikte değerlendirsin.",
  },
  {
    slug: "ev-isleri",
    title: "Geniş Hizmet Yelpazesi",
    text: "Yaşlı, bebek, çocuk ve hasta bakımından ev yardımcılığı ve refakatçiliğe kadar tüm bakım ihtiyaçları tek yerde.",
  },
  {
    slug: "cocuk-bakimi",
    title: "Şeffaf Süreç",
    text: "Adayın deneyimi, uzmanlıkları ve ücret beklentisi profilde açıkça görünür; sürpriz olmadan karar verirsiniz.",
  },
];


const FAQ_DATA: FaqData = {
  mainTitle: "Sıkça Sorulan Sorular",
  mainSubtitle:
    "MunzurDestek hakkında en çok merak edilenleri derledik. Kartların üzerine gelerek akışı durdurabilirsiniz.",
  rows: [
    {
      id: "row-1",
      speed: "48s",
      direction: "left",
      faqItems: [
        {
          id: "f1",
          question: "MunzurDestek'i neden tercih etmeliyim?",
          answer:
            "Tüm adaylar başvuru sonrası ekibimiz tarafından incelenir; yalnızca onaylanan profiller sitede yayınlanır.",
        },
        {
          id: "f2",
          question: "Bakıcılar sizin çalışanınız mı?",
          answer:
            "Hayır. MunzurDestek, aileler ile bakım desteği veren adayları buluşturan bir platformdur.",
        },
        {
          id: "f3",
          question: "Aradığım bakıcıyı nasıl bulabilirim?",
          answer:
            "Hizmet türü, çalışma şekli ve şehir filtreleriyle adayları listeleyip profil detaylarını inceleyebilirsiniz.",
        },
        {
          id: "f4",
          question: "Aday olmak ücretli mi?",
          answer:
            "Aday kaydı ücretsizdir. Formu doldurup onay sürecini tamamladığınızda profiliniz yayına alınır.",
        },
      ],
    },
    {
      id: "row-2",
      speed: "56s",
      direction: "right",
      faqItems: [
        {
          id: "f5",
          question: "Bakıcı maaşları ne kadar?",
          answer:
            "Ücretler hizmet türü, deneyim ve çalışma şekline göre değişir; adayın profilinde beklentisini görebilirsiniz.",
        },
        {
          id: "f6",
          question: "Hangi alanlarda yardımcı bulabilirim?",
          answer:
            "Yaşlı bakımı, bebek ve çocuk bakımı, hasta refakati, ev yardımcısı ve temizlik desteği bulabilirsiniz.",
        },
        {
          id: "f7",
          question: "Bakıcı seçerken güveni nasıl sağlarım?",
          answer:
            "Referansları isteyin, tanışma görüşmesi yapın ve profildeki belge ile deneyim bilgilerini kontrol edin.",
        },
        {
          id: "f8",
          question: "Adaylarla nasıl iletişime geçerim?",
          answer:
            "Profil sayfasındaki iletişim adımlarını izleyerek ekibimiz üzerinden hızlıca görüşme planlayabilirsiniz.",
        },
      ],
    },
  ],
};


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
      { property: "og:url", content: SITE_ORIGIN },
      { property: "og:image", content: WHATSAPP_SHARE_IMAGE },
      { property: "og:image:secure_url", content: WHATSAPP_SHARE_IMAGE },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "MunzurDestek güvenilir bakıcı ve bakım hizmetleri" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: WHATSAPP_SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(filterOptionsQuery),
  component: Index,
});

const steps = [
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
];

function StepsFlow() {
  return (
    <ol className="relative mt-7 space-y-1">
      {/* animated connecting line */}
      <span
        className="pointer-events-none absolute left-[27px] top-6 bottom-6 w-px origin-top animate-step-line bg-gradient-to-b from-brand via-highlight to-transparent"
        aria-hidden
      />
      {/* travelling glow dot */}
      <span
        className="pointer-events-none absolute left-[27px] z-10 size-2 -translate-x-1/2 rounded-full bg-highlight shadow-[0_0_12px_var(--highlight)] animate-step-travel"
        aria-hidden
      />
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="group animate-step-pop relative flex gap-4 rounded-2xl p-3 transition-colors duration-300 hover:bg-brand-soft/60"
          style={{ animationDelay: `${450 + i * 180}ms` }}
        >
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl border border-brand/15 bg-brand-soft text-brand-strong shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-brand/40">
            <span
              className="absolute inset-0 rounded-2xl bg-brand/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <step.icon className="relative size-5" aria-hidden />
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground shadow-sm">
              {i + 1}
            </span>
          </span>
          <div className="pt-0.5">
            <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand-strong">
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

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
        <StarField />
        <div
          className="animate-float-slow pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-float-slow pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-highlight/25 blur-3xl [animation-delay:-3s]"
          aria-hidden
        />
        <div className="container-page relative grid items-center gap-12 pb-14 pt-3 sm:pt-6 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="animate-fade-up mb-5 overflow-hidden rounded-3xl border border-border/60 shadow-soft lg:hidden">
              <img
                src={heroMobileImage}
                alt="Yaşlı bir kadına eşlik eden güler yüzlü bakıcı"
                width={1024}
                height={768}
                className="h-52 w-full object-cover sm:h-64"
              />
            </div>
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
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Hizmet alanı", value: options.services.length },
                { label: "Çalışma şekli", value: options.workingTypes.length },
                { label: "Uzmanlık", value: options.skills.length },
              ].map((s, i) => (
                <StatCard key={s.label} value={String(s.value)} label={s.label} delay={i * 120} />
              ))}
            </div>


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

      {/* Neden MunzurDestek? */}
      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="container-page">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Neden MunzurDestek?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Aileleri doğru bakım desteğiyle buluştururken güven, şeffaflık ve takip edilebilirlik
              önceliğimiz.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 90} className="h-full">
                <InfoCard image={getServiceImage(c.slug)} title={c.title} description={c.text} />
              </Reveal>
            ))}
          </div>
        </div>
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

      {/* Blog */}
      <BlogSection />

      {/* SSS */}
      <section className="relative overflow-hidden border-t border-border bg-secondary/30 py-20">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
        <FaqSection data={FAQ_DATA} />
      </section>

    </main>

  );
}

function BlogSection() {
  const posts = useQuery({ queryKey: ["blog-posts"], queryFn: () => listBlogPosts() });
  const items = posts.data?.items ?? [];
  if (!items.length) return null;

  return (
    <section className="container-page pb-20">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-strong">blog</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-foreground">Bakıcı bulma rehberi</h2>
        </div>
        <Link
          to="/blog"
          className="rounded-full border border-brand px-5 py-2 text-sm font-medium text-brand-strong transition-colors hover:bg-brand hover:text-brand-foreground"
        >
          Tüm yazılar
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map((p, i) => (
          <Reveal key={p.slug} delay={i * 90} className="h-full">
            <BlogCard post={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
