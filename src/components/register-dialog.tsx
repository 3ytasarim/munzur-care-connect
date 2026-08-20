import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { PhotoCapture } from "@/components/photo-capture";
import { Button3D } from "@/components/ui/button-3d";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerSchema } from "@/lib/auth-schemas";
import { registerCaregiver } from "@/lib/auth.functions";
import { getFilterOptions } from "@/lib/caregivers.functions";

const filterOptionsQuery = queryOptions({
  queryKey: ["filter-options"],
  queryFn: () => getFilterOptions(),
  staleTime: 5 * 60 * 1000,
});

const STEPS = ["Kişisel", "Çalışma", "Fotoğraf"] as const;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  city: string;
  district: string;
  yearsOfExperience: string;
  about: string;
};

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  city: "",
  district: "",
  yearsOfExperience: "0",
  about: "",
};

export function RegisterDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-h-[94vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="grid max-h-[94vh] md:grid-cols-[260px_1fr]">
          {/* Brand rail */}
          <aside className="relative hidden overflow-hidden bg-brand p-7 md:block">
            <div
              className="animate-float-slow pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-highlight/40 blur-2xl"
              aria-hidden
            />
            <div
              className="animate-float-slow pointer-events-none absolute -bottom-16 -left-10 size-44 rounded-full bg-background/15 blur-2xl [animation-delay:-3s]"
              aria-hidden
            />
            <div className="relative flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/15 px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                <Sparkles className="size-3.5" aria-hidden /> Ücretsiz kayıt
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-primary-foreground">
                Aday havuzuna katılın
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                3 kısa adımda başvurun; ekibimiz inceledikten sonra profiliniz yayına alınır.
              </p>
              <ul className="mt-auto space-y-3 pt-8">
                {[
                  "Belge ve referans kontrolü",
                  "Size özel aday kodu",
                  "Ailelerle doğrudan iletişim",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-primary-foreground/90"
                  >
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex max-h-[94vh] min-h-0 flex-col">
            <DialogHeader className="border-b border-border px-6 py-5 text-left">
              <DialogTitle className="font-display text-xl">Aday Kaydı</DialogTitle>
              <DialogDescription>
                Bilgileriniz yalnızca başvuru değerlendirmesi için kullanılır.
              </DialogDescription>
            </DialogHeader>
            <RegisterForm onDone={() => setOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export function RegisterForm({ onDone }: { onDone?: () => void }) {
  const options = useQuery(filterOptionsQuery);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const submit = useServerFn(registerCaregiver);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>(EMPTY);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [workingTypeIds, setWorkingTypeIds] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [kvkk, setKvkk] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (values.firstName.trim().length < 2 || values.lastName.trim().length < 2)
        return "Ad ve soyadınızı girin.";
      if (!/^\S+@\S+\.\S+$/.test(values.email)) return "Geçerli bir e-posta adresi girin.";
      if (values.phone.trim().length < 10) return "Telefon numaranızı girin.";
      if (values.password.length < 8) return "Şifre en az 8 karakter olmalıdır.";
      if (values.password !== values.passwordConfirm) return "Şifreler eşleşmiyor.";
    }
    if (index === 1) {
      if (values.city.trim().length < 2) return "Şehrinizi girin.";
      if (serviceIds.length === 0) return "En az bir hizmet alanı seçin.";
    }
    return null;
  }

  function next() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({
      ...values,
      yearsOfExperience: values.yearsOfExperience || 0,
      serviceIds,
      workingTypeIds,
      kvkkAccepted: kvkk,
      photoDataUrl: photo ?? undefined,
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
      toast.success("Başvurunuz alındı.");
      setSubmittedCode(result.candidateCode);
    } catch {
      setError("Kayıt tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  const chip = (active: boolean) =>
    active
      ? "rounded-full border border-brand bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-strong transition-all"
      : "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-brand hover:text-foreground";

  if (submittedCode) {
    return (
      <div className="animate-fade-up flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          <Check className="size-8" aria-hidden />
        </span>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-foreground">
            Göstermiş olduğunuz ilgi için teşekkür ederiz
          </h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Başvurunuz bize ulaştı. Ekibimiz gerekli incelemeleri tamamladıktan sonra profiliniz
            panelde aktif hâle gelecek. Aktif olduğunuzda{" "}
            <strong className="text-foreground">“Aktif Oldunuz”</strong> bilgilendirme e-postasını
            kayıt sırasında verdiğiniz adrese göndereceğiz; o andan itibaren bakıcı listesinde
            görüneceksiniz.
          </p>
        </div>
        <p className="rounded-full border border-brand bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-strong">
          Aday kodunuz: {submittedCode}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button3D
            type="button"
            onClick={() => {
              onDone?.();
              navigate({ to: "/panel" });
            }}
          >
            Panelime git
            <ArrowRight className="size-4" aria-hidden />
          </Button3D>
          <Button3D type="button" variant="outline" onClick={() => onDone?.()}>
            Kapat
          </Button3D>
        </div>
      </div>
    );
  }

  return (

    <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
      {/* Step indicator */}
      <ol className="flex items-center gap-2 border-b border-border bg-muted/40 px-6 py-4">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step
                  ? "bg-brand text-primary-foreground"
                  : i === step
                    ? "bg-brand-soft text-brand-strong ring-2 ring-brand"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-border" aria-hidden /> : null}
          </li>
        ))}
      </ol>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">


      {step === 0 ? (
        <div key="step-0" className="animate-fade-up grid gap-4 sm:grid-cols-2">
          <Field label="Ad" id="firstName">
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              autoComplete="given-name"
            />
          </Field>
          <Field label="Soyad" id="lastName">
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              autoComplete="family-name"
            />
          </Field>
          <Field label="E-posta" id="email">
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Telefon" id="phone">
            <Input
              id="phone"
              inputMode="tel"
              placeholder="05XX XXX XX XX"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
            />
          </Field>
          <Field label="Şifre" id="password">
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Şifre (tekrar)" id="passwordConfirm">
            <Input
              id="passwordConfirm"
              type="password"
              value={values.passwordConfirm}
              onChange={(e) => set("passwordConfirm", e.target.value)}
              autoComplete="new-password"
            />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div key="step-1" className="animate-fade-up space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Şehir" id="city">
              <Input
                id="city"
                list="register-city-options"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <datalist id="register-city-options">
                {(options.data?.cities ?? []).map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </Field>
            <Field label="İlçe" id="district">
              <Input
                id="district"
                value={values.district}
                onChange={(e) => set("district", e.target.value)}
              />
            </Field>
            <Field label="Deneyim (yıl)" id="yearsOfExperience">
              <Input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={60}
                value={values.yearsOfExperience}
                onChange={(e) => set("yearsOfExperience", e.target.value)}
              />
            </Field>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Hizmet Alanları</legend>
            <div className="flex flex-wrap gap-2">
              {(options.data?.services ?? []).map((service) => (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={serviceIds.includes(service.id)}
                  onClick={() => toggle(serviceIds, setServiceIds, service.id)}
                  className={chip(serviceIds.includes(service.id))}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Çalışma Şekli</legend>
            <div className="flex flex-wrap gap-2">
              {(options.data?.workingTypes ?? []).map((type) => (
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={workingTypeIds.includes(type.id)}
                  onClick={() => toggle(workingTypeIds, setWorkingTypeIds, type.id)}
                  className={chip(workingTypeIds.includes(type.id))}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label="Kendinizden kısaca bahsedin" id="about">
            <Textarea
              id="about"
              rows={4}
              maxLength={2000}
              value={values.about}
              onChange={(e) => set("about", e.target.value)}
            />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div key="step-2" className="animate-fade-up space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Profil fotoğrafı</p>
            <p className="text-sm text-muted-foreground">
              Telefonunuzdan anlık fotoğraf çekebilir veya galerinizden bir görsel seçebilirsiniz.
            </p>
          </div>
          <PhotoCapture value={photo} onChange={setPhoto} />

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <Checkbox
              id="kvkk"
              checked={kvkk}
              onCheckedChange={(value) => setKvkk(value === true)}
            />
            <Label htmlFor="kvkk" className="text-sm font-normal leading-relaxed text-muted-foreground">
              Kişisel verilerimin başvuru değerlendirmesi amacıyla işlenmesini kabul ediyorum.
            </Label>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="animate-fade-up rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">

        <p className="text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link to="/giris" className="font-medium text-brand-strong hover:underline">
            Giriş yapın
          </Link>
        </p>
        <div className="flex gap-2">
          {step > 0 ? (
            <Button3D type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" aria-hidden />
              Geri
            </Button3D>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button3D type="button" onClick={next}>
              Devam
              <ArrowRight className="size-4" aria-hidden />
            </Button3D>
          ) : (
            <Button3D type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {pending ? "Kaydınız oluşturuluyor..." : "Kaydı Tamamla"}
            </Button3D>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
