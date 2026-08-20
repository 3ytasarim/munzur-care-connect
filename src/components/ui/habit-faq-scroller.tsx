import type { CSSProperties, ReactNode } from "react";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqRow = {
  id: string;
  speed?: string;
  direction?: "left" | "right";
  faqItems: FaqItem[];
};

export type FaqData = {
  mainTitle: string;
  mainSubtitle: string;
  rows: FaqRow[];
};

export const FaqCard = ({ question, answer }: { question: string; answer: string }) => (
  <article className="flex w-80 flex-shrink-0 flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg sm:w-96">
    <span className="rounded-full bg-accent/40 px-3 py-1 text-xs font-semibold text-foreground/70">
      SSS
    </span>
    <h3 className="font-display text-lg font-bold text-foreground">{question}</h3>
    <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
  </article>
);

export const HorizontalScroller = ({
  children,
  speed = "40s",
  direction = "left",
}: {
  children: ReactNode;
  speed?: string;
  direction?: "left" | "right";
}) => {
  const animationClass =
    direction === "right" ? "animate-scroll-x-reverse" : "animate-scroll-x";
  const style = { "--scroll-duration": speed } as CSSProperties;

  return (
    <div className="group relative w-full overflow-hidden faq-scroller-mask">
      <div className={`flex w-max ${animationClass} group-hover:[animation-play-state:paused]`} style={style}>
        <div className="flex flex-shrink-0 items-stretch gap-6 px-3">{children}</div>
        <div className="flex flex-shrink-0 items-stretch gap-6 px-3" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

const FaqSection = ({ data }: { data: FaqData }) => (
  <div className="relative flex w-full flex-col items-center gap-10">
    <div className="z-10 flex max-w-2xl flex-col items-center gap-4 px-4 text-center">
      <h2 className="animate-fade-up font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        {data.mainTitle}
      </h2>
      <p className="animate-fade-up text-base text-muted-foreground [animation-delay:120ms]">
        {data.mainSubtitle}
      </p>
    </div>

    <div className="z-10 flex w-full flex-col gap-6">
      {data.rows.map((row) => (
        <HorizontalScroller key={row.id} speed={row.speed} direction={row.direction}>
          {row.faqItems.map((item) => (
            <FaqCard key={item.id} question={item.question} answer={item.answer} />
          ))}
        </HorizontalScroller>
      ))}
    </div>
  </div>
);

export default FaqSection;
