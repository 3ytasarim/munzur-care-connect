import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Marka renkli, desenli hero arka planı.
 * Grid deseni + yumuşak radyal ışıklar + ince alt kenarlık.
 */
export const Hero = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border bg-background",
        className,
      )}
    >
      {/* Grid deseni */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--brand) 14%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--brand) 14%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Yumuşak ışıklar */}
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-highlight/40 blur-3xl [animation-delay:-4s]"
      />

      <div className="relative">{children}</div>
    </section>
  );
};

export default Hero;
