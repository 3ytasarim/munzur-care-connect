import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerCaregiver } from "@/lib/auth.functions";
import { registerSchema } from "@/lib/auth-schemas";
import { getFilterOptions } from "@/lib/caregivers.functions";

const filterOptionsQuery = queryOptions({
  queryKey: ["filter-options"],
  queryFn: () => getFilterOptions(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/kayit")({
  loader: ({ context }) => context.queryClient.ensureQueryData(filterOptionsQuery),
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

function RegisterPage() {
  const { data: options } = useSuspenseQuery(filterOptionsQuery);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const submit = useServerFn(registerCaregiver);

  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [workingTypeIds, setWorkingTypeIds] = useState<string[]>([]);
  const [kvkk, setKvkk] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
      passwordConfirm: form.get("passwordConfirm"),
      city: form.get("city"),
      district: form.get("district") ?? "",
      yearsOfExperience: form.get("yearsOfExperience") ?? 0,
      about: form.get("about") ?? "",
      serviceIds,
      workingTypeIds,
      kvkkAccepted: kvkk,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Lütfen formu kontrol edin.");
      return;
    }

    setPending(true);
    try {
      const result = await submit({ data: parsed.data });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await router.invalidate();
      toast.success(`Kaydınız alındı. Aday kodunuz: ${result.candidateCode}`);
      navigate({ to: "/panel" });
    } catch {
      setError("Kayıt tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-page flex-1 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Aday Kaydı</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bilgilerinizi doldurun; başvurunuz ekibimiz tarafından incelendikten sonra yayına alınır.
          </p>

          <form
            className="mt-8 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            onSubmit={onSubmit}
          >
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Kişisel Bilgiler</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" inputMode="tel" placeholder="05XX XXX XX XX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Şifre (tekrar)</Label>
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Çalışma Bilgileri</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input id="city" name="city" list="city-options" required />
                  <datalist id="city-options">
                    {options.cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input id="district" name="district" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Deneyim (yıl)</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    min={0}
                    max={60}
                    defaultValue={0}
                  />
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">Hizmet Alanları</legend>
                <div className="flex flex-wrap gap-2">
                  {options.services.map((service) => {
                    const active = serviceIds.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggle(serviceIds, setServiceIds, service.id)}
                        aria-pressed={active}
                        className={
                          active
                            ? "rounded-full border border-brand bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-strong"
                            : "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
                        }
                      >
                        {service.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">Çalışma Şekli</legend>
                <div className="flex flex-wrap gap-2">
                  {options.workingTypes.map((type) => {
                    const active = workingTypeIds.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggle(workingTypeIds, setWorkingTypeIds, type.id)}
                        aria-pressed={active}
                        className={
                          active
                            ? "rounded-full border border-brand bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-strong"
                            : "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
                        }
                      >
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="about">Kendinizden kısaca bahsedin</Label>
                <Textarea id="about" name="about" rows={4} maxLength={2000} />
              </div>
            </section>

            <div className="flex items-start gap-3">
              <Checkbox
                id="kvkk"
                checked={kvkk}
                onCheckedChange={(value) => setKvkk(value === true)}
              />
              <Label htmlFor="kvkk" className="text-sm font-normal leading-relaxed text-muted-foreground">
                Kişisel verilerimin başvuru değerlendirmesi amacıyla işlenmesini kabul ediyorum.
              </Label>
            </div>

            {error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Kaydınız oluşturuluyor..." : "Kaydı Tamamla"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link to="/giris" className="font-medium text-brand-strong hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
