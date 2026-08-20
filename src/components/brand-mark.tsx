import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/lib/site-settings";

type Props = {
  className?: string;
  /** Renders the compact mobile variant when a mobile logo is configured. */
  variant?: "default" | "mobile";
};

/**
 * Temporary typography-based brand mark.
 *
 * As soon as a logo is uploaded in Super Admin → Site Settings → Branding,
 * the stored logo_url / mobile_logo_url is rendered instead — no code change.
 */
export function BrandMark({ className, variant = "default" }: Props) {
  const { settings } = useSiteSettings();
  const siteName = settings["site_name"] || "MunzurDestek";
  const logo = variant === "mobile" ? settings["mobile_logo_url"] || settings["logo_url"] : settings["logo_url"];

  if (logo) {
    return <img src={logo} alt={siteName} className={cn("h-16 w-auto bg-transparent object-contain", className)} />;
  }

  const split = siteName.toLowerCase().startsWith("munzur") ? 6 : Math.ceil(siteName.length / 2);

  return (
    <span
      className={cn(
        "font-display text-xl font-extrabold tracking-tight leading-none select-none bg-transparent",
        className,
      )}
    >
      <span className="text-brand">{siteName.slice(0, split)}</span>
      <span className="text-foreground">{siteName.slice(split)}</span>
    </span>
  );
}
