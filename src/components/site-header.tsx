import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/site-settings";

const NAV = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/bakicilar", label: "Bakıcı Ara" },
] as const;

export function SiteHeader() {
  const { contact } = useSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-brand-soft data-[status=active]:text-brand-strong"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {contact.phone ? (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:flex"
            >
              <Phone className="size-4 text-brand" />
              {contact.phone}
            </a>
          ) : null}
          <Button asChild size="sm">
            <Link to="/bakicilar">Bakıcı Ara</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
