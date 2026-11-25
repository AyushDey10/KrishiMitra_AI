"use client";

import type { FeatureMeta } from "@/lib/types";
import { cn } from "@/lib/cn";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SliderField({
  feature,
  value,
  onChange,
}: {
  feature: FeatureMeta;
  value: number;
  onChange: (value: number) => void;
}) {
  const min = feature.key.endsWith("_pct") ? Math.max(0, feature.min) : feature.min;
  const max = feature.key.endsWith("_pct") ? Math.min(100, feature.max) : feature.max;
  const percent = ((clamp(value, min, max) - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={`field-${feature.key}`}
          className="text-[0.8125rem] font-medium text-ink"
        >
          {feature.label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={`field-${feature.key}`}
            type="number"
            inputMode="decimal"
            value={Number(value.toFixed(feature.decimals))}
            min={min}
            max={max}
            step="any"
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) {
                onChange(clamp(next, min, max));
              }
            }}
            className="field-input tabular w-20 rounded-lg border border-line bg-white px-2.5 py-1.5 text-right text-[0.8125rem] text-ink transition-colors focus:border-forest-700 focus:outline-none"
          />
          <span className="w-16 text-[0.6875rem] text-muted">{feature.unit}</span>
        </div>
      </div>

      <input
        type="range"
        className="range mt-3"
        min={min}
        max={max}
        step={feature.step}
        value={clamp(value, min, max)}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${feature.label} (${feature.unit})`}
        style={{
          background: `linear-gradient(to right, var(--color-forest-800) 0%, var(--color-forest-800) ${percent}%, var(--color-line) ${percent}%, var(--color-line) 100%)`,
        }}
      />

      <div className="tabular mt-1.5 flex justify-between text-[0.6875rem] text-muted/80">
        <span>{min.toFixed(feature.decimals)}</span>
        <span>
          median {feature.median.toFixed(feature.decimals)}
        </span>
        <span>{max.toFixed(feature.decimals)}</span>
      </div>
    </div>
  );
}

export function NumberField({
  feature,
  value,
  onChange,
}: {
  feature: FeatureMeta;
  value: number;
  onChange: (value: number) => void;
}) {
  const min = feature.key.endsWith("_pct") ? Math.max(0, feature.min) : feature.min;
  const max = feature.key.endsWith("_pct") ? Math.min(100, feature.max) : feature.max;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[0.75rem] leading-tight font-medium text-ink">
          {feature.label}
        </span>
        <span className="shrink-0 text-[0.625rem] text-muted">{feature.unit}</span>
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={Number(value.toFixed(feature.decimals))}
        min={min}
        max={max}
        step="any"
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange(clamp(next, min, max));
          }
        }}
        className="field-input tabular w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[0.8125rem] text-ink transition-colors focus:border-forest-700 focus:outline-none"
        aria-label={`${feature.label} (${feature.unit})`}
      />
    </label>
  );
}

export function SeasonPicker({
  seasons,
  value,
  onChange,
}: {
  seasons: string[];
  value: string;
  onChange: (season: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {seasons.map((season) => {
        const active = season === value;
        return (
          <button
            key={season}
            type="button"
            onClick={() => onChange(season)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-all duration-200",
              active
                ? "border-forest-800 bg-forest-800 text-cream-50"
                : "border-line bg-white text-muted hover:border-forest-800/25 hover:text-ink",
            )}
          >
            {season}
          </button>
        );
      })}
    </div>
  );
}
