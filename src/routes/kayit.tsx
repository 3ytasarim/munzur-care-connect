import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";

import { RegisterDialog } from "@/components/register-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/kayit")({
  head: () => ({
    meta: [
      { title: "Aday Kaydı | MunzurDestek" },
      {
        name: "description",
        content:
          "Bakıcı, hasta refakatçisi veya yaşlı bakım uzmanı olarak MunzurDestek'e ücretsiz aday kaydı oluşturun.",
      },
      { property: "og:title", content: "Aday Kaydı | MunzurDestek" },
      {
        property: "og:description",
        content: "MunzurDestek aday havuzuna katılın, uygun ailelerle eşleşin.",
      },
    ],
  }),
  component: RegisterPage,
});

const HIGHLIGHTS = [
  { icon: BadgeCheck, title: "Ücretsiz başvuru", text: "Kayıt olmak ve profil oluşturmak ücretsizdir." },
  { icon: ShieldCheck, title: "Güvenli inceleme", text: "Bilgileriniz yalnızca değerlendirme için kullanılır." },
  { icon: Clock, title: "Hızlı sonuç", text: "Başvurular genellikle kısa sürede sonuçlanır." },
];

function RegisterPage() {
  const [open, setOpen] = useState(true);

  return (
    <main className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="animate-fade-up font-display text-4xl font-bold text-foreground">
          Aday Kaydı
        </h1>
        <p className="animate-fade-up mt-3 text-muted-foreground [animation-delay:100ms]">
          Formu doldurun, profiliniz ekibimiz tarafından incelendikten sonra yayına alınsın.
        </p>
        <div className="animate-fade-up mt-8 [animation-delay:200ms]">
          <Button size="lg" className="hover-lift" onClick={() => setOpen(true)}>
            <UserPlus className="size-4" aria-hidden />
            Kayıt Formunu Aç
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Hesabınız var mı?{" "}
          <Link to="/giris" className="font-medium text-brand-strong hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>

      <ul className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((item, i) => (
          <li
            key={item.title}
            className="hover-lift animate-fade-up rounded-xl border border-border bg-card p-6 shadow-card"
            style={{ animationDelay: `${250 + i * 90}ms` }}
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
              <item.icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-base font-semibold text-foreground">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </li>
        ))}
      </ul>

      <RegisterDialog open={open} onOpenChange={setOpen} />
    </main>
  );
}
