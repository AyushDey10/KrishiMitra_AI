import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  ArrowUpRightIcon,
  BookIcon,
  DatabaseIcon,
  GithubIcon,
  LayersIcon,
  TargetIcon,
} from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { Badge, SectionHeading, StatBlock } from "@/components/ui/section";
import { formatMetric, formatNumber } from "@/lib/format";
import { serverGet } from "@/lib/server-api";
import type { Meta, MetricsResponse } from "@/lib/types";

export const metadata: Metadata = {
  title: "About",
  description:
    "Project overview, dataset provenance, model methodology, evaluation results and limitations for KrishiMitra AI.",
};

export const dynamic = "force-dynamic";

const datasetSources = [
  {
    component: "Crop area and production",
    source: "Government of India, DES / data.gov.in",
    detail:
      "District-wise, season-wise crop production statistics, 1997-98 to 2014-15. Government Open Data Licence India.",
  },
  {
    component: "Soil properties",
    source: "ISRIC SoilGrids 2.0",
    detail:
      "pH, total N, organic carbon, CEC, texture, bulk density and coarse fragments at 1 km, aggregated to district means. CC BY 4.0.",
  },
  {
    component: "Climate",
    source: "NASA POWER",
    detail:
      "Seasonal temperature, humidity, precipitation, radiation and wind at a district representative point. Public domain.",
  },
  {
    component: "District boundaries",
    source: "india_shp_2020",
    detail:
      "735 district polygons with Census 2011 and LGD codes, used for zonal statistics and centroids.",
  },
];

const limitations = [
  {
    title: "No phosphorus or potassium",
    detail:
      "SoilGrids provides no P, K, EC or micronutrients. Total nitrogen is not equivalent to Soil Health Card available nitrogen.",
  },
  {
    title: "District aggregation",
    detail:
      "Soil is a district mean of 1 km pixels and climate comes from one representative point, so within-district variation is lost.",
  },
  {
    title: "Labels encode economics",
    detail:
      "The dominant crop reflects irrigation, markets and minimum support prices as much as agronomy. It is an observed outcome, not an optimum.",
  },
  {
    title: "Spatial autocorrelation",
    detail:
      "Rows from the same district across years are near-duplicates in soil features. Evaluation therefore groups by district rather than splitting records randomly.",
  },
  {
    title: "Class imbalance",
    detail:
      "Rice accounts for roughly 30% of the modelling rows, which is why balanced accuracy and macro F1 are reported alongside accuracy.",
  },
  {
    title: "Retrospective design",
    detail:
      "Climate features are observed seasonal conditions, so the model classifies historical profiles rather than forecasting a season ahead.",
  },
];

export default async function AboutPage() {
  const [meta, metrics] = await Promise.all([
    serverGet<Meta>("/meta"),
    serverGet<MetricsResponse>("/metrics"),
  ]);

  const means = metrics?.means;
  const dataset = meta?.dataset;

  const foldRange = (key: keyof NonNullable<MetricsResponse["means"]>) => {
    if (!metrics) return null;
    const values = metrics.folds.map((fold) => fold[key]);
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  const metricRows = means
    ? [
        {
          label: "Accuracy",
          value: means.accuracy,
          note: "Share of held-out rows where the top label was correct.",
        },
        {
          label: "Balanced accuracy",
          value: means.balanced_accuracy,
          note: "Per-class recall averaged equally, so large classes do not dominate.",
        },
        {
          label: "Macro F1",
          value: means.macro_f1,
          note: "Unweighted mean F1 across all 32 crop classes.",
        },
        {
          label: "Top-3 accuracy",
          value: means.top_3_accuracy,
          note: "Share of rows where the true label appeared in the top three.",
        },
      ]
    : [];

  return (
    <div className="pb-8">
      {/* ------------------------------------------------------------- header */}
      <section className="container-page pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="eyebrow">About the project</span>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.0] tracking-[-0.03em] text-forest-900">
              A research prototype built to be read critically.
            </h1>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
              KrishiMitra AI explores how machine learning and documented
              indigenous farming knowledge can sit side by side in one
              interface. It classifies historical crop patterns from soil,
              climate and season — and shows its evaluation, its data
              provenance and its limits alongside every result.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Badge tone="sage">
                <TargetIcon className="h-3 w-3" />
                Academic project
              </Badge>
              <Badge tone="outline">Random Forest · 300 trees</Badge>
              <Badge tone="outline">1997–2014</Badge>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
            <Image
              src="/images/farmland-golden.jpg"
              alt="Indian farmland at golden hour with a treeline on the horizon"
              fill
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 via-transparent to-transparent" />
            <p className="absolute bottom-0 left-0 right-0 p-5 text-[0.6875rem] leading-relaxed text-cream-50/80">
              District-level agricultural records, not farm-level measurements.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- facts */}
      <section className="container-page mt-14">
        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-line bg-white p-7 sm:grid-cols-4 md:p-9">
          <StatBlock
            value={formatNumber(dataset?.records ?? 34173)}
            label="Modelling records"
            note={`from ${formatNumber(dataset?.raw_records ?? 34903)} raw rows`}
          />
          <StatBlock
            value={formatNumber(dataset?.districts ?? 652)}
            label="Districts"
            note={`${dataset?.states ?? 34} states and UTs`}
          />
          <StatBlock
            value={formatNumber(dataset?.crop_classes ?? 32)}
            label="Crop classes"
            note="100+ records each"
          />
          <StatBlock
            value="32"
            label="Model features"
            note="20 soil · 11 climate · season"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- dataset */}
      <section className="container-page mt-20 md:mt-28">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Dataset"
              title="Built from public, citable sources."
              lede="One row is one district × agricultural year × season, with soil and climate features and the crop actually grown. Nothing here was scraped from an unattributed dataset."
            />
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-line bg-cream-100/50 p-4">
              <DatabaseIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest-700/60" />
              <p className="text-[0.75rem] leading-relaxed text-muted">
                Soil and climate values are district-level representations. They
                are not measurements from an individual field.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {datasetSources.map((row) => (
                <div key={row.component} className="p-5 md:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[0.875rem] font-semibold text-forest-900">
                      {row.component}
                    </h3>
                    <span className="text-[0.75rem] font-medium text-forest-700">
                      {row.source}
                    </span>
                  </div>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                    {row.detail}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- methodology */}
      <section
        id="methodology"
        className="mt-20 scroll-mt-24 border-y border-line bg-cream-100/60 md:mt-28"
      >
        <div className="container-page py-20 md:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="Methodology"
              title="A pipeline, a group split, and an honest test."
              lede="The model is a single scikit-learn pipeline: passthrough numeric features, one-hot encoded season, and a class-weighted Random Forest."
            />
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <div className="card p-6 md:p-7">
                <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-forest-900">
                  <LayersIcon className="h-4 w-4 text-forest-700/60" />
                  Configuration
                </h3>
                <dl className="mt-5 space-y-3.5 text-[0.8125rem]">
                  {[
                    ["Estimators", "300 trees"],
                    ["Max features", "sqrt"],
                    ["Min samples per leaf", "2"],
                    ["Class weighting", "balanced_subsample"],
                    ["Season encoding", "One-hot, unknown ignored"],
                    ["Random state", "42"],
                    ["Validation", "Stratified group K-fold, k = 5"],
                    ["Grouping variable", "District key"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-muted">{label}</dt>
                      <dd className="text-right font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="card p-6 md:p-7">
                <h3 className="text-[0.9375rem] font-semibold text-forest-900">
                  Why districts are held out
                </h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">
                  Records from the same district share nearly identical soil
                  values across years. A random split would let the model
                  memorise a district and report inflated accuracy. Grouping by
                  district forces every evaluation fold to contain districts the
                  model has never seen.
                </p>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">
                  The gap between random and grouped splits — 82.4% versus 70.9%
                  on the same data — is the leakage effect this design removes.
                </p>

                <div className="mt-6 rounded-xl bg-forest-900 p-5 text-cream-50">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-lime-400 uppercase">
                    Reported result
                  </p>
                  <p className="mt-2 font-display text-[2rem] leading-none">
                    {means ? formatMetric(means.accuracy) : "—"}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-cream-50/60">
                    mean accuracy across five district-grouped folds
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* evaluation table */}
          <Reveal>
            <div className="card mt-6 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
                <h3 className="text-[0.9375rem] font-semibold text-forest-900">
                  Cross-validation results
                </h3>
                <span className="text-[0.6875rem] text-muted">
                  {metrics?.source ??
                    "Read from documentation/random_forest_cv_results.csv"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[0.8125rem]">
                  <thead>
                    <tr className="border-b border-line bg-cream-100/50 text-[0.6875rem] tracking-[0.1em] text-muted uppercase">
                      <th className="px-6 py-3 font-semibold">Metric</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Mean
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Fold range
                      </th>
                      <th className="px-6 py-3 font-semibold">Reading</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricRows.map((row) => {
                      const range = foldRange(
                        row.label === "Accuracy"
                          ? "accuracy"
                          : row.label === "Balanced accuracy"
                            ? "balanced_accuracy"
                            : row.label === "Macro F1"
                              ? "macro_f1"
                              : "top_3_accuracy",
                      );
                      return (
                        <tr
                          key={row.label}
                          className="border-b border-line/70 last:border-0"
                        >
                          <td className="px-6 py-4 font-medium text-forest-900">
                            {row.label}
                          </td>
                          <td className="tabular px-4 py-4 text-right text-ink">
                            {formatMetric(row.value)}
                          </td>
                          <td className="tabular px-4 py-4 text-right text-muted">
                            {range
                              ? `${formatMetric(range.min)}–${formatMetric(range.max)}`
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-[0.75rem] leading-relaxed text-muted">
                            {row.note}
                          </td>
                        </tr>
                      );
                    })}

                    {metricRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-muted"
                        >
                          Evaluation results are served by the API.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <div className="mt-5">
            <Callout tone="warn" title="What these numbers do not mean">
              Accuracy and macro F1 differ substantially because performance is
              uneven across classes. A score returned by the model is not a
              calibrated probability, a yield estimate or a likelihood of
              success.
            </Callout>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- limitations */}
      <section className="container-page mt-20 md:mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Limitations"
            title="Six constraints we state plainly."
            lede="These are properties of the data and the design, not bugs to be patched later."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {limitations.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <div className="h-full rounded-2xl border border-line bg-white p-6">
                <span className="tabular font-display text-[1.5rem] leading-none text-forest-700/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-forest-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                  {item.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- team */}
      <section className="container-page mt-20 md:mt-28">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card flex h-full flex-col p-7 md:p-8">
              <BookIcon className="h-5 w-5 text-forest-700/60" />
              <h2 className="mt-4 font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-forest-900">
                Project &amp; team
              </h2>
              <dl className="mt-6 space-y-3.5 text-[0.8125rem]">
                <div className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-3">
                  <dt className="text-muted">Submitted by</dt>
                  <dd className="text-right font-medium text-ink">
                    Team KrishiMitra AI
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-3">
                  <dt className="text-muted">School</dt>
                  <dd className="text-right font-medium text-ink">
                    PM SHRI Kendriya Vidyalaya Barrackpore (A.F.S)
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-3">
                  <dt className="text-muted">Academic year</dt>
                  <dd className="text-right font-medium text-ink">2026–2027</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">Showcase</dt>
                  <dd className="text-right font-medium text-ink">
                    RSBVP project showcase
                  </dd>
                </div>
              </dl>

              <p className="mt-6 text-[0.75rem] leading-relaxed text-muted">
                Developed as an academic team project. The report, data card and
                model evaluation documentation live in the repository.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="panel-dark flex h-full flex-col justify-between p-7 md:p-8">
              <div>
                <h2 className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-cream-50">
                  Source, report and fallback
                </h2>
                <p className="mt-3 max-w-md text-[0.875rem] leading-relaxed text-cream-50/60">
                  The Streamlit dashboard remains the original research
                  interface and runs on the same model. This website is a
                  presentation layer over it, not a replacement.
                </p>

                <ul className="mt-6 space-y-2.5 text-[0.8125rem] text-cream-50/70">
                  <li>app.py — Streamlit dashboard</li>
                  <li>src/models/predict.py — prediction entry point</li>
                  <li>data/knowledge_base/practices.json — practice records</li>
                  <li>documentation/ — evaluation and data card</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink
                  href="https://github.com/AyushDey10/KrishiMitra_AI"
                  variant="lime"
                  size="md"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub repository
                </ButtonLink>
                <ButtonLink
                  href="http://localhost:8501"
                  variant="onDark"
                  size="md"
                >
                  Streamlit dashboard
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page mt-16">
        <p className="mx-auto max-w-3xl text-center text-[0.75rem] leading-relaxed text-muted/80">
          KrishiMitra AI — Data-driven agricultural insights supported by
          traditional farming knowledge. Model scores are historical classifier
          outputs and must not be used as agronomic advice.
        </p>
      </section>
    </div>
  );
}
