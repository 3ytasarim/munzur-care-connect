import { Phone } from "lucide-react";

import { buildWhatsappLink, useSiteSettings } from "@/lib/site-settings";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.144 5.835h-.004c-1.586 0-3.15-.424-4.52-1.227l-.325-.193-3.36.882.9-3.28-.212-.332c-.893-1.419-1.365-3.074-1.365-4.773 0-4.954 4.03-8.984 8.985-8.984 2.403 0 4.658.937 6.355 2.634 1.697 1.697 2.634 3.952 2.634 6.355 0 4.955-4.031 8.985-8.986 8.985m7.66-15.835A11.462 11.462 0 0012.001 0C5.375 0 0 5.375 0 12.001c0 2.114.552 4.17 1.6 5.985L0 24l6.164-1.586A11.94 11.94 0 0012 24c6.626 0 12-5.375 12-11.999 0-3.207-1.248-6.218-3.52-8.49" />
    </svg>
  );
}

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
          className="animate-attention group flex items-center gap-2 rounded-l-xl bg-highlight-strong py-3 pl-3 pr-4 text-highlight-foreground shadow-lg transition-all duration-300 hover:pr-5 hover:shadow-glow"
          style={{ animationDelay: "0s" }}
        >
          <Phone className="size-5 shrink-0" aria-hidden />
          <span className="whitespace-nowrap text-sm font-semibold">
            Bizi Arayın
          </span>
        </a>
      ) : null}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yazın"
          className="animate-attention group flex items-center gap-2 rounded-l-xl bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-lg transition-all duration-300 hover:pr-5 hover:shadow-glow"
          style={{ animationDelay: "0.5s" }}
        >
          <WhatsAppIcon className="size-5 shrink-0" aria-hidden />
          <span className="whitespace-nowrap text-sm font-semibold">
            WhatsApp
          </span>
        </a>
      ) : null}
    </div>
  );
}
