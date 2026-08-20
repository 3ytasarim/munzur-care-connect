import { Link } from "@tanstack/react-router";
import { Home, Menu, Phone, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { RegisterDialog } from "@/components/register-dialog";
import { Button } from "@/components/ui/button";
import { NavBar, type NavItem } from "@/components/ui/tubelight-navbar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/session";
import { useSiteSettings } from "@/lib/site-settings";

const NAV: NavItem[] = [
  { name: "Ana Sayfa", url: "/", icon: Home },
  { name: "Bakıcı Ara", url: "/bakicilar", icon: Search },
];

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
            ? "border-border bg-card/85 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            : "border-transparent bg-card/60 backdrop-blur"
        }`}
      >
        <div
          className={`container-page flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link to="/" className="flex shrink-0 items-center gap-2 transition-transform hover:scale-[1.02]">
            <BrandMark />
          </Link>

          <div className="hidden md:flex md:flex-1 md:justify-center">
            <NavBar items={NAV} />
          </div>

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
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.url}
                        to={item.url}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-brand-soft data-[status=active]:bg-brand-soft data-[status=active]:text-brand-strong"
                      >
                        <Icon className="size-4 text-brand" aria-hidden />
                        {item.name}
                      </Link>
                    );
                  })}
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
