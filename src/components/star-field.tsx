import { Star } from "lucide-react";

const STARS = [
  { top: "8%", left: "6%", size: 10, delay: "0s", duration: "9s", opacity: 0.55 },
  { top: "14%", left: "18%", size: 7, delay: "1.2s", duration: "12s", opacity: 0.4 },
  { top: "22%", left: "4%", size: 9, delay: "0.6s", duration: "10s", opacity: 0.5 },
  { top: "6%", left: "44%", size: 8, delay: "2.1s", duration: "11s", opacity: 0.45 },
  { top: "34%", left: "12%", size: 6, delay: "0.3s", duration: "13s", opacity: 0.35 },
  { top: "46%", left: "26%", size: 11, delay: "1.5s", duration: "9.5s", opacity: 0.6 },
  { top: "58%", left: "8%", size: 7, delay: "0.9s", duration: "12.5s", opacity: 0.4 },
  { top: "72%", left: "20%", size: 9, delay: "2.7s", duration: "10.5s", opacity: 0.5 },
  { top: "84%", left: "5%", size: 8, delay: "1.8s", duration: "11.5s", opacity: 0.45 },
  { top: "12%", left: "70%", size: 10, delay: "0.2s", duration: "9s", opacity: 0.55 },
  { top: "28%", left: "86%", size: 7, delay: "1.1s", duration: "12s", opacity: 0.4 },
  { top: "38%", left: "64%", size: 9, delay: "0.5s", duration: "10s", opacity: 0.5 },
  { top: "52%", left: "92%", size: 6, delay: "2.3s", duration: "13s", opacity: 0.35 },
  { top: "62%", left: "78%", size: 11, delay: "1.7s", duration: "9.5s", opacity: 0.6 },
  { top: "76%", left: "56%", size: 8, delay: "0.8s", duration: "11s", opacity: 0.45 },
  { top: "88%", left: "88%", size: 7, delay: "2.5s", duration: "12.5s", opacity: 0.4 },
  { top: "18%", left: "96%", size: 9, delay: "1.3s", duration: "10.5s", opacity: 0.5 },
  { top: "66%", left: "36%", size: 6, delay: "0.4s", duration: "14s", opacity: 0.35 },
  { top: "30%", left: "32%", size: 8, delay: "2s", duration: "11s", opacity: 0.45 },
  { top: "92%", left: "42%", size: 10, delay: "1.6s", duration: "9s", opacity: 0.55 },
];

export function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {STARS.map((star, i) => (
        <span
          key={i}
          className="animate-star-drift absolute inline-block text-brand"
          style={{
            top: star.top,
            left: star.left,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        >
          <Star
            className="fill-brand/30"
            style={{ width: star.size, height: star.size }}
          />
        </span>
      ))}
    </div>
  );
}
