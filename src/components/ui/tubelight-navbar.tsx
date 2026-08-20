import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  const activeItem = items.find((item) => isActive(item.url)) ?? items[0];

  if (!activeItem || items.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        "relative flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-1.5 shadow-sm backdrop-blur-xl",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeItem.name === item.name;

        return (
          <Link
            key={item.name}
            to={item.url}
            className={cn(
              "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
              active
                ? "text-brand-strong"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden />
            <span className="hidden sm:inline">{item.name}</span>
            {active && (
              <motion.div
                layoutId="tubelight-pill"
                className="absolute inset-0 -z-10 rounded-full bg-brand-soft"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {active && (
              <motion.div
                layoutId="tubelight-glow"
                className="pointer-events-none absolute inset-0 -z-20 rounded-full bg-brand/20 blur-md"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
