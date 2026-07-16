// SeaShield — merchant/payee reputation lookup.
// MVP: a static allow/deny list + in-memory history. Swap for a real DB or 3rd-party API.
import type { PaymentContext, Flag } from "./types";

const DENYLIST_DOMAINS = new Set<string>([
  "secure-paypa1.com",
  "amaz0n-billing.top",
  "hmrc-refund-verify.xyz",
]);

const DENYLIST_ACCOUNTS = new Set<string>([
  "GB29NWBK60161331926819", // example flagged IBAN
]);

const ALLOWLIST_DOMAINS = new Set<string>([
  "paypal.com", "www.paypal.com", "stripe.com", "checkout.stripe.com",
  "amazon.com", "www.amazon.com", "razorpay.com",
]);

// In-memory sighting counter (resets on redeploy). TODO: persist to a real store.
const sightings = new Map<string, number>();

function root(host: string) {
  const p = host.split(".");
  return p.length >= 2 ? p.slice(-2).join(".") : host;
}

export function lookupReputation(ctx: PaymentContext): Flag[] {
  const flags: Flag[] = [];
  const host = (ctx.finalDomain || "").toLowerCase();
  const acct = (ctx.payeeAccount || "").replace(/\s/g, "").toUpperCase();

  if (DENYLIST_DOMAINS.has(host) || DENYLIST_DOMAINS.has(root(host))) {
    flags.push({ category: "url", weight: 60, hardDanger: true, reason: `This domain (${host}) is on SeaShield's known-fraud list.` });
  }
  if (acct && DENYLIST_ACCOUNTS.has(acct)) {
    flags.push({ category: "invoice", weight: 60, hardDanger: true, reason: `The payee bank account has been reported for fraud.` });
  }

  const isAllowed = ALLOWLIST_DOMAINS.has(host) || ALLOWLIST_DOMAINS.has(root(host));
  if (!isAllowed && flags.length === 0) {
    const n = (sightings.get(host) || 0) + 1;
    sightings.set(host, n);
    if (n === 1) {
      flags.push({ category: "company", weight: 8, reason: `SeaShield hasn't seen this payee before — first time you're paying ${host}.` });
    }
  }

  return flags;
}

export function isAllowlisted(host: string): boolean {
  host = (host || "").toLowerCase();
  return ALLOWLIST_DOMAINS.has(host) || ALLOWLIST_DOMAINS.has(root(host));
}
