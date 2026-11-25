import Link from "next/link";

import { GithubIcon, LeafIcon } from "@/components/ui/icons";

const platform = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/crop-intelligence", label: "Crop Intelligence" },
  { href: "/simulator", label: "Rainfall Simulator" },
  { href: "/practices", label: "Indigenous Practices" },
];

const project = [
  { href: "/about", label: "About the project" },
  {
    href: "https://github.com/AyushDey10/KrishiMitra_AI",
    label: "GitHub repository",
    external: true,
  },
  {
    href: "http://localhost:8501",
    label: "Streamlit dashboard",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-900 text-cream-50">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-forest-900">
                <LeafIcon className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-xl tracking-[-0.02em]">
                KrishiMitra <span className="text-lime-400">AI</span>
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-cream-50/60">
              A research prototype exploring historical crop patterns and
              documented indigenous farming practices. Built as an academic
              project, not a commercial advisory service.
            </p>
            <a
              href="https://github.com/AyushDey10/KrishiMitra_AI"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm text-cream-50/70 transition-colors hover:text-lime-400"
            >
              <GithubIcon className="h-4 w-4" />
              AyushDey10/KrishiMitra_AI
            </a>
          </div>

          <div>
            <h3 className="font-sans text-[0.6875rem] font-semibold tracking-[0.18em] text-cream-50/40 uppercase">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              {platform.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-50/70 transition-colors hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[0.6875rem] font-semibold tracking-[0.18em] text-cream-50/40 uppercase">
              Project
            </h3>
            <ul className="mt-4 space-y-2.5">
              {project.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-sm text-cream-50/70 transition-colors hover:text-cream-50"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-cream-50/40">
            Model scores are classifier outputs over historical crop labels.
            They are not probabilities of crop success, yield or profitability,
            and this platform does not provide a validated crop suitability
            assessment. Soil and climate inputs describe district-level
            conditions, not farm-level measurements.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-cream-50/35 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Dataset: India District Crop Dataset 1997–2015 · SoilGrids 2.0 ·
              NASA POWER
            </p>
            <p>Academic project · 2026–2027</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
