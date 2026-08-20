import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  className?: string;
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  className,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const dimensions = useMemo(() => {
    if (viewMode === "icon") {
      return {
        width: 46,
        height: 46,
        shaderWidth: 46,
        shaderHeight: 46,
      };
    }
    return {
      width: 150,
      height: 46,
      shaderWidth: 150,
      shaderHeight: 46,
    };
  }, [viewMode]);

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    let mounted = true;

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import(
          "@paper-design/shaders"
        );

        if (!mounted || !shaderRef.current) return;

        if (shaderMount.current?.destroy) {
          shaderMount.current.destroy();
        }

        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          0.6
        );
      } catch (error) {
        console.error("[LiquidMetalButton] Failed to load shader:", error);
      }
    };

    loadShader();

    return () => {
      mounted = false;
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed?.(0.6);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1);
        } else {
          shaderMount.current?.setSpeed?.(0.6);
        }
      }, 300);
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    onClick?.();
  };

  return (
    <div
      className={cn("relative inline-flex", className)}
      style={{ perspective: "1000px" }}
    >
      <div
        style={{
          position: "relative",
          width: dimensions.width,
          height: dimensions.height,
          transformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isPressed
            ? "rotateX(10deg) rotateY(10deg) scale(0.95)"
            : isHovered
              ? "rotateX(5deg) rotateY(-5deg) scale(1.05)"
              : "rotateX(0) rotateY(0) scale(1)",
        }}
      >
        {/* animated liquid metal ring (outside only) */}
        <div
          ref={shaderRef}
          className="shader-container-exploded absolute inset-0 overflow-hidden rounded-full"
          style={{ borderRadius: "100px" }}
        />
        {/* brand color tint over the ring */}
        <div
          className="absolute inset-0 z-[10] rounded-full"
          style={{
            background:
              "linear-gradient(120deg, var(--brand), var(--highlight), var(--brand))",
            mixBlendMode: "color",
            pointerEvents: "none",
          }}
        />
        {/* inner surface: soft yellow tint with subtle gradient */}
        <div
          className="absolute z-[20] rounded-full"
          style={{
            inset: 2,
            background:
              "linear-gradient(145deg, color-mix(in oklab, var(--highlight) 35%, var(--background)) 0%, var(--background) 100%)",
            boxShadow: isHovered
              ? "0 6px 18px -8px color-mix(in oklab, var(--brand) 60%, transparent)"
              : "none",
            transition: "box-shadow 0.3s ease",
            pointerEvents: "none",
          }}
        />
        <div
          className="absolute inset-0 z-[30] flex items-center justify-center gap-2"
          style={{
            pointerEvents: "none",
            transform: "translateZ(15px)",
          }}
        >
          {viewMode === "icon" && <Sparkles className="size-5 text-brand" />}
          {viewMode === "text" && (
            <span className="text-sm font-semibold text-brand">
              {label}
            </span>
          )}
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: dimensions.width,
            height: dimensions.height,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            outline: "none",
            zIndex: 40,
            transformStyle: "preserve-3d",
            transform: "translateZ(25px)",
            transition:
              "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            overflow: "hidden",
            borderRadius: "100px",
          }}
          aria-label={label}
        >
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              style={{
                position: "absolute",
                left: ripple.x,
                top: ripple.y,
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                animation: "ripple-animation 0.6s linear forwards",
                pointerEvents: "none",
              }}
            />
          ))}
        </button>
      </div>
    </div>
  );
}
