import {
  Accessibility,
  Baby,
  Blocks,
  ChefHat,
  HeartPulse,
  HandHeart,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "yasli-bakimi": HandHeart,
  "bebek-bakimi": Baby,
  "cocuk-bakimi": Blocks,
  "hasta-bakimi": HeartPulse,
  "engelli-bakimi": Accessibility,
  "ev-isleri": Sparkles,
  yemek: ChefHat,
  refakatci: Stethoscope,
};

export function getServiceIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? HandHeart;
}

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = getServiceIcon(slug);
  return <Icon className={className} aria-hidden />;
}
