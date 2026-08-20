import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Stat = {
  value: string | number;
  label: string;
};

interface StatsSectionProps {
  stats: Stat[];
  className?: string;
}

export default function StatsSection({ stats, className }: StatsSectionProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {stats.map((s, i) => (
        <Card
          key={s.label}
          className="group animate-fade-up relative overflow-hidden rounded-2xl border-border/70 bg-background/70 p-5 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow"
          style={{ animationDelay: `${400 + i * 120}ms` }}
        >
          <span
            className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full bg-brand/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
          <span
            className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand to-highlight transition-transform duration-500 group-hover:scale-x-100"
            aria-hidden
          />
          <div className="font-display text-3xl font-bold text-foreground transition-colors group-hover:text-brand-strong">
            {s.value}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {s.label}
          </div>
        </Card>
      ))}
    </div>
  );
}
