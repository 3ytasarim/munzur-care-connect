import bebek from "@/assets/services/bebek-bakimi.jpg";
import cocuk from "@/assets/services/cocuk-bakimi.jpg";
import engelli from "@/assets/services/engelli-bakimi.jpg";
import evIsleri from "@/assets/services/ev-isleri.jpg";
import hasta from "@/assets/services/hasta-bakimi.jpg";
import refakatci from "@/assets/services/refakatci.jpg";
import yasli from "@/assets/services/yasli-bakimi.jpg";
import yemek from "@/assets/services/yemek.jpg";

const IMAGES: Record<string, string> = {
  "yasli-bakimi": yasli,
  "bebek-bakimi": bebek,
  "cocuk-bakimi": cocuk,
  "hasta-bakimi": hasta,
  "engelli-bakimi": engelli,
  "ev-isleri": evIsleri,
  yemek: yemek,
  refakatci: refakatci,
};

export function getServiceImage(slug: string): string {
  return IMAGES[slug] ?? yasli;
}
