"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { href: "/#solution", label: "Product" },
  { href: "/demo", label: "Live Demo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/impact", label: "Impact" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-navy-900"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#waitlist"
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-800 hover:shadow-md"
          >
            Request a Demo
          </Link>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-navy-900 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/#waitlist"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
