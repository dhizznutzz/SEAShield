import { ShieldAlert, Ban, Check } from "lucide-react";

/**
 * A mock "flagged email" card shown in the hero — conveys the product at a glance.
 */
export function HeroAlertCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-sm">
      <div className="rounded-xl bg-white p-5 text-navy-900">
        {/* email header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
              GH
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Golden Harvest Trading</p>
              <p className="font-mono text-xs text-slate-500">accounts@supplier-c0.com</p>
            </div>
          </div>
          <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
            Blocked
          </span>
        </div>

        <p className="mt-4 text-sm font-semibold">
          URGENT: Updated Bank Details for Invoice #4521
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Hi, please note our bank account has changed effective immediately. Kindly update
          the payment details and process today to avoid delay penalties…
        </p>

        {/* alert panel */}
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <p className="text-sm font-bold text-red-700">
              SEAShield flagged this as invoice fraud
            </p>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-red-900/80">
            <li className="flex items-start gap-2">
              <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <span>
                Look-alike domain — <span className="font-mono">supplier-c0.com</span> vs real{" "}
                <span className="font-mono">supplier-co.com</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <span>Bank details changed mid-invoice — never seen before</span>
            </li>
            <li className="flex items-start gap-2">
              <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <span>Urgency &amp; pressure language detected</span>
            </li>
          </ul>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-shield-600">
          <Check className="h-4 w-4" />
          Payment held — S$38,400 protected
        </div>
      </div>
    </div>
  );
}
