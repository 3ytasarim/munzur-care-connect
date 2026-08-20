"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
  delay?: number;
}

function StatCard({
  value,
  label,
  className,
  delay = 0,
}: StatCardProps) {
  const d = delay / 1000;

  return (
    <div
      className={cn(
        "relative h-[150px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand/40 via-highlight/30 to-brand-strong/40 p-[2px]",
        className,
      )}
    >
      {/* Moving halo */}
      <motion.div
        className="absolute h-12 w-12 rounded-full bg-highlight/40 blur-xl"
        animate={{
          top: ["10%", "10%", "75%", "75%", "10%"],
          left: ["10%", "80%", "80%", "10%", "10%"],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: d }}
      />

      {/* Inner Card */}
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[10px] border border-brand/15 bg-gradient-to-br from-background/90 to-brand-soft/70 backdrop-blur-md">
        {/* Rotating Ray */}
        <motion.div
          className="absolute h-[50px] w-[220px] rounded-full bg-brand/15 blur-2xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Value */}
        <motion.div
          className="bg-gradient-to-r from-brand-strong via-brand to-brand-strong bg-clip-text text-4xl font-extrabold text-transparent"
          animate={{
            textShadow: [
              "0 0 10px var(--brand-soft)",
              "0 0 2px var(--brand-soft)",
              "0 0 10px var(--brand-soft)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: d }}
        >
          {value}
        </motion.div>

        {/* Label */}
        <div className="mt-2 text-sm tracking-wide text-muted-foreground">
          {label}
        </div>

        {/* Subtle lines */}
        <motion.div
          className="absolute top-[12%] h-px w-[80%] bg-gradient-to-r from-brand/50 to-transparent"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, delay: d }}
        />
        <motion.div
          className="absolute bottom-[12%] h-px w-[80%] bg-gradient-to-r from-transparent to-highlight/60"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: d }}
        />
      </div>
    </div>
  );
}

export { StatCard };
export default StatCard;
