"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChangeChart } from "@/components/charts/change-chart";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { SeasonPicker } from "@/components/ui/field";
import {
  ArrowRightIcon,
  RainIcon,
  TrendIcon,
} from "@/components/ui/icons";
import { apiGet, apiPost, OFFLINE_MESSAGE } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { Meta, ScenarioResponse } from "@/lib/types";

export function SimulatorClient() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [season, setSeason] = useState("Kharif");
  const [change, setChange] = useState(0);
  const [data, setData] = useState<ScenarioResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  useEffect(() => {
    let alive = true;
    setLoadError(null);

    apiGet<Meta>("/meta")
      .then((response) => {
        if (!alive) return;
        setMeta(response);
        setSeason(
          response.seasons.includes("Kharif")
            ? "Kharif"
            : response.seasons[0],
        );
      })
      .catch((cause: unknown) => {
        if (!alive) return;
        setLoadError(cause instanceof Error ? cause.message : OFFLINE_MESSAGE);
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const baselineProfile = useMemo(() => {
    if (!meta) return null;
    return Object.fromEntries(
      meta.features.map((feature) => [feature.key, feature.median]),
    );
  }, [meta]);

  const runScenario = useCallback(
    async (nextSeason: string, nextChange: number) => {
      if (!baselineProfile) return;

      const current = ++requestId.current;
      setPending(true);
      setError(null);

      try {
        const response = await apiPost<ScenarioResponse>("/scenario", {
          season: nextSeason,
          features: baselineProfile,
          rainfall_change_pct: nextChange,
          top_n: 3,
        });

        if (current === requestId.current) {
          setData(response);
        }
      } catch (cause) {
        if (current === requestId.current) {
          setError(cause instanceof Error ? cause.message : OFFLINE_MESSAGE);
        }
      } finally {
        if (current === requestId.current) {
          setPending(false);
        }
      }
    },
    [baselineProfile],
  );

  useEffect(() => {
    if (!baselineProfile) return;
    const timer = setTimeout(() => {
      void runScenario(season, change);
    }, 280);
    return () => clearTimeout(timer);
  }, [baselineProfile, season, change, runScenario]);

  if (loadError) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl">
          <Callout tone="warn" title="The model service is not reachable">
            {loadError}
          </Callout>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </Button>
            <ButtonLink
              href="http://localhost:8501"
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Streamlit fallback
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const baseRainfall =
    data?.rainfall_original ??
    meta?.features.find((feature) => feature.key === "rainfall_mm")?.median ??
    0;
  const modifiedRainfall =
    data?.rainfall_modified ?? baseRainfall * (1 + change / 100);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-3xl">
        <span className="eyebrow">Rainfall scenario simulator</span>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em] text-forest-900">
          One variable.
          <br />
          A visible shift.
        </h1>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted">
          Adjust seasonal rainfall and the same trained model responds. This
          shows sensitivity to a single input — it is not a forecast and not an
          assessment of what would happen in a field.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        {/* -------------------------------------------------------- controls */}
        <div className="card p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9375rem] font-semibold text-forest-900">
              Scenario controls
            </h2>
            <RainIcon className="h-4.5 w-4.5 text-forest-700/40" />
          </div>

          <div className="mt-6">
            <p className="text-[0.75rem] font-semibold tracking-[0.12em] text-muted uppercase">
              Growing season
            </p>
            <div className="mt-3">
              <SeasonPicker
                seasons={meta?.seasons ?? []}
                value={season}
                onChange={setSeason}
              />
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="rainfall-change"
                className="text-[0.75rem] font-semibold tracking-[0.12em] text-muted uppercase"
              >
                Rainfall change
              </label>
              <span
                className={cn(
                  "tabular font-display text-[1.75rem] leading-none tracking-[-0.02em]",
                  change > 0
                    ? "text-forest-700"
                    : change < 0
                      ? "text-rust-600"
                      : "text-forest-900",
                )}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            </div>

            <input
              id="rainfall-change"
              type="range"
              className="range mt-4"
              min={-50}
              max={50}
              step={5}
              value={change}
              onChange={(event) => setChange(Number(event.target.value))}
              style={{
                background: `linear-gradient(to right, var(--color-line) 0%, var(--color-line) 50%, var(--color-forest-800) 50%, var(--color-forest-800) ${
                  50 + change
                }%, var(--color-line) ${50 + change}%, var(--color-line) 100%)`,
              }}
            />

            <div className="tabular mt-2 flex justify-between text-[0.6875rem] text-muted/80">
              <span>−50%</span>
              <span>0%</span>
              <span>+50%</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line bg-cream-50 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.75rem] text-muted">Baseline</span>
              <span className="tabular text-[0.9375rem] font-medium text-forest-900">
                {formatNumber(baseRainfall, 1)} mm
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[0.75rem] text-muted">Modified</span>
              <span className="tabular text-[0.9375rem] font-semibold text-forest-800">
                {formatNumber(modifiedRainfall, 1)} mm
              </span>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted/80">
              All other inputs stay at dataset medians. The scenario uses{" "}
              {data?.baseline.length ?? 3} ranked labels from the same model.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[0.6875rem] text-muted">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                pending ? "animate-pulse bg-amber-600" : "bg-forest-700/40",
              )}
            />
            {pending ? "Recomputing…" : "Results update automatically"}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => setChange(0)}
            disabled={change === 0}
          >
            Reset to baseline
          </Button>
        </div>

        {/* --------------------------------------------------------- results */}
        <div className="space-y-5">
          {error ? (
            <Callout tone="warn" title="Scenario failed">
              {error}
            </Callout>
          ) : null}

          <div
            className={cn(
              "grid gap-3 transition-opacity duration-300 sm:grid-cols-2",
              pending && "opacity-60",
            )}
          >
            <RankedPanel
              title="Baseline"
              subtitle={`${formatNumber(baseRainfall, 1)} mm rainfall`}
              items={data?.baseline ?? []}
            />
            <RankedPanel
              title="Modified"
              subtitle={`${formatNumber(modifiedRainfall, 1)} mm rainfall`}
              accent
              items={data?.scenario ?? []}
            />
          </div>

          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-[0.875rem] font-semibold text-forest-900">
                  Score by rank
                </h3>
                <p className="mt-1 text-[0.75rem] text-muted">
                  Baseline and modified model scores for the three highest ranks
                </p>
              </div>
              <div className="flex items-center gap-4 text-[0.6875rem] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-forest-800" />
                  Baseline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-lime-500" />
                  Modified
                </span>
              </div>
            </div>

            <div className={cn("mt-5 transition-opacity", pending && "opacity-60")}>
              {data ? (
                <ChangeChart
                  data={data.delta.map((row) => ({
                    label: `Rank ${row.rank}`,
                    baseline: row.baseline_score,
                    scenario: row.scenario_score,
                  }))}
                />
              ) : (
                <div className="h-52 animate-pulse rounded-xl bg-cream-100" />
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <h3 className="text-[0.875rem] font-semibold text-forest-900">
                Rank-by-rank comparison
              </h3>
              <TrendIcon className="h-4 w-4 text-forest-700/40" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[0.8125rem]">
                <thead>
                  <tr className="border-b border-line bg-cream-100/50 text-[0.6875rem] tracking-[0.1em] text-muted uppercase">
                    <th className="px-6 py-3 font-semibold">Rank</th>
                    <th className="px-3 py-3 font-semibold">Baseline</th>
                    <th className="px-3 py-3 text-right font-semibold">Score</th>
                    <th className="px-3 py-3 font-semibold">Modified</th>
                    <th className="px-3 py-3 text-right font-semibold">Score</th>
                    <th className="px-6 py-3 text-right font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.delta ?? []).map((row) => (
                    <tr
                      key={row.rank}
                      className="border-b border-line/70 last:border-0"
                    >
                      <td className="tabular px-6 py-3.5 text-muted">
                        {row.rank}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-forest-900">
                        {row.baseline_crop}
                      </td>
                      <td className="tabular px-3 py-3.5 text-right text-muted">
                        {row.baseline_score.toFixed(2)}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-forest-900">
                        {row.scenario_crop}
                      </td>
                      <td className="tabular px-3 py-3.5 text-right text-muted">
                        {row.scenario_score.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          "tabular px-6 py-3.5 text-right font-medium",
                          row.score_change > 0
                            ? "text-forest-700"
                            : row.score_change < 0
                              ? "text-rust-600"
                              : "text-muted",
                        )}
                      >
                        {row.score_change > 0 ? "+" : ""}
                        {row.score_change.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {!data ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-muted"
                      >
                        Waiting for the first scenario result…
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <Callout tone="info" title="What a shift in score means">
            {data?.disclaimers.scenario ??
              "A rainfall scenario shows how the model responds to a changed input. It is not a climate forecast or an agronomic impact assessment."}{" "}
            Because rainfall is one of 32 inputs, a crop&apos;s score can rise,
            fall or stay flat as the tree ensemble routes the profile
            differently.
          </Callout>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/dashboard" variant="outline" size="sm">
              Run a full prediction
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </ButtonLink>
            <ButtonLink href="/crop-intelligence" variant="ghost" size="sm">
              Inspect a crop&apos;s history
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankedPanel({
  title,
  subtitle,
  items,
  accent = false,
}: {
  title: string;
  subtitle: string;
  items: { rank: number; crop: string; score: number }[];
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        accent
          ? "border-forest-800/20 bg-white"
          : "border-line bg-cream-100/40",
      )}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-[0.75rem] font-semibold tracking-[0.12em] text-muted uppercase">
          {title}
        </h3>

      </div>
      <p className="mt-1 text-[0.6875rem] text-muted/80">{subtitle}</p>

      <ul className="mt-4 space-y-3">
        {items.length > 0
          ? items.map((item) => (
              <li key={`${title}-${item.rank}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-baseline gap-2">
                    <span className="tabular text-[0.6875rem] text-muted/70">
                      {item.rank}
                    </span>
                    <span className="text-[0.875rem] font-medium text-forest-900">
                      {item.crop}
                    </span>
                  </span>
                  <span className="tabular text-[0.8125rem] text-muted">
                    {item.score.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cream-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, item.score)}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      accent ? "bg-lime-500" : "bg-forest-700/50",
                    )}
                  />
                </div>
              </li>
            ))
          : [0, 1, 2].map((index) => (
              <li key={index} className="animate-pulse">
                <div className="h-3.5 w-24 rounded-full bg-cream-100" />
                <div className="mt-2 h-1 w-full rounded-full bg-cream-100" />
              </li>
            ))}
      </ul>
    </div>
  );
}
