"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
  delay?: number;
}

export default function StatCard({
  value,
  label,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn("group relative rounded-2xl p-px", className)}
    >
      {/* Moving halo (animated border) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--brand) 60deg, var(--highlight) 120deg, transparent 200deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-background/95 px-5 py-4 backdrop-blur-xl">
        {/* Rotating ray */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--highlight) 45%, transparent) 30deg, transparent 90deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Subtle moving lines */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-brand to-transparent"
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: delay / 1000 }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-highlight to-transparent"
          animate={{ x: ["100%", "-220%"] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: delay / 1000 + 0.4 }}
        />

        <div className="relative">
          <div className="text-2xl font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand-strong">
            {value}
          </div>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
