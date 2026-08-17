import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getPublicSettings } from "@/lib/site.functions";

export const siteSettingsQueryOptions = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getPublicSettings(),
  staleTime: 5 * 60 * 1000,
});

export function useSiteSettings() {
  const { data } = useSuspenseQuery(siteSettingsQueryOptions);
  return data;
}

/** Builds a wa.me link from the WhatsApp number stored in site settings. */
export function buildWhatsappLink(number: string, message: string): string | null {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
