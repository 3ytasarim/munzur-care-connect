import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/brand-mark";
import { useSiteSettings } from "@/lib/site-settings";

export function SiteFooter() {
  const { settings, contact } = useSiteSettings();

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Ailelerin güvenle bakım desteği bulabilmesi için titizlikle incelenen bakıcı adayları.
          </p>
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

        <div className="space-y-2 text-sm">
          <h3 className="text-sm font-semibold text-foreground">İletişim</h3>
          {contact.phone ? <p className="text-muted-foreground">{contact.phone}</p> : null}
          {contact.email ? <p className="text-muted-foreground">{contact.email}</p> : null}
          {contact.address ? <p className="text-muted-foreground">{contact.address}</p> : null}
          {!contact.phone && !contact.email && !contact.address ? (
            <p className="text-muted-foreground">
              İletişim bilgileri yönetim panelinden tanımlanabilir.
            </p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-border py-5">
        <p className="container-page text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings["company_name"] || "MunzurDestek"}. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
