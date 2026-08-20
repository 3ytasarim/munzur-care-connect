import React, { useRef, useState } from "react";

// RTL detection for Hebrew/Arabic
function isRTL(text: string) {
  return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
}

export interface InfoCardProps {
  image: string;
  title: string;
  description: string;
  width?: number | string;
  height?: number | string;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  borderPadding?: number;
  cardBgColor?: string;
  patternColor1?: string;
  patternColor2?: string;
  textColor?: string;
  hoverTextColor?: string;
  fontFamily?: string;
  rtlFontFamily?: string;
  effectBgColor?: string;
  contentPadding?: string;
  imageHeight?: number | string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  description,
  width = "100%",
  height = 378,
  borderColor = "var(--brand)",
  borderBgColor = "var(--border)",
  borderWidth = 3,
  borderPadding = 12,
  cardBgColor = "var(--card)",
  patternColor1 = "rgba(87,182,20,0.06)",
  patternColor2 = "rgba(255,222,88,0.10)",
  textColor = "var(--foreground)",
  hoverTextColor = "var(--foreground)",
  fontFamily = "inherit",
  rtlFontFamily = "inherit",
  effectBgColor = "var(--highlight)",
  contentPadding = "12px 16px",
  imageHeight = 190,
}) => {
  const [hovered, setHovered] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    border.style.setProperty("--rotation", `${angle}rad`);
  };

  const rtl = isRTL(title) || isRTL(description);
  const effectiveFont = rtl ? rtlFontFamily : fontFamily;
  const titleDirection = isRTL(title) ? "rtl" : "ltr";
  const descDirection = isRTL(description) ? "rtl" : "ltr";

  const pattern =
    `linear-gradient(45deg, ${patternColor1} 25%, transparent 25%, transparent 75%, ${patternColor2} 75%),` +
    `linear-gradient(-45deg, ${patternColor2} 25%, transparent 25%, transparent 75%, ${patternColor1} 75%)`;

  const borderGradient = `conic-gradient(from var(--rotation,0deg), ${borderColor} 0deg, ${borderColor} 90deg, ${borderBgColor} 90deg, ${borderBgColor} 360deg)`;

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (borderRef.current) borderRef.current.style.setProperty("--rotation", "0deg");
      }}
      style={
        {
          width,
          height,
          border: `${borderWidth}px solid transparent`,
          borderRadius: "1em",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          backgroundImage: `linear-gradient(${cardBgColor}, ${cardBgColor}), ${borderGradient}`,
          padding: borderPadding,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          transition: "box-shadow 0.3s",
          position: "relative",
          fontFamily: effectiveFont,
        } as React.CSSProperties
      }
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0.75em",
          background: cardBgColor,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundImage: pattern,
          backgroundSize: "20.84px 20.84px",
          padding: "0 0 8px 0",
        }}
      >
        <div style={{ width: "100%", height: imageHeight, position: "relative", overflow: "hidden" }}>
          <img
            src={image}
            alt={title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: contentPadding,
            minHeight: 0,
          }}
        >
          <h3
            style={{
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "-.01em",
              lineHeight: "normal",
              marginBottom: 8,
              color: hovered ? hoverTextColor : textColor,
              transition: "color 0.3s ease",
              position: "relative",
              overflow: "hidden",
              direction: titleDirection,
              width: "auto",
            }}
          >
            <span
              style={{
                position: "relative",
                zIndex: 10,
                padding: "2px 4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {title}
            </span>
            <span
              style={{
                clipPath: hovered
                  ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                  : "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
                transformOrigin: "center",
                transition: "all cubic-bezier(.1,.5,.5,1) 0.4s",
                position: "absolute",
                left: -4,
                right: -4,
                top: -4,
                bottom: -4,
                zIndex: 0,
                backgroundColor: effectBgColor,
              }}
            />
          </h3>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--muted-foreground)",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              direction: descDirection,
              marginBottom: 0,
              minHeight: 0,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
