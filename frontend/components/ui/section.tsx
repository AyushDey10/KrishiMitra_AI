import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className={cn("eyebrow", light && "eyebrow-light")}>
          {eyebrow}
        </span>
      ) : null}
      <h2 className={cn("h2", light ? "text-cream-50" : "text-forest-900")}>
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "max-w-2xl text-[1.0625rem] leading-relaxed",
            light ? "text-cream-50/70" : "text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

type BadgeTone = "sage" | "lime" | "outline" | "dark" | "amber";

const badgeTones: Record<BadgeTone, string> = {
  sage: "bg-sage-100 text-forest-800",
  lime: "bg-lime-400 text-forest-900",
  outline: "border border-line bg-transparent text-muted",
  dark: "border border-white/15 bg-white/5 text-cream-50/80",
  amber: "bg-amber-600/10 text-amber-600",
};

export function Badge({
  children,
  tone = "sage",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatBlock({
  value,
  label,
  note,
  light = false,
}: {
  value: ReactNode;
  label: string;
  note?: string;
  light?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={cn(
          "tabular font-display text-[2rem] leading-none tracking-[-0.03em] md:text-[2.5rem]",
          light ? "text-cream-50" : "text-forest-900",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-[0.8125rem] font-medium",
          light ? "text-cream-50/65" : "text-muted",
        )}
      >
        {label}
      </span>
      {note ? (
        <span
          className={cn(
            "text-[0.75rem]",
            light ? "text-cream-50/40" : "text-muted/80",
          )}
        >
          {note}
        </span>
      ) : null}
    </div>
  );
}
