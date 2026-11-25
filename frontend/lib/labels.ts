import type { FeatureMeta } from "./types";

/** Distinguish 0–5 cm and 0–30 cm variants that share a label. */
export function featureLabel(feature: FeatureMeta): string {
  if (feature.key.endsWith("_0_5cm")) return `${feature.label} · 0–5 cm`;
  if (feature.key.endsWith("_0_30cm")) return `${feature.label} · 0–30 cm`;
  return feature.label;
}

export function prettyKey(key: string): string {
  return key
    .replace(/_0_5cm$/, " · 0–5 cm")
    .replace(/_0_30cm$/, " · 0–30 cm")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
