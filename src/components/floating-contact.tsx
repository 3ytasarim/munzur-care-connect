import { MessageCircle, Phone } from "lucide-react";

import { buildWhatsappLink, useSiteSettings } from "@/lib/site-settings";

/** Sticky right-edge quick contact buttons (phone + WhatsApp). */
export function FloatingContact() {
  const { contact } = useSiteSettings();
  const tel = (contact.phone || "").replace(/[^\d+]/g, "");
  const wa = buildWhatsappLink(
    contact.whatsapp || contact.phone || "",
    "Merhaba, MunzurDestek üzerinden bilgi almak istiyorum.",
  );

  if (!tel && !wa) return null;

  return (
    <div className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2">
      {tel ? (
        <a
          href={`tel:${tel}`}
          aria-label="Telefon ile ara"
          className="group flex items-center gap-2 rounded-l-xl bg-brand py-3 pl-3 pr-3 text-brand-foreground shadow-lg transition-all duration-300 hover:pr-5"
        >
          <Phone className="size-5 shrink-0" aria-hidden />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[9rem] group-hover:opacity-100">
            Hemen Ara
          </span>
        </a>
      ) : null}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yazın"
          className="group flex items-center gap-2 rounded-l-xl bg-brand-strong py-3 pl-3 pr-3 text-brand-foreground shadow-lg transition-all duration-300 hover:pr-5"
        >
          <MessageCircle className="size-5 shrink-0" aria-hidden />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[9rem] group-hover:opacity-100">
            WhatsApp
          </span>
        </a>
      ) : null}
    </div>
  );
}
