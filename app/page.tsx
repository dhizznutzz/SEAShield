import Link from "next/link";
import {
  ArrowRight,
  ScanSearch,
  FileWarning,
  PhoneCall,
  FileText,
  Plug,
  ShieldAlert,
  ShieldCheck,
  MailWarning,
  Building2,
  TriangleAlert,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { HeroAlertCard } from "@/components/HeroAlertCard";
import { problemStats, sdgs } from "@/lib/data";

const features = [
  {
    icon: ScanSearch,
    title: "Real-time email & WhatsApp scanning",
    body: "Every incoming message is scanned the moment it lands — phishing links, spoofed domains, and social-engineering language flagged before anyone acts.",
  },
  {
    icon: FileWarning,
    title: "Fake invoice detection",
    body: "We compare each invoice and payment request against your supplier history — catching changed bank details, look-alike senders, and first-time accounts.",
  },
  {
    icon: PhoneCall,
    title: "Suspicious call & deepfake flagging",
    body: "Unusual payment instructions over calls and voice notes are flagged, including AI voice-clone patterns impersonating your executives.",
  },
  {
    icon: FileText,
    title: "Auto incident reporting",
    body: "Every catch is logged with a plain-English explanation and an audit trail — ready for your finance lead, bank, or the authorities.",
  },
];

const steps = [
  {
    icon: Plug,
    title: "Connect your inbox & WhatsApp",
    body: "A lightweight, read-only connection on the devices your team already uses. No new app to learn, no IT project.",
  },
  {
    icon: ScanSearch,
    title: "SEAShield scans in real time",
    body: "Our AI checks every message, invoice, and payment request against known scam patterns and your own history — in milliseconds.",
  },
  {
    icon: ShieldAlert,
    title: "Get flagged before you pay or click",
    body: "A clear alert tells your employee exactly why something looks wrong — and what to do next — before money leaves the account.",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-shield-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-shield-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-shield-400" />
              </span>
              Built for Singapore &amp; ASEAN SMEs
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Stop the scam <br />
              <span className="bg-gradient-to-r from-shield-400 to-brand-400 bg-clip-text text-transparent">
                before you pay.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
              SEAShield is an AI scam-detector that plugs into WhatsApp, email, and calls —
              flagging phishing, fake invoices, and suspicious payment requests in real time,
              before your team falls victim.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-brand-500/40"
              >
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                See it catch a scam
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              Enterprise-grade protection at a fraction of the cost.
            </p>
          </div>

          <Reveal className="lg:justify-self-end" delay={120}>
            <HeroAlertCard />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Problem ---------------- */}
      <section id="problem" className="border-b border-slate-100 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
              The problem
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              SMEs are the target — and the last line of defense.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Cybersecurity tools are built for large enterprises with dedicated IT teams.
              The frontline employees handling invoices and payments have no system backing
              them up against increasingly sophisticated, AI-powered scams.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {problemStats.map((stat, i) => (
              <Reveal key={stat.value} delay={i * 100}>
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-7 transition-shadow hover:shadow-md">
                  <TriangleAlert className="h-6 w-6 text-amber-500" />
                  <p className="mt-4 text-4xl font-bold tracking-tight text-navy-900">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {stat.label}
                  </p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {stat.source}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Solution ---------------- */}
      <section id="solution" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-shield-500">
              The solution
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              One lightweight shield across every channel.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              SEAShield plugs into the tools your team already uses and watches for fraud in
              real time — no dedicated IT team required.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/10 to-shield-500/10 text-brand-600">
                    <f.icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-navy-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="bg-navy-950 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-shield-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Protected in three steps.
            </h2>
          </Reveal>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <div
              className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block"
              aria-hidden
            />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-navy-850 text-shield-400 shadow-lg">
                    <s.icon className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-300">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 text-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-transform hover:-translate-y-0.5"
            >
              Watch SEAShield catch a live scam
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Impact / SDG ---------------- */}
      <section id="impact" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
                Impact
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                Protecting the businesses ASEAN&apos;s economy runs on.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                SEAShield gives SMEs enterprise-grade protection at a fraction of the cost —
                cutting fraud losses, saving hours of manual vigilance, and freeing owners to
                focus on running their business instead of guarding it.
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Building2 className="h-8 w-8 shrink-0 text-shield-500" />
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-navy-900">Target market:</span> Singapore
                  &amp; ASEAN SMEs in trading, logistics, and wholesale — where invoices,
                  payments, and supplier chat are the daily lifeblood.
                </p>
              </div>
              <Link
                href="/impact"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-500"
              >
                Read the full impact story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={120} className="grid gap-4">
              {sdgs.map((sdg) => (
                <div
                  key={sdg.number}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-900 text-white">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      SDG
                    </span>
                    <span className="text-xl font-bold leading-none">{sdg.number}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">{sdg.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{sdg.detail}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Waitlist CTA ---------------- */}
      <section id="waitlist" className="relative overflow-hidden bg-navy-900 py-20 lg:py-24">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div
          className="absolute -bottom-32 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-shield-500/15 blur-[110px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <ShieldCheck className="mx-auto h-10 w-10 text-shield-400" />
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Give your team a shield that never blinks.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Join the waitlist for early access and a live walkthrough tailored to your
              business. No credit card, no commitment.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <WaitlistForm variant="dark" />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <MailWarning className="h-4 w-4" />
              Demo prototype — this form is illustrative and stores nothing.
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
