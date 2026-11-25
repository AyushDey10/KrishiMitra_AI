"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { SeasonPicker } from "@/components/ui/field";
import {
  ArrowRightIcon,
  BookIcon,
  ChartIcon,
  CompassIcon,
  InfoIcon,
  TargetIcon,
} from "@/components/ui/icons";
import { apiGet, apiPost, OFFLINE_MESSAGE } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatMetric, formatNumber } from "@/lib/format";
import type {
  CropsResponse,
  Meta,
  Practice,
  PredictResponse,
  PracticesResponse,
} from "@/lib/types";

export function CropExplorer() {
  const [data, setData] = useState<CropsResponse | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [practiceMap, setPracticeMap] = useState<Record<string, Practice>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [selected, setSelected] = useState("Rice");
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("Kharif");

  const [ranking, setRanking] = useState<PredictResponse | null>(null);
  const [rankingPending, setRankingPending] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      apiGet<CropsResponse>("/crops"),
      apiGet<Meta>("/meta"),
      apiGet<PracticesResponse>("/practices"),
    ])
      .then(([cropsResponse, metaResponse, practicesResponse]) => {
        if (!alive) return;
        setData(cropsResponse);
        setMeta(metaResponse);
        setPracticeMap(
          Object.fromEntries(
            practicesResponse.items.map((practice) => [
              practice.id,
              practice,
            ]),
          ),
        );
        setSeason(
          metaResponse.seasons.includes("Kharif")
            ? "Kharif"
            : metaResponse.seasons[0],
        );
        if (
          cropsResponse.items.length > 0 &&
          !cropsResponse.items.some((item) => item.crop === "Rice")
        ) {
          setSelected(cropsResponse.items[0].crop);
        }
      })
      .catch((cause: unknown) => {
        if (!alive) return;
        setLoadError(cause instanceof Error ? cause.message : OFFLINE_MESSAGE);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const selectedItem = useMemo(
    () => data?.items.find((item) => item.crop === selected) ?? null,
    [data, selected],
  );

  // Where does this crop rank for a median profile in the selected season?
  useEffect(() => {
    if (!meta) return;
    let alive = true;
    setRankingPending(true);

    const profile = Object.fromEntries(
      meta.features.map((feature) => [feature.key, feature.median]),
    );

    apiPost<PredictResponse>("/predict", {
      season,
      features: profile,
      top_n: 10,
    })
      .then((response) => {
        if (alive) setRanking(response);
      })
      .catch(() => {
        if (alive) setRanking(null);
      })
      .finally(() => {
        if (alive) setRankingPending(false);
      });

    return () => {
      alive = false;
    };
  }, [meta, season]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data.items;
    return data.items.filter((item) =>
      item.crop.toLowerCase().includes(needle),
    );
  }, [data, query]);

  const scale = useMemo(() => {
    if (!data || !data.observed_fields.length) return null;
    const ranges: Record<string, { min: number; max: number }> = {};

    for (const field of data.observed_fields) {
      const values = data.items
        .map((item) => item.conditions[field.key])
        .filter(Boolean);

      ranges[field.key] = {
        min: Math.min(...values.map((value) => value.p25)),
        max: Math.max(...values.map((value) => value.p75)),
      };
    }

    return ranges;
  }, [data]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-4 w-44 animate-pulse rounded-full bg-cream-100" />
        <div className="mt-5 h-12 w-2/3 animate-pulse rounded-2xl bg-cream-100" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="card h-[520px] animate-pulse" />
          <div className="card h-[520px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl">
          <Callout tone="warn" title="Crop data is unavailable">
            {loadError ?? OFFLINE_MESSAGE}
          </Callout>
          <div className="mt-6">
            <Button onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const ranked = ranking?.baseline.find((item) => item.crop === selected);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-3xl">
        <span className="eyebrow">Crop intelligence</span>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em] text-forest-900">
          What the record shows
          <br />
          about a single crop.
        </h1>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted">
          Historical conditions, model reliability and documented practices for
          each of the {data.count} crop classes in the model.
        </p>
      </div>

      <div className="mt-8">
        <Callout tone="warn" title="This page is not a suitability assessment">
          KrishiMitra AI does not produce validated crop suitability advice.
          Everything below is either a model output or a descriptive statistic
          of the training data.
        </Callout>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start">
        {/* --------------------------------------------------------- crop list */}
        <aside className="card p-4 lg:sticky lg:top-24">
          <label className="relative block">
            <span className="sr-only">Search crops</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search crops"
              className="w-full rounded-lg border border-line bg-cream-50 px-3 py-2 text-[0.8125rem] text-ink placeholder:text-muted/60 focus:border-forest-700 focus:outline-none"
            />
          </label>

          <p className="mt-3 px-1 text-[0.6875rem] text-muted">
            {filtered.length} of {data.count} classes
          </p>

          <ul className="scroll-slim mt-2 max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
            {filtered.map((item) => {
              const active = item.crop === selected;
              return (
                <li key={item.crop}>
                  <button
                    type="button"
                    onClick={() => setSelected(item.crop)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[0.8125rem] transition-colors",
                      active
                        ? "bg-forest-800 text-cream-50"
                        : "text-ink hover:bg-cream-100",
                    )}
                  >
                    <span className="truncate">{item.crop}</span>
                    <span
                      className={cn(
                        "tabular text-[0.6875rem]",
                        active ? "text-cream-50/60" : "text-muted/70",
                      )}
                    >
                      {formatNumber(item.n)}
                    </span>
                  </button>
                </li>
              );
            })}

            {filtered.length === 0 ? (
              <li className="px-2 py-6 text-center text-[0.75rem] text-muted">
                No crop class matches “{query}”.
              </li>
            ) : null}
          </ul>
        </aside>

        {/* ------------------------------------------------------------ detail */}
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              key={selectedItem.crop}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="card p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted uppercase">
                      Crop class
                    </p>
                    <h2 className="mt-2 font-display text-[2rem] leading-none tracking-[-0.02em] text-forest-900">
                      {selectedItem.crop}
                    </h2>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="tabular font-display text-[1.5rem] leading-none text-forest-900">
                        {formatNumber(selectedItem.n)}
                      </p>
                      <p className="mt-1 text-[0.6875rem] text-muted">
                        historical rows
                      </p>
                    </div>
                    <div>
                      <p className="tabular font-display text-[1.5rem] leading-none text-forest-900">
                        {formatMetric(selectedItem.share, 2)}
                      </p>
                      <p className="mt-1 text-[0.6875rem] text-muted">
                        of training data
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------- model position */}
              <div className="card p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-forest-900">
                      <CompassIcon className="h-4 w-4 text-forest-700/60" />
                      Where it ranks for a median profile
                    </h3>
                    <p className="mt-1 max-w-lg text-[0.75rem] leading-relaxed text-muted">
                      A model run using dataset medians for every feature. This
                      is a classifier output for one synthetic profile, not a
                      statement about the crop.
                    </p>
                  </div>
                  <span className="text-[0.6875rem] text-muted">Season</span>
                </div>

                <div className="mt-4">
                  <SeasonPicker
                    seasons={meta?.seasons ?? []}
                    value={season}
                    onChange={setSeason}
                  />
                </div>

                <div className="mt-5 rounded-xl border border-line bg-cream-50 p-4">
                  {rankingPending ? (
                    <div className="h-12 animate-pulse rounded-lg bg-cream-100" />
                  ) : ranked ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-baseline gap-4">
                        <span className="tabular font-display text-[1.75rem] leading-none text-forest-900">
                          #{ranked.rank}
                        </span>
                        <span className="text-[0.8125rem] text-muted">
                          highest-ranked label for this profile
                        </span>
                      </div>
                      <span className="tabular rounded-full bg-forest-800 px-3 py-1.5 text-[0.8125rem] font-medium text-cream-50">
                        {ranked.score.toFixed(2)}% model score
                      </span>
                    </div>
                  ) : ranking ? (
                    <p className="text-[0.8125rem] leading-relaxed text-muted">
                      This crop is outside the ten highest-scoring labels for a
                      median {season} profile. That reflects how the classifier
                      routes this particular synthetic input — not whether the
                      crop can be grown.
                    </p>
                  ) : (
                    <p className="text-[0.8125rem] text-muted">
                      The model ranking could not be loaded.
                    </p>
                  )}
                </div>
              </div>

              {/* ----------------------------------------- observed conditions */}
              <div className="card p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-forest-900">
                      <ChartIcon className="h-4 w-4 text-forest-700/60" />
                      Observed historical conditions
                    </h3>
                    <p className="mt-1 max-w-xl text-[0.75rem] leading-relaxed text-muted">
                      Interquartile range of district-season rows labelled{" "}
                      {selectedItem.crop} (n = {formatNumber(selectedItem.n)}),
                      1997–2014. Bars are scaled across all 32 crop classes.
                    </p>
                  </div>
                </div>

                <dl className="mt-6 space-y-5">
                  {data.observed_fields.map((field) => {
                    const condition = selectedItem.conditions[field.key];
                    const range = scale?.[field.key];
                    if (!condition || !range || range.max <= range.min) {
                      return null;
                    }

                    const span = range.max - range.min;
                    const left = ((condition.p25 - range.min) / span) * 100;
                    const width =
                      ((condition.p75 - condition.p25) / span) * 100;
                    const median =
                      ((condition.median - range.min) / span) * 100;

                    return (
                      <div key={field.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-[0.8125rem] font-medium text-ink">
                            {field.label}
                          </dt>
                          <dd className="tabular text-[0.75rem] text-muted">
                            {formatNumber(condition.p25, field.decimals)} —{" "}
                            <span className="font-medium text-forest-900">
                              {formatNumber(condition.median, field.decimals)}
                            </span>{" "}
                            — {formatNumber(condition.p75, field.decimals)}{" "}
                            <span className="text-muted/70">{field.unit}</span>
                          </dd>
                        </div>

                        <div className="relative mt-2 h-2 rounded-full bg-cream-100">
                          <div
                            className="absolute inset-y-0 rounded-full bg-sage-200"
                            style={{ left: `${left}%`, width: `${width}%` }}
                          />
                          <span
                            className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-forest-800"
                            style={{ left: `${median}%` }}
                          />
                        </div>

                        <div className="tabular mt-1 flex justify-between text-[0.625rem] text-muted/60">
                          <span>{formatNumber(range.min, field.decimals)}</span>
                          <span>{formatNumber(range.max, field.decimals)}</span>
                        </div>
                      </div>
                    );
                  })}
                </dl>

                <p className="mt-6 flex items-start gap-2 border-t border-line pt-4 text-[0.6875rem] leading-relaxed text-muted/80">
                  <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  These are descriptive statistics, not thresholds. A crop
                  appearing across a wide rainfall range reflects where it was
                  historically grown, not where it should be grown.
                </p>
              </div>

              {/* ---------------------------------------------- class metrics */}
              <div className="card p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-forest-900">
                      <TargetIcon className="h-4 w-4 text-forest-700/60" />
                      Model reliability for this class
                    </h3>
                    <p className="mt-1 max-w-xl text-[0.75rem] leading-relaxed text-muted">
                      Class-level scores from the project&apos;s district-grouped
                      evaluation. Support counts the held-out rows for this
                      crop.
                    </p>
                  </div>
                  {selectedItem.metrics ? (
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[0.625rem] font-semibold tracking-[0.08em] uppercase",
                        selectedItem.metrics.f1 >= 0.6
                          ? "bg-sage-100 text-forest-800"
                          : selectedItem.metrics.f1 >= 0.4
                            ? "bg-amber-600/10 text-amber-600"
                            : "bg-rust-600/10 text-rust-600",
                      )}
                    >
                      {selectedItem.metrics.f1 >= 0.6
                        ? "Reliable class"
                        : selectedItem.metrics.f1 >= 0.4
                          ? "Moderate class"
                          : "Weaker class"}
                    </span>
                  ) : null}
                </div>

                {selectedItem.metrics ? (
                  <>
                    <div className="mt-6 space-y-4">
                      {[
                        {
                          label: "Precision",
                          value: selectedItem.metrics.precision,
                        },
                        { label: "Recall", value: selectedItem.metrics.recall },
                        {
                          label: "F1 score",
                          value: selectedItem.metrics.f1,
                        },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex items-baseline justify-between">
                            <span className="text-[0.8125rem] text-ink">
                              {metric.label}
                            </span>
                            <span className="tabular text-[0.8125rem] font-medium text-forest-900">
                              {formatMetric(metric.value)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-100">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{
                                width: `${metric.value * 100}%`,
                              }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.7,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className={cn(
                                "h-full rounded-full",
                                metric.value >= 0.6
                                  ? "bg-forest-700"
                                  : metric.value >= 0.4
                                    ? "bg-amber-600/70"
                                    : "bg-rust-600/70",
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                      <p className="text-[0.75rem] leading-relaxed text-muted">
                        Recall of {formatMetric(selectedItem.metrics.recall)}{" "}
                        means the model finds roughly{" "}
                        {Math.round(selectedItem.metrics.recall * 100)} of every
                        100 rows actually labelled {selectedItem.crop}.
                      </p>
                      <p className="tabular text-[0.75rem] text-muted">
                        Held-out support:{" "}
                        {formatNumber(selectedItem.metrics.support)} rows
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-[0.8125rem] text-muted">
                    Class-level metrics are not available for this label.
                  </p>
                )}
              </div>

              {/* -------------------------------------------------- practices */}
              <div className="card p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-forest-900">
                      <BookIcon className="h-4 w-4 text-forest-700/60" />
                      Documented practices linked to {selectedItem.crop}
                    </h3>
                    <p className="mt-1 text-[0.75rem] text-muted">
                      Matched by crop association in the knowledge base
                    </p>
                  </div>
                </div>

                {selectedItem.practices.length > 0 ? (
                  <ul className="mt-5 divide-y divide-line">
                    {selectedItem.practices.map((id) => {
                      const practice = practiceMap[id];
                      if (!practice) return null;
                      return (
                        <li key={id} className="py-3.5 first:pt-0">
                          <Link
                            href="/practices"
                            className="group flex items-start justify-between gap-4"
                          >
                            <span>
                              <span className="block text-[0.875rem] font-medium text-forest-900">
                                {practice.name}
                              </span>
                              <span className="mt-0.5 block text-[0.75rem] text-muted">
                                {practice.region} · {practice.state}
                              </span>
                            </span>
                            <ArrowRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-muted/40 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">
                    No documented practice in the current knowledge base is
                    linked to this crop. The knowledge base covers four
                    practices from Northeast India.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/dashboard" variant="outline" size="sm">
                  Run a full prediction
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
                <ButtonLink href="/simulator" variant="ghost" size="sm">
                  Test a rainfall scenario
                </ButtonLink>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
