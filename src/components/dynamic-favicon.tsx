import { useEffect } from "react";

import { useSiteSettings } from "@/lib/site-settings";

/** Applies the favicon uploaded in Super Admin → Site Settings, if any. */
export function DynamicFavicon() {
  const { settings } = useSiteSettings();
  const favicon = settings["favicon_url"];

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [favicon]);

  return null;
}
