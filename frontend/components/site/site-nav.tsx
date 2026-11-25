"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { CloseIcon, LeafIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/crop-intelligence", label: "Crop Intelligence" },
  { href: "/simulator", label: "Rainfall" },
  { href: "/practices", label: "Practices" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-cream-50/85 backdrop-blur-xl transition-colors duration-300",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <div className="container-page flex h-17 items-center justify-between gap-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="KrishiMitra AI home"
        >
          <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-forest-800 text-lime-400 transition-transform duration-300 group-hover:-rotate-6">
            <LeafIcon className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-[1.35rem] leading-none tracking-[-0.02em] text-forest-900">
            KrishiMitra
            <span className="ml-1 align-baseline font-sans text-[0.625rem] font-semibold tracking-[0.12em] text-forest-700">
              AI
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-200",
                  active
                    ? "text-forest-900"
                    : "text-muted hover:text-forest-900",
                )}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-lime-500"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/dashboard" size="sm" variant="primary">
            Open dashboard
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-forest-800 transition-colors hover:bg-cream-100 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-cream-50 lg:hidden"
          >
            <nav className="container-page flex flex-col gap-1 py-5" aria-label="Mobile">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-[0.9375rem] text-ink transition-colors hover:bg-cream-100"
                >
                  {link.label}
                </Link>
              ))}
              <ButtonLink
                href="/dashboard"
                className="mt-3 w-full"
                variant="primary"
              >
                Open dashboard
              </ButtonLink>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
