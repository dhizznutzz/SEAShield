"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function WaitlistForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onLight = variant === "light";

  if (submitted) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
          onLight
            ? "border-shield-500/30 bg-shield-500/10"
            : "border-shield-400/30 bg-shield-400/10"
        }`}
      >
        <CheckCircle2 className="h-6 w-6 shrink-0 text-shield-500" />
        <div>
          <p className={`font-semibold ${onLight ? "text-navy-900" : "text-white"}`}>
            You&apos;re on the list.
          </p>
          <p className={`text-sm ${onLight ? "text-slate-600" : "text-slate-300"}`}>
            We&apos;ll reach out to <span className="font-medium">{email}</span> with early
            access and a live walkthrough.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setSubmitted(true);
      }}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourcompany.com.sg"
        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 ${
          onLight
            ? "border-slate-300 bg-white text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-brand-500/30"
            : "border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:border-shield-400 focus:ring-shield-400/30"
        }`}
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md"
      >
        Join the waitlist
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
