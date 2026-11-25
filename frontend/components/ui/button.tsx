import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "lime" | "outline" | "ghost" | "onDark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-800 text-cream-50 shadow-[0_10px_24px_-14px_rgba(11,36,29,0.7)] hover:bg-forest-700 active:scale-[0.985]",
  lime:
    "bg-lime-400 text-forest-900 shadow-[0_10px_24px_-14px_rgba(11,36,29,0.5)] hover:bg-lime-500 active:scale-[0.985]",
  outline:
    "border border-line bg-transparent text-ink hover:border-forest-800/30 hover:bg-cream-100/70 active:scale-[0.985]",
  ghost:
    "bg-transparent text-forest-700 hover:bg-sage-100/70 active:scale-[0.985]",
  onDark:
    "border border-white/25 bg-white/5 text-cream-50 backdrop-blur-sm hover:border-white/45 hover:bg-white/10 active:scale-[0.985]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const external = /^https?:|^mailto:/.test(href);

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
