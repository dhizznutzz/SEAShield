import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed">
              AI-powered scam detection built for Southeast Asian SMEs. Enterprise-grade
              protection, without the enterprise price tag.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Product
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/#solution" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white">
                    Live Demo
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Company
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/impact" className="hover:text-white">
                    Impact
                  </Link>
                </li>
                <li>
                  <Link href="/#waitlist" className="hover:text-white">
                    Request a Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aligned with
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>UN SDG 8</li>
                <li>UN SDG 9</li>
                <li>UN SDG 16</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SEAShield. Demo prototype — not a live product.</p>
          <p className="text-slate-500">
            Built for NUS Enterprise · ASEAN SPARK
          </p>
        </div>
      </div>
    </footer>
  );
}
