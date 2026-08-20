import { motion, type HTMLMotionProps } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface Button3DProps extends Omit<HTMLMotionProps<"button">, "children" | "variant" | "size"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button3D({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  onClick,
  type = "button",
  ...props
}: Button3DProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: {
      face: "bg-brand text-brand-foreground border-brand-strong",
      shadow: "bg-brand-strong",
    },
    secondary: {
      face: "bg-foreground text-background border-foreground/70",
      shadow: "bg-foreground/70",
    },
    accent: {
      face: "bg-highlight text-highlight-foreground border-highlight-strong",
      shadow: "bg-highlight-strong",
    },
    outline: {
      face: "bg-background text-foreground border-border",
      shadow: "bg-border",
    },
    ghost: {
      face: "bg-transparent text-foreground border-transparent hover:bg-muted",
      shadow: "bg-transparent",
    },
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const current = variants[variant];
  const currentSize = sizes[size];

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      animate={{ y: isPressed ? 3 : 0 }}
      whileHover={disabled ? {} : { y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span
        className={cn("absolute inset-0 translate-y-1.5 rounded-xl", current.shadow)}
        aria-hidden
      />
      <span
        className={cn(
          "relative inline-flex w-full items-center justify-center gap-2 rounded-xl border-b-4 transition-colors",
          current.face,
          currentSize
        )}
      >
        {children}
      </span>
    </motion.button>
  );
}
