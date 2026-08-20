import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { Button3D } from "@/components/ui/button-3d";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageField } from "@/components/admin/image-field";
import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";

type Settings = Awaited<ReturnType<typeof adminGetSettings>>;

const SETTING_FIELDS: { key: string; label: string; placeholder?: string }[] = [
  { key: "site_name", label: "Site adı" },
  { key: "company_name", label: "Firma adı" },
  { key: "primary_color", label: "Ana renk", placeholder: "#57B614" },
  { key: "secondary_color", label: "İkincil renk", placeholder: "#FFDE58" },
  { key: "default_currency", label: "Para birimi" },
];

const LOGO_FIELDS: {
  key: string;
  label: string;
  hint: string;
  maxWidth: number;
  maxHeight: number;
  minWidth?: number;
  minHeight?: number;
  dark?: boolean;
}[] = [
  {
    key: "logo_url",
    label: "Logo (açık tema)",
    hint: "Sitede 240 × 64 px görünür. Net durması için 960 × 256 px (veya SVG), şeffaf arka planlı yükleyin.",
    maxWidth: 960,
    maxHeight: 256,
    minWidth: 700,
    minHeight: 190,
  },
  {
    key: "dark_logo_url",
    label: "Logo (koyu tema)",
    hint: "Sitede 240 × 64 px görünür. 960 × 256 px açık renkli/beyaz versiyon (veya SVG) yükleyin.",
    maxWidth: 960,
    maxHeight: 256,
    minWidth: 700,
    minHeight: 190,
    dark: true,
  },
  {
    key: "mobile_logo_url",
    label: "Mobil / kare logo",
    hint: "Sitede 48 × 48 px görünür. 384 × 384 px kare amblem (veya SVG) yükleyin.",
    maxWidth: 384,
    maxHeight: 384,
    minWidth: 192,
    minHeight: 192,
  },
  {
    key: "favicon_url",
    label: "Favicon",
    hint: "256 × 256 px kare PNG yükleyin; tarayıcı sekmesinde ve paylaşımlarda kullanılır.",
    maxWidth: 256,
    maxHeight: 256,
    minWidth: 128,
    minHeight: 128,
  },
];

const CONTACT_FIELDS: { key: keyof Settings["contact"]; label: string }[] = [
  { key: "phone", label: "Telefon" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "E-posta" },
  { key: "address", label: "Adres" },
  { key: "instagramUrl", label: "Instagram" },
  { key: "facebookUrl", label: "Facebook" },
  { key: "linkedinUrl", label: "LinkedIn" },
  { key: "youtubeUrl", label: "YouTube" },
  { key: "twitterUrl", label: "X (Twitter)" },
  { key: "tiktokUrl", label: "TikTok" },
];

const BANK_FIELDS: { key: keyof Settings["bank"]; label: string }[] = [
  { key: "bankName", label: "Banka" },
  { key: "accountHolder", label: "Hesap sahibi" },
  { key: "iban", label: "IBAN" },
  { key: "paymentAmount", label: "Ödeme tutarı" },
  { key: "currency", label: "Para birimi" },
  { key: "paymentDescriptionTemplate", label: "Açıklama şablonu" },
];

export function SettingsPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-settings"], queryFn: () => adminGetSettings() });
  const [form, setForm] = useState<Settings | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const save = useMutation({
    mutationFn: (data: Settings) => adminSaveSettings({ data }),
    onSuccess: async () => {
      setNotice("Ayarlar kaydedildi.");
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: () => setNotice("Ayarlar kaydedilemedi."),
  });

  if (query.isLoading || !form) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setNotice(null);
        save.mutate(form);
      }}
      className="space-y-6"
    >
      <Card
        title="Logolar & favicon"
        description="Görselleri bilgisayarınızdan yükleyin; otomatik olarak önerilen ebata küçültülür."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {LOGO_FIELDS.map((f) => (
            <ImageField
              key={f.key}
              label={f.label}
              hint={f.hint}
              maxWidth={f.maxWidth}
              maxHeight={f.maxHeight}
              minWidth={f.minWidth}
              minHeight={f.minHeight}
              dark={f.dark ?? false}
              value={form.settings[f.key] ?? ""}
              onChange={(next) =>
                setForm({ ...form, settings: { ...form.settings, [f.key]: next } })
              }
            />
          ))}
        </div>
      </Card>

      <Card title="Genel & marka" description="Logo ve site bilgileri kod değişmeden güncellenir.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SETTING_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`s-${f.key}`}>{f.label}</Label>
              <Input
                id={`s-${f.key}`}
                value={form.settings[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) =>
                  setForm({ ...form, settings: { ...form.settings, [f.key]: e.target.value } })
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="İletişim" description="Sitenin altbilgi ve WhatsApp bağlantılarında kullanılır.">
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`c-${f.key}`}>{f.label}</Label>
              <Input
                id={`c-${f.key}`}
                value={form.contact[f.key] ?? ""}
                onChange={(e) =>
                  setForm({ ...form, contact: { ...form.contact, [f.key]: e.target.value } })
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Banka / ödeme" description="Aday ödeme bilgileri.">
        <div className="grid gap-4 sm:grid-cols-2">
          {BANK_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`b-${f.key}`}>{f.label}</Label>
              <Input
                id={`b-${f.key}`}
                value={form.bank[f.key] ?? ""}
                onChange={(e) =>
                  setForm({ ...form, bank: { ...form.bank, [f.key]: e.target.value } })
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button3D type="submit" disabled={save.isPending}>
          <Save className="mr-1.5 size-4" /> {save.isPending ? "Kaydediliyor…" : "Ayarları Kaydet"}
        </Button3D>
        {notice ? <span className="text-sm text-muted-foreground">{notice}</span> : null}
      </div>
    </form>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
