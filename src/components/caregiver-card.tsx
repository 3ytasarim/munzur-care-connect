import { BadgeCheck, MapPin, Star, User } from "lucide-react";
import { formatExperience } from "@/lib/utils";

import { Button3D } from "@/components/ui/button-3d";
import type { CaregiverCard as CaregiverCardData } from "@/db/queries.server";
import { buildWhatsappLink, useSiteSettings } from "@/lib/site-settings";

export function CaregiverCard({ caregiver }: { caregiver: CaregiverCardData }) {
  const { contact, settings } = useSiteSettings();
  const waLink = buildWhatsappLink(
    contact.whatsapp,
    `Merhaba, ${settings["site_name"] || "MunzurDestek"} üzerinden ${caregiver.candidateCode} kodlu aday hakkında bilgi almak istiyorum.`,
  );

  return (
    <article className="hover-lift group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card hover:border-brand/40">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {caregiver.primaryPhotoUrl ? (
          <img
            src={caregiver.primaryPhotoUrl}
            alt={`${caregiver.displayName} profil fotoğrafı`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <User className="size-12" aria-hidden />
          </div>
        )}
        {caregiver.featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            <Star className="size-3.5" aria-hidden /> Öne Çıkan
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {caregiver.displayName}
            </h3>
            <p className="text-xs font-medium text-muted-foreground">{caregiver.candidateCode}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong">
            <BadgeCheck className="size-3.5" aria-hidden /> Onaylı
          </span>
        </div>

        {caregiver.city ? (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span className="min-w-0">
              {[caregiver.city, caregiver.district, caregiver.neighborhood]
                .filter(Boolean)
                .join(" / ")}
            </span>
          </p>
        ) : null}

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatExperience(caregiver.yearsOfExperience)}</span> yıl
          deneyim
        </p>

        {caregiver.services.length ||
        caregiver.workingTypes.length ||
        caregiver.skills.length ? (
          <div className="space-y-2 border-t border-border pt-3">
            {caregiver.services.length ? (
              <CriteriaRow title="Hizmet alanları">
                {caregiver.services.map((s) => (
                  <li
                    key={s}
                    className="rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand-strong"
                  >
                    {s}
                  </li>
                ))}
              </CriteriaRow>
            ) : null}
            {caregiver.workingTypes.length ? (
              <CriteriaRow title="Çalışma şekli">
                {caregiver.workingTypes.map((w) => (
                  <li
                    key={w}
                    className="rounded-md bg-highlight-soft px-2 py-1 text-xs font-medium text-foreground"
                  >
                    {w}
                  </li>
                ))}
              </CriteriaRow>
            ) : null}
            {caregiver.skills.length ? (
              <CriteriaRow title="Uzmanlıklar">
                {caregiver.skills.map((k) => (
                  <li
                    key={k}
                    className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {k}
                  </li>
                ))}
              </CriteriaRow>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          {waLink ? (
            <Button3D className="w-full" onClick={() => window.open(waLink, "_blank", "noreferrer")}>
              WhatsApp ile Bilgi Al
            </Button3D>
          ) : (
            <Button3D className="w-full" disabled>
              İletişim numarası tanımlanmadı
            </Button3D>
          )}
        </div>
      </div>
    </article>
  );
}

function CriteriaRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="flex flex-wrap gap-1.5">{children}</ul>
    </div>
  );
}
