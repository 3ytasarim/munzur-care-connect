import { Link } from "@tanstack/react-router";
import { Menu, Phone, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { RegisterDialog } from "@/components/register-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/session";
import { useSiteSettings } from "@/lib/site-settings";

const NAV = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/bakicilar", label: "Bakıcı Ara" },
] as const;

export function SiteHeader() {
  const { contact } = useSiteSettings();
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {contact.phone ? (
        <div className="hidden bg-foreground text-background md:block">
          <div className="container-page flex h-9 items-center justify-between text-xs">
            <p className="opacity-80">Onaylı ve referans kontrolü yapılmış bakım adayları</p>
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80"
            >
              <Phone className="size-3.5" aria-hidden />
              {contact.phone}
            </a>
          </div>
        </div>
      ) : null}

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-card/80 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            : "border-transparent bg-card/60 backdrop-blur"
        }`}
      >
        <div
          className={`container-page flex items-center justify-between gap-6 transition-all duration-300 ${
            scrolled ? "h-14" : "h-18"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="group relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-brand-strong"
              >
                {item.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-300 group-hover:scale-x-100 group-data-[status=active]:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link to="/panel">Panelim</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link to="/giris">Giriş Yap</Link>
              </Button>
            )}

            <Button
              size="sm"
              className="hover-lift hidden sm:inline-flex"
              onClick={() => setRegisterOpen(true)}
            >
              <UserPlus className="size-4" aria-hidden />
              Aday Ol
            </Button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="md:hidden" aria-label="Menü">
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menü</SheetTitle>
                <div className="flex flex-col gap-1 p-6 pt-10">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-brand-soft data-[status=active]:bg-brand-soft data-[status=active]:text-brand-strong"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to={user ? "/panel" : "/giris"}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-brand-soft"
                  >
                    {user ? "Panelim" : "Giriş Yap"}
                  </Link>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setMenuOpen(false);
                      setRegisterOpen(true);
                    }}
                  >
                    <UserPlus className="size-4" aria-hidden />
                    Aday Ol
                  </Button>
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="mt-4 inline-flex items-center gap-2 px-3 text-sm font-medium text-muted-foreground"
                    >
                      <Phone className="size-4 text-brand" aria-hidden />
                      {contact.phone}
                    </a>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}
