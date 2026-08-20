import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Music2,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { useSiteSettings } from "@/lib/site-settings";

export function SiteFooter() {
  const { settings, contact } = useSiteSettings();

  const socials = [
    { href: contact.instagramUrl, label: "Instagram", Icon: Instagram },
    { href: contact.facebookUrl, label: "Facebook", Icon: Facebook },
    { href: contact.linkedinUrl, label: "LinkedIn", Icon: Linkedin },
    { href: contact.youtubeUrl, label: "YouTube", Icon: Youtube },
    { href: contact.twitterUrl, label: "X", Icon: Twitter },
    { href: contact.tiktokUrl, label: "TikTok", Icon: Music2 },
  ].filter((s) => Boolean(s.href && s.href.trim()));

  const tel = (contact.phone || "").replace(/[^\d+]/g, "");
  const mapSrc = contact.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&hl=tr&z=15&output=embed`
    : null;

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-3 py-14 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex flex-col items-start">
            <BrandMark className="h-12" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Ailelerin güvenle bakım desteği bulabilmesi için titizlikle incelenen bakıcı adayları.
            </p>
          </div>
          {socials.length ? (
            <ul className="flex flex-wrap gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex size-10 items-center justify-center rounded-xl border border-brand/25 bg-brand-soft text-brand-strong transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:text-brand-foreground"
                  >
                    <Icon className="size-5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="space-y-2 text-sm">
          <h3 className="text-sm font-semibold text-foreground">Keşfet</h3>
          <Link to="/blog" className="block text-muted-foreground hover:text-brand-strong">
            Blog
          </Link>
          <Link to="/bakicilar" className="block text-muted-foreground hover:text-brand-strong">
            Bakıcı Ara
          </Link>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="text-sm font-semibold text-foreground">İletişim</h3>
          {contact.phone ? (
            <a
              href={`tel:${tel}`}
              className="flex items-start gap-2 text-muted-foreground hover:text-brand-strong"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {contact.phone}
            </a>
          ) : null}
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-start gap-2 text-muted-foreground hover:text-brand-strong"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {contact.email}
            </a>
          ) : null}
          {contact.address ? (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {contact.address}
            </p>
          ) : null}
          {!contact.phone && !contact.email && !contact.address ? (
            <p className="text-muted-foreground">
              İletişim bilgileri yönetim panelinden tanımlanabilir.
            </p>
          ) : null}
        </div>

        {mapSrc ? (
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={mapSrc}
              title="MunzurDestek ofis konumu"
              className="h-48 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : null}
      </div>
      <div className="border-t border-border py-5">
        <p className="container-page text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings["company_name"] || "MunzurDestek"}. Tüm hakları
          saklıdır.
        </p>
      </div>
    </footer>
  );
}
