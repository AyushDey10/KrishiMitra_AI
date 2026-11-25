"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ImportanceChart, ScoreChart } from "@/components/charts/score-chart";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { NumberField, SeasonPicker, SliderField } from "@/components/ui/field";
import {
  ArrowRightIcon,
  BookIcon,
  ChartIcon,
  InfoIcon,
  LayersIcon,
  SproutIcon,
  TrendIcon,
} from "@/components/ui/icons";
import { apiGet, apiPost, OFFLINE_MESSAGE } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { featureLabel } from "@/lib/labels";
import type { Meta, MetricsResponse, PredictResponse } from "@/lib/types";

const EMPTY_HIGHLIGHTS = [
  "The three highest-scoring crop labels for the profile",
  "Model scores across the wider top five",
  "Any documented practices linked to those crops",
  "The exact limitations that apply to the output",
];

export function DashboardClient() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [season, setSeason] = useState("Kharif");
  const [values, setValues] = useState<Record<string, number>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [result, setResult] = useState<PredictResponse | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([apiGet<Meta>("/meta"), apiGet<MetricsResponse>("/metrics")])
      .then(([metaResponse, metricsResponse]) => {
        if (!alive) return;
        setMeta(metaResponse);
        setMetrics(metricsResponse);
        setSeason(
          metaResponse.seasons.includes("Kharif")
            ? "Kharif"
            : metaResponse.seasons[0],
        );
        setValues(
          Object.fromEntries(
            metaResponse.features.map((feature) => [
              feature.key,
              feature.median,
            ]),
          ),
        );
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : OFFLINE_MESSAGE);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const primary = useMemo(
    () => meta?.features.filter((feature) => feature.primary) ?? [],
    [meta],
  );
  const advancedSoil = useMemo(
    () =>
      meta?.features.filter(
        (feature) => !feature.primary && feature.group === "Soil",
      ) ?? [],
    [meta],
  );
  const advancedClimate = useMemo(
    () =>
      meta?.features.filter(
        (feature) => !feature.primary && feature.group === "Climate",
      ) ?? [],
    [meta],
  );

  const importance = useMemo(() => {
    if (!meta || !metrics) return [];
    return metrics.feature_importance.slice(0, 10).map((item) => {
      const feature = meta.features.find((entry) => entry.key === item.key);
      return {
        label: feature ? featureLabel(feature) : item.key,
        value: item.importance,
      };
    });
  }, [meta, metrics]);

  function setValue(key: string, value: number) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function resetToMedians() {
    if (!meta) return;
    setValues(
      Object.fromEntries(
        meta.features.map((feature) => [feature.key, feature.median]),
      ),
    );
    setResult(null);
    setPredictError(null);
  }

  async function runPrediction() {
    if (!meta) return;
    setPredicting(true);
    setPredictError(null);

    try {
      const response = await apiPost<PredictResponse>("/predict", {
        season,
        features: values,
        top_n: 5,
      });
      setResult(response);

      if (
        typeof window !== "undefined" &&
        window.innerWidth < 1024
      ) {
        requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    } catch (error) {
      setPredictError(error instanceof Error ? error.message : OFFLINE_MESSAGE);
      setResult(null);
    } finally {
      setPredicting(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (loadError || !meta) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl">
          <Callout tone="warn" title="The model service is not reachable">
            {loadError ?? OFFLINE_MESSAGE}
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
              Use the Streamlit dashboard
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const visibleFlags =
    result?.input_flags.filter(
      (flag) => flag.issue === "outside_observed_range",
    ) ?? [];

  return (
    <div className="container-page py-12 md:py-16">
      {/* ------------------------------------------------------------ header */}
      <div className="max-w-3xl">
        <span className="eyebrow">Crop intelligence dashboard</span>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em] text-forest-900">
          Describe the conditions.
          <br />
          Read the model&apos;s ranking.
        </h1>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted">
          Defaults are dataset medians for the selected season. Adjust the five
          essential inputs, or open advanced settings to set all 32 features.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
        {/* ------------------------------------------------------------ form */}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void runPrediction();
          }}
          className="card p-6 lg:sticky lg:top-24"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9375rem] font-semibold text-forest-900">
              Farm profile
            </h2>
            <button
              type="button"
              onClick={resetToMedians}
              className="text-[0.75rem] font-medium text-muted underline decoration-line underline-offset-4 transition-colors hover:text-forest-800"
            >
              Reset to medians
            </button>
          </div>

          <div className="mt-6">
            <p className="text-[0.75rem] font-semibold tracking-[0.12em] text-muted uppercase">
              Growing season
            </p>
            <div className="mt-3">
              <SeasonPicker
                seasons={meta.seasons}
                value={season}
                onChange={setSeason}
              />
            </div>
          </div>

          <div className="mt-7 space-y-6">
            {primary.map((feature) => (
              <SliderField
                key={feature.key}
                feature={feature}
                value={values[feature.key] ?? feature.median}
                onChange={(value) => setValue(feature.key, value)}
              />
            ))}
          </div>

          <div className="mt-7 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              aria-expanded={advancedOpen}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span>
                <span className="block text-[0.875rem] font-semibold text-forest-900">
                  Advanced settings
                </span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  All 32 soil and climate features
                </span>
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-forest-700 transition-transform duration-300",
                  advancedOpen && "rotate-180 bg-sage-100",
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {advancedOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-6">
                    <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted uppercase">
                      Soil · {advancedSoil.length + primary.filter((f) => f.group === "Soil").length} features
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {advancedSoil.map((feature) => (
                        <NumberField
                          key={feature.key}
                          feature={feature}
                          value={values[feature.key] ?? feature.median}
                          onChange={(value) => setValue(feature.key, value)}
                        />
                      ))}
                    </div>

                    <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted uppercase">
                      Climate
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {advancedClimate.map((feature) => (
                        <NumberField
                          key={feature.key}
                          feature={feature}
                          value={values[feature.key] ?? feature.median}
                          onChange={(value) => setValue(feature.key, value)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-7 w-full"
            disabled={predicting}
          >
            {predicting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cream-50/30 border-t-cream-50" />
                Running the model…
              </>
            ) : (
              <>
                Run prediction
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-[0.6875rem] leading-relaxed text-muted/80">
            Model scores are historical classifier outputs, not probabilities of
            crop success.
          </p>
        </form>

        {/* --------------------------------------------------------- results */}
        <div ref={resultRef} className="scroll-mt-24 space-y-5">
          {predicting && !result ? <ResultSkeleton /> : null}

          {!predicting && !result && !predictError ? (
            <EmptyResults />
          ) : null}

          {predictError ? (
            <div className="card p-6">
              <Callout tone="warn" title="Prediction failed">
                {predictError}
              </Callout>
              <p className="mt-4 text-[0.8125rem] text-muted">
                The FastAPI service handles every prediction. If it is not
                running, start it from the project root, or continue in the{" "}
                <a
                  href="http://localhost:8501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-quiet text-forest-800"
                >
                  Streamlit dashboard
                </a>
                .
              </p>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {result && !predicting ? (
              <motion.div
                key={`${result.season}-${result.baseline[0]?.crop}-${result.baseline[0]?.score}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[0.9375rem] font-semibold text-forest-900">
                      Ranked historical patterns
                    </h2>
                    <p className="mt-1 text-[0.75rem] text-muted">
                      {result.method.model} · {result.method.features} features ·{" "}
                      {result.method.classes} classes
                    </p>
                  </div>
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-[0.75rem] font-medium text-forest-800">
                    {result.season} · {formatNumber(result.method.training_records ?? 0)} training records
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {result.baseline.slice(0, 3).map((item, index) => {
                    const top = index === 0;
                    return (
                      <motion.div
                        key={`${item.crop}-${item.rank}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.07,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn(
                          "flex flex-col justify-between rounded-2xl border p-5",
                          top
                            ? "border-forest-800 bg-forest-900"
                            : "border-line bg-white",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-[0.625rem] font-semibold tracking-[0.14em] uppercase",
                              top ? "text-lime-400" : "text-muted",
                            )}
                          >
                            {top ? "Top pattern" : `Rank ${item.rank}`}
                          </span>
                          {top ? (
                            <SproutIcon className="h-4 w-4 text-lime-400/70" />
                          ) : null}
                        </div>

                        <p
                          className={cn(
                            "mt-4 font-display text-[1.5rem] leading-tight tracking-[-0.02em]",
                            top ? "text-cream-50" : "text-forest-900",
                          )}
                        >
                          {item.crop}
                        </p>

                        <div className="mt-5">
                          <div className="flex items-baseline justify-between">
                            <span
                              className={cn(
                                "tabular font-display text-[1.75rem] leading-none",
                                top ? "text-cream-50" : "text-forest-900",
                              )}
                            >
                              {item.score.toFixed(2)}
                              <span className="ml-0.5 text-[0.875rem] opacity-60">
                                %
                              </span>
                            </span>
                            <span
                              className={cn(
                                "text-[0.625rem] tracking-[0.1em] uppercase",
                                top ? "text-cream-50/45" : "text-muted/70",
                              )}
                            >
                              model score
                            </span>
                          </div>
                          <div
                            className={cn(
                              "mt-2.5 h-1.5 overflow-hidden rounded-full",
                              top ? "bg-white/12" : "bg-cream-100",
                            )}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(100, item.score)}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: 0.15 + index * 0.07,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className={cn(
                                "h-full rounded-full",
                                top ? "bg-lime-400" : "bg-forest-700/60",
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-[0.875rem] font-semibold text-forest-900">
                        Score distribution
                      </h3>
                      <p className="mt-1 text-[0.75rem] text-muted">
                        All five highest-ranked labels for this profile
                      </p>
                    </div>
                    <ChartIcon className="h-4.5 w-4.5 text-forest-700/40" />
                  </div>
                  <div className="mt-4">
                    <ScoreChart
                      data={result.baseline.map((item) => ({
                        crop: item.crop,
                        score: item.score,
                      }))}
                    />
                  </div>
                </div>

                {visibleFlags.length > 0 ? (
                  <Callout tone="warn" title="Inputs outside the observed range">
                    <ul className="space-y-1">
                      {visibleFlags.slice(0, 3).map((flag) => (
                        <li key={`${flag.field}-${flag.issue}`}>{flag.detail}</li>
                      ))}
                    </ul>
                    The model still returns an answer, but it is extrapolating
                    beyond the data it was trained on.
                  </Callout>
                ) : null}

                {result.input_flags.some((flag) => flag.issue === "adjusted") ? (
                  <Callout tone="info" title="Values adjusted to physical bounds">
                    <ul className="space-y-1">
                      {result.input_flags
                        .filter((flag) => flag.issue === "adjusted")
                        .slice(0, 3)
                        .map((flag) => (
                          <li key={`${flag.field}-${flag.issue}`}>
                            {flag.detail}
                          </li>
                        ))}
                    </ul>
                  </Callout>
                ) : null}

                <div className="card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-[0.875rem] font-semibold text-forest-900">
                        Linked indigenous practices
                      </h3>
                      <p className="mt-1 text-[0.75rem] text-muted">
                        Matched by documented crop association only
                      </p>
                    </div>
                    <BookIcon className="h-4.5 w-4.5 text-forest-700/40" />
                  </div>

                  {result.practices.length > 0 ? (
                    <ul className="mt-5 divide-y divide-line">
                      {result.practices.map((practice) => (
                        <li key={practice.id} className="py-3.5 first:pt-0">
                          <Link
                            href="/practices"
                            className="group flex items-start justify-between gap-4"
                          >
                            <span>
                              <span className="block text-[0.875rem] font-medium text-forest-900">
                                {practice.name}
                              </span>
                              <span className="mt-0.5 block text-[0.75rem] text-muted">
                                {practice.region} · {practice.practice_type}
                              </span>
                            </span>
                            <ArrowRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-muted/40 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">
                      No documented practices in the knowledge base are linked
                      to these crop labels. The knowledge base currently covers
                      four practices from Northeast India.
                    </p>
                  )}
                </div>

                <Callout tone="info" title="How to read this result">
                  {result.disclaimers.score} {result.disclaimers.scope}
                </Callout>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* ------------------------------------------------- feature importance */}
      <section className="mt-14 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[0.9375rem] font-semibold text-forest-900">
                What the model relies on
              </h2>
              <p className="mt-1 max-w-md text-[0.75rem] leading-relaxed text-muted">
                The ten highest impurity-based importance scores from the
                trained Random Forest, read from the project&apos;s evaluation
                output.
              </p>
            </div>
            <TrendIcon className="h-4.5 w-4.5 shrink-0 text-forest-700/40" />
          </div>
          <div className="mt-6">
            {importance.length > 0 ? (
              <ImportanceChart data={importance} />
            ) : (
              <p className="text-[0.8125rem] text-muted">
                Importance values are unavailable until the API is reachable.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card p-6 md:p-7">
            <LayersIcon className="h-5 w-5 text-forest-700/60" />
            <h3 className="mt-3 text-[0.9375rem] font-semibold text-forest-900">
              Importance is reliance, not causation
            </h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
              A high score means the model used that feature often, not that the
              feature independently determines which crop is grown. Correlated
              features share importance, and district-level measurements
              compress real farm variation.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-forest-800"
            >
              Read the model methodology
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Callout tone="info">
            <span className="flex items-start gap-2">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This dashboard calls the same{" "}
              <code className="rounded bg-white/60 px-1 py-0.5 text-[0.75rem]">
                predict_top_crops
              </code>{" "}
              function used by the Streamlit application. The model is loaded
              once and never retrained here.
            </span>
          </Callout>
        </div>
      </section>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="dot-grid flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-cream-100/40 p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-forest-700 shadow-sm">
        <ChartIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-[1.5rem] text-forest-900">
        No prediction yet
      </h2>
      <p className="mt-2 max-w-sm text-[0.875rem] leading-relaxed text-muted">
        Set a season and adjust the soil and climate profile, then run the
        model. Results appear here with their evidence attached.
      </p>
      <ul className="mt-6 space-y-2 text-left">
        {EMPTY_HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[0.8125rem] text-muted"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forest-700/40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="card animate-pulse p-5">
            <div className="h-2.5 w-16 rounded-full bg-cream-100" />
            <div className="mt-5 h-6 w-28 rounded-full bg-cream-100" />
            <div className="mt-6 h-8 w-20 rounded-full bg-cream-100" />
            <div className="mt-3 h-1.5 w-full rounded-full bg-cream-100" />
          </div>
        ))}
      </div>
      <div className="card h-64 animate-pulse p-6" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-page py-16">
      <div className="h-4 w-40 animate-pulse rounded-full bg-cream-100" />
      <div className="mt-5 h-12 w-2/3 animate-pulse rounded-2xl bg-cream-100" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-cream-100" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="card h-[560px] animate-pulse" />
        <div className="card h-[420px] animate-pulse" />
      </div>
    </div>
  );
}
