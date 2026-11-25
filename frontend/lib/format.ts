export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Values from the model are already on a 0–100 scale. */
export function formatScore(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** Values from the evaluation CSVs are fractions on a 0–1 scale. */
export function formatMetric(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatRange(low: number, high: number, decimals = 0): string {
  return `${formatNumber(low, decimals)}–${formatNumber(high, decimals)}`;
}

export function classF1Tone(f1: number): "strong" | "moderate" | "weak" {
  if (f1 >= 0.6) return "strong";
  if (f1 >= 0.4) return "moderate";
  return "weak";
}
