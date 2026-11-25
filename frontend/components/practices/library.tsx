"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  ArrowUpRightIcon,
  BookIcon,
  CheckIcon,
  SproutIcon,
} from "@/components/ui/icons";
import { apiGet, OFFLINE_MESSAGE } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { PracticesResponse } from "@/lib/types";

export function PracticeLibrary() {
  const [data, setData] = useState<PracticesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [crop, setCrop] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    apiGet<PracticesResponse>("/practices")
      .then((response) => {
        if (alive) setData(response);
      })
      .catch((cause: unknown) => {
        if (alive) {
          setError(cause instanceof Error ? cause.message : OFFLINE_MESSAGE);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const items = useMemo(() => {
    if (!data) return [];
    return data.items.filter((practice) => {
      const cropMatch =
        !crop ||
        practice.associated_crops.some(
          (entry) => entry.toLowerCase() === crop.toLowerCase(),
        );
      const regionMatch = !region || practice.region === region;
      return cropMatch && regionMatch;
    });
  }, [data, crop, region]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-4 w-40 animate-pulse rounded-full bg-cream-100" />
        <div className="mt-5 h-12 w-2/3 animate-pulse rounded-2xl bg-cream-100" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="card h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl">
          <Callout tone="warn" title="The knowledge base is unavailable">
            {error ?? OFFLINE_MESSAGE}
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

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-3xl">
        <span className="eyebrow">Indigenous farming practices</span>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em] text-forest-900">
          Knowledge that predates
          <br />
          the model.
        </h1>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted">
          {data.count} documented practices from Northeast India, each recorded
          with its region, associated crops, purpose, required conditions,
          limitations and public source.
        </p>
      </div>

      {/* ---------------------------------------------------------- filters */}
      <div className="mt-9 flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase">
            Crop
          </span>
          <FilterChip
            label="All crops"
            active={crop === null}
            onClick={() => setCrop(null)}
          />
          {data.filters.crops.map((entry) => (
            <FilterChip
              key={entry}
              label={entry}
              active={crop === entry}
              onClick={() => setCrop(crop === entry ? null : entry)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="mr-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase">
            Region
          </span>
          <FilterChip
            label="All regions"
            active={region === null}
            onClick={() => setRegion(null)}
          />
          {data.filters.regions.map((entry) => (
            <FilterChip
              key={entry}
              label={entry}
              active={region === entry}
              onClick={() => setRegion(region === entry ? null : entry)}
            />
          ))}
        </div>

        <p className="text-[0.6875rem] leading-relaxed text-muted/80">
          {data.matching}
        </p>
      </div>

      {/* ------------------------------------------------------------ cards */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-[0.8125rem] text-muted">
          Showing {items.length} of {data.count} practices
        </p>
        {crop || region ? (
          <button
            type="button"
            onClick={() => {
              setCrop(null);
              setRegion(null);
            }}
            className="text-[0.75rem] font-medium text-forest-800 underline decoration-line underline-offset-4"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid items-start gap-5 md:grid-cols-2">
          {items.map((practice, index) => {
            const open = openId === practice.id;
            return (
              <motion.article
                key={practice.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "card flex flex-col p-6 transition-colors",
                  open && "border-forest-800/25",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="tabular text-[0.6875rem] font-semibold tracking-[0.12em] text-muted/70">
                      {practice.id}
                    </p>
                    <h2 className="mt-2 font-display text-[1.375rem] leading-tight tracking-[-0.02em] text-forest-900">
                      {practice.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-sage-100 px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.06em] text-forest-800 uppercase">
                    {practice.evidence_status}
                  </span>
                </div>

                <p className="mt-2 text-[0.75rem] text-muted">
                  {practice.region} · {practice.state}
                </p>

                <p className="mt-4 text-[0.875rem] leading-relaxed text-muted">
                  {practice.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-[0.6875rem] tracking-[0.08em] text-muted/70 uppercase">
                    Crops
                  </span>
                  {practice.associated_crops.map((entry) => (
                    <span
                      key={entry}
                      className="rounded-full border border-line px-2.5 py-0.5 text-[0.6875rem] text-forest-800"
                    >
                      {entry}
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : practice.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="text-[0.8125rem] font-medium text-forest-800">
                      {open ? "Hide details" : "Read full record"}
                    </span>
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border border-line transition-transform duration-300",
                        open && "rotate-180 bg-cream-100",
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        className="h-3.5 w-3.5 text-forest-700"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-4">
                          <div>
                            <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase">
                              Purpose
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {practice.purpose.map((entry) => (
                                <li
                                  key={entry}
                                  className="flex items-start gap-2 text-[0.8125rem] text-ink"
                                >
                                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700/60" />
                                  {entry}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase">
                              Conditions
                            </p>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                              {practice.conditions}
                            </p>
                          </div>

                          <div className="rounded-xl bg-amber-600/[0.05] p-3.5">
                            <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-amber-600 uppercase">
                              Limitations
                            </p>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-amber-600/90">
                              {practice.limitations}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                            <span className="text-[0.75rem] text-muted">
                              {practice.practice_type}
                            </span>
                            <a
                              href={practice.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-forest-800 transition-colors hover:text-forest-700"
                            >
                              View source
                              <ArrowUpRightIcon className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="dot-grid mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-cream-100/40 px-6 py-16 text-center">
          <BookIcon className="h-6 w-6 text-forest-700/40" />
          <p className="mt-4 font-display text-[1.25rem] text-forest-900">
            No practice matches both filters
          </p>
          <p className="mt-2 max-w-sm text-[0.8125rem] text-muted">
            The knowledge base records four practices, and each is linked to
            specific crops. Try widening the crop or region filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => {
              setCrop(null);
              setRegion(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-line bg-cream-100/50 p-6">
        <div className="flex items-start gap-3">
          <SproutIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-forest-700/60" />
          <p className="max-w-3xl text-[0.75rem] leading-relaxed text-muted">
            These records are presented for documentation and education. They
            are not personalised recommendations. Each practice depends on
            terrain, water availability and local knowledge that a web
            interface cannot assess.
          </p>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-all duration-200",
        active
          ? "border-forest-800 bg-forest-800 text-cream-50"
          : "border-line bg-cream-50 text-muted hover:border-forest-800/25 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
