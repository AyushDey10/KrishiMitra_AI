import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookIcon,
  ChartIcon,
  CheckIcon,
  LayersIcon,
  RainIcon,
  SproutIcon,
  TargetIcon,
} from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { Badge, SectionHeading, StatBlock } from "@/components/ui/section";
import { formatMetric, formatNumber } from "@/lib/format";
import { serverGet } from "@/lib/server-api";
import type { Meta, MetricsResponse, PracticesResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const capabilities = [
  {
    icon: ChartIcon,
    title: "Historical crop patterns",
    copy: "A Random Forest classifier learns which crop labels co-occur with soil, climate and seasonal conditions across 652 Indian districts.",
    href: "/dashboard",
    link: "Run a prediction",
  },
  {
    icon: RainIcon,
    title: "Rainfall sensitivity",
    copy: "Shift seasonal rainfall between −50% and +50% and watch how the model's ranked output responds. A sensitivity test, not a forecast.",
    href: "/simulator",
    link: "Open the simulator",
  },
  {
    icon: BookIcon,
    title: "Documented practices",
    copy: "Four indigenous farming practices from Northeast India, each with its region, crops, conditions, limitations and cited source.",
    href: "/practices",
    link: "Read the knowledge base",
  },
];

const steps = [
  {
    number: "01",
    title: "Describe the conditions",
    copy: "Choose a growing season and set soil and climate values. Five essential inputs are enough to start; all 32 are available in advanced settings.",
  },
  {
    number: "02",
    title: "The model reads the profile",
    copy: "Twenty soil features, eleven climate features and the season are assembled into the exact feature vector the trained pipeline expects.",
  },
  {
    number: "03",
    title: "Ranked historical patterns",
    copy: "The classifier returns its highest-scoring crop labels. Scores are model outputs over historical labels — never success probabilities.",
  },
  {
    number: "04",
    title: "Evidence alongside output",
    copy: "Observed historical ranges, class-level precision and recall, and any documented practices linked to those crops appear together.",
  },
];

export default async function HomePage() {
  const [meta, metrics, practices] = await Promise.all([
    serverGet<Meta>("/meta"),
    serverGet<MetricsResponse>("/metrics"),
    serverGet<PracticesResponse>("/practices"),
  ]);

  const dataset = meta?.dataset;
  const means = metrics?.means;

  const stats = [
    {
      value: formatNumber(dataset?.records ?? 34173),
      label: "Modelling records",
      note: "1997–2014, district-season",
    },
    {
      value: formatNumber(dataset?.districts ?? 652),
      label: "Districts",
      note: "Across 34 states and UTs",
    },
    {
      value: formatNumber(dataset?.crop_classes ?? 32),
      label: "Crop classes",
      note: "Classes with 100+ records",
    },
    {
      value: formatNumber(dataset?.seasons ?? 6),
      label: "Seasons",
      note: "Kharif to Whole Year",
    },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="container-page pt-4 md:pt-6">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-forest-900 md:rounded-[2rem]">
          <Image
            src="/images/hero-terraces.jpg"
            alt="Terraced paddy fields in Northeast India at dawn, soft mist between the terraces"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900 via-forest-900/92 to-forest-900/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-transparent to-forest-900/10" />

          <div className="relative px-6 py-14 sm:px-10 sm:py-18 md:px-14 md:py-24 lg:py-28">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[0.6875rem] font-semibold tracking-[0.14em] text-cream-50/80 uppercase backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                Research prototype · India District Crop Dataset
              </span>

              <h1 className="display mt-7 text-cream-50">
                Agricultural Intelligence,
                <br />
                <span className="text-lime-400">Rooted in Evidence.</span>
              </h1>

              <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-cream-50/70">
                KrishiMitra AI reads soil, climate and season, then ranks the
                crop patterns a trained Random Forest associates with those
                conditions — with the evaluation, the observed data and the
                limitations shown alongside the output.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/dashboard" variant="lime" size="lg">
                  Explore the dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/about" variant="onDark" size="lg">
                  Read the model card
                </ButtonLink>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/12 pt-8 sm:grid-cols-4 md:mt-16">
              {stats.map((stat) => (
                <StatBlock
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  note={stat.note}
                  light
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ capabilities */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="What the platform does"
            title="Three layers of agricultural evidence, in one place."
            lede="A statistical model, an honest evaluation, and a documented knowledge base — presented together so the output can be read in context."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <Reveal key={capability.title} delay={index * 0.07}>
                <article className="card card-hover flex h-full flex-col gap-5 p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-forest-800">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="h3 text-forest-900">{capability.title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                      {capability.copy}
                    </p>
                  </div>
                  <ButtonLink
                    href={capability.href}
                    variant="ghost"
                    size="sm"
                    className="group -ml-4 w-fit"
                  >
                    {capability.link}
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </ButtonLink>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------- how it works */}
      <section className="border-y border-line bg-cream-100/70">
        <div className="container-page py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="How it works"
                title="From a soil profile to a ranked pattern."
                lede="Four steps, each one traceable. Nothing is generated that the model or the dataset did not produce."
              />
              <div className="mt-8 hidden rounded-2xl border border-line bg-white p-5 lg:block">
                <p className="text-[0.75rem] font-semibold tracking-[0.14em] text-muted uppercase">
                  Model card
                </p>
                <dl className="mt-4 space-y-3 text-[0.8125rem]">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">Algorithm</dt>
                    <dd className="text-right font-medium text-ink">
                      Random Forest · 300 trees
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">Inputs</dt>
                    <dd className="text-right font-medium text-ink">
                      20 soil · 11 climate · season
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">Crop classes</dt>
                    <dd className="tabular text-right font-medium text-ink">
                      {dataset?.crop_classes ?? 32}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">Validation</dt>
                    <dd className="text-right font-medium text-ink">
                      Grouped by district
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <Reveal key={step.number} delay={index * 0.06}>
                  <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-cream-50 p-6">
                    <span className="tabular font-display text-[1.75rem] leading-none text-forest-700/35">
                      {step.number}
                    </span>
                    <h3 className="text-[1.0625rem] font-semibold text-forest-900">
                      {step.title}
                    </h3>
                    <p className="text-[0.875rem] leading-relaxed text-muted">
                      {step.copy}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ metrics */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <div className="panel-dark relative overflow-hidden px-7 py-12 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-lime-400/[0.07] blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <SectionHeading
                  eyebrow="Evaluation"
                  title="Measured on districts the model never saw."
                  lede="Five-fold stratified group cross-validation, with districts held out of each fold — a stricter test than a random record split."
                  light
                />
                <p className="mt-6 flex items-center gap-2 text-[0.75rem] text-cream-50/45">
                  <CheckIcon className="h-3.5 w-3.5 text-lime-400" />
                  Read directly from the project&apos;s evaluation CSV
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-2">
                {means ? (
                  <>
                    <StatBlock
                      value={formatMetric(means.accuracy)}
                      label="Accuracy"
                      note="Correct top-1 label"
                      light
                    />
                    <StatBlock
                      value={formatMetric(means.balanced_accuracy)}
                      label="Balanced accuracy"
                      note="Equal weight per class"
                      light
                    />
                    <StatBlock
                      value={formatMetric(means.macro_f1)}
                      label="Macro F1"
                      note="Averaged across classes"
                      light
                    />
                    <StatBlock
                      value={formatMetric(means.top_3_accuracy)}
                      label="Top-3 accuracy"
                      note="Label appears in top three"
                      light
                    />
                  </>
                ) : (
                  <div className="col-span-2">
                    <Callout tone="dark" title="Live metrics unavailable">
                      The evaluation figures are served by the FastAPI service.
                      Start it to load the project&apos;s recorded results.
                    </Callout>
                  </div>
                )}
              </div>
            </div>

            <p className="relative mt-10 max-w-3xl border-t border-white/10 pt-6 text-[0.75rem] leading-relaxed text-cream-50/40">
              Accuracy and macro F1 differ substantially because performance
              varies across crop classes. Rice, Wheat and Bajra are recognised
              far more reliably than classes such as Dry ginger or Banana.
              Scores are not calibrated probabilities of crop success.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ----------------------------------------------------------- practices */}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <Image
                src="/images/apatani-terraces.jpg"
                alt="Water-filled terraced fields beneath forested hills, illustrative of terraced cultivation in Northeast India"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-lime-400 uppercase">
                  Knowledge base
                </p>
                <p className="mt-2 font-display text-[1.375rem] leading-snug text-cream-50">
                  Four documented practices, each with conditions and limits.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <SectionHeading
                eyebrow="Indigenous practices"
                title="Traditional knowledge, documented — not invented."
                lede="Each record carries its region, associated crops, purpose, required conditions, limitations, evidence status and a public source."
              />
            </Reveal>

            <div className="mt-8 flex flex-col divide-y divide-line border-y border-line">
              {(practices?.items ?? []).slice(0, 3).map((practice, index) => (
                <Reveal key={practice.id} delay={index * 0.05}>
                  <a
                    href="/practices"
                    className="group flex items-start gap-4 py-5 transition-colors"
                  >
                    <span className="tabular mt-1 text-[0.6875rem] font-semibold tracking-[0.1em] text-muted/70">
                      {practice.id}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-display text-[1.0625rem] text-forest-900">
                        {practice.name}
                        <ArrowUpRightIcon className="h-3.5 w-3.5 text-muted/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-forest-700" />
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-muted">
                        {practice.region} · {practice.state} ·{" "}
                        {practice.associated_crops.join(", ")}
                      </span>
                    </span>
                  </a>
                </Reveal>
              ))}

              {!practices ? (
                <p className="py-6 text-[0.875rem] text-muted">
                  The knowledge base is served by the API. Start the backend to
                  load the documented practices.
                </p>
              ) : null}
            </div>

            <div className="mt-7">
              <ButtonLink href="/practices" variant="outline" size="sm">
                Browse all practices
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ responsible use */}
      <section className="border-y border-line bg-cream-100/70">
        <div className="container-page py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="Responsible use"
                title="What this platform is not."
                lede="A prototype that hides its limits is a worse prototype. These four constraints shape every number on this site."
              />
              <div className="mt-8">
                <Badge tone="outline">
                  <TargetIcon className="h-3 w-3" />
                  Scope statement
                </Badge>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Retrospective, not a forecast",
                  copy: "Climate inputs describe observed seasonal conditions from 1997–2014. The model classifies a historical profile; it does not forecast a coming season.",
                },
                {
                  title: "District-level, not farm-level",
                  copy: "Soil values are district means of 1 km grids and climate is sampled at one representative point. Within-district variation is lost.",
                },
                {
                  title: "Uncalibrated scores",
                  copy: "A 41% score means the classifier assigned 41% of its weight to that class — not a 41% chance of a successful crop.",
                },
                {
                  title: "No suitability claim",
                  copy: "There is no validated crop suitability engine. Practice matching uses documented crop association only, not geography or farm conditions.",
                },
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05}>
                  <div className="h-full rounded-2xl border border-line bg-cream-50 p-6">
                    <LayersIcon className="h-4.5 w-4.5 text-forest-700/60" />
                    <h3 className="mt-3 text-[0.9375rem] font-semibold text-forest-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                      {item.copy}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- CTA */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <div className="panel-dark relative overflow-hidden px-7 py-14 text-center md:px-16 md:py-20">
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
              <Image
                src="/images/farmland-golden.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="relative mx-auto max-w-2xl">
              <span className="eyebrow eyebrow-light justify-center">
                Start exploring
              </span>
              <h2 className="h2 mt-5 text-cream-50">
                Put a soil profile through the model.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-cream-50/60">
                Five inputs are enough to begin. Every result arrives with its
                evidence, its class reliability and its disclaimer attached.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/dashboard" variant="lime" size="lg">
                  Open the dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="http://localhost:8501"
                  variant="onDark"
                  size="lg"
                >
                  Streamlit fallback
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-[0.75rem] text-cream-50/35">
                <SproutIcon className="h-3.5 w-3.5" />
                Built with the project&apos;s existing Random Forest model — never retrained for this site.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
