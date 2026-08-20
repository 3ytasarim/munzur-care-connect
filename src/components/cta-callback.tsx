import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, PhoneCall } from "lucide-react";

import { Button3D } from "@/components/ui/button-3d";
import { submitInquiry } from "@/lib/inquiries.functions";

export function CtaCallback() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const send = useMutation({
    mutationFn: () =>
      submitInquiry({ data: { fullName, phone, source: "CTA_FOOTER" } }),
    onSuccess: () => {
      setDone(true);
      setFullName("");
      setPhone("");
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Gönderilemedi."),
  });

  return (
    <section className="border-t border-border bg-background py-14">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_20px_60px_-30px_rgba(31,41,51,0.35)]">
          <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Sol: marka bloğu */}
            <div className="relative overflow-hidden bg-brand px-8 py-10 md:rounded-r-[3rem]">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
              <h2 className="relative text-2xl font-semibold text-brand-foreground md:text-3xl">
                Bakıcı mı Arıyorsunuz?
              </h2>
              <p className="relative mt-3 max-w-sm text-sm text-brand-foreground/85">
                Aradığınız bakıcıyı bulmak için hemen sizi arayalım. Bilgilerinizi bırakın,
                uzman ekibimiz en kısa sürede dönüş yapsın.
              </p>
              <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-accent/90 px-4 py-2 text-xs font-semibold text-foreground">
                <PhoneCall className="h-4 w-4" />
                Ücretsiz ön görüşme
              </div>
            </div>

            {/* Sağ: form */}
            <div className="flex items-center px-6 py-8 md:px-10">
              {done ? (
                <div className="flex items-center gap-3 text-sm font-medium text-brand">
                  <CheckCircle2 className="h-6 w-6" />
                  Talebiniz alındı. En kısa sürede sizi arayacağız.
                </div>
              ) : (
                <form
                  className="flex w-full flex-col gap-5 md:flex-row md:items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setError(null);
                    if (fullName.trim().length < 2) return setError("Ad soyad giriniz.");
                    if (phone.trim().length < 7) return setError("Telefon numaranızı giriniz.");
                    send.mutate();
                  }}
                >
                  <label className="flex-1">
                    <span className="sr-only">Ad Soyad</span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ad Soyad"
                      maxLength={160}
                      className="w-full border-0 border-b-2 border-border bg-transparent px-1 pb-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="sr-only">Telefon Numaranız</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Telefon Numaranız"
                      inputMode="tel"
                      maxLength={32}
                      className="w-full border-0 border-b-2 border-border bg-transparent px-1 pb-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
                    />
                  </label>
                  <Button3D type="submit" variant="brand" disabled={send.isPending}>
                    {send.isPending ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor
                      </span>
                    ) : (
                      "AJANS HİZMETİ AL"
                    )}
                  </Button3D>
                </form>
              )}
            </div>
          </div>
          {error ? (
            <p className="px-6 pb-5 text-sm font-medium text-destructive md:px-10">{error}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
