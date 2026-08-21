import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatExperience(years: number | string | null | undefined): string {
  const n = typeof years === "string" ? Number(years.replace(",", ".")) : (years ?? 0);
  if (!Number.isFinite(n)) return "0";
  return (Math.round(n * 10) / 10).toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}
