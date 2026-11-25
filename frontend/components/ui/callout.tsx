import type { ReactNode } from "react";

import { AlertIcon, InfoIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function Callout({
  children,
  tone = "info",
  title,
  className,
}: {
  children: ReactNode;
  tone?: "info" | "warn" | "dark";
  title?: string;
  className?: string;
}) {
  const styles = {
    info: "border-line bg-cream-100/60 text-muted",
    warn: "border-amber-600/25 bg-amber-600/[0.06] text-amber-600",
    dark: "border-white/12 bg-white/[0.04] text-cream-50/70",
  }[tone];

  const Icon = tone === "warn" ? AlertIcon : InfoIcon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border px-4 py-3.5 text-[0.8125rem] leading-relaxed",
        styles,
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          tone === "warn" ? "text-amber-600" : tone === "dark" ? "text-lime-400" : "text-forest-700",
        )}
      />
      <div>
        {title ? (
          <p
            className={cn(
              "mb-1 font-semibold",
              tone === "warn"
                ? "text-amber-600"
                : tone === "dark"
                  ? "text-cream-50"
                  : "text-forest-900",
            )}
          >
            {title}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
