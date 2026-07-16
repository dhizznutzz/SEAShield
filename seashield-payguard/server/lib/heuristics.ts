// SeaShield — deterministic red-flag heuristics. Fast, no AI, no network.
import type { PaymentContext, Flag } from "./types";

// Known brands people commonly get spoofed against. Extend freely.
const KNOWN_BRANDS = [
  "paypal", "stripe", "amazon", "apple", "microsoft", "google", "netflix",
  "hmrc", "irs", "dhl", "fedex", "ups", "chase", "hsbc", "barclays",
  "coinbase", "binance", "metamask", "wise", "revolut", "razorpay",
];

const SUSPICIOUS_TLDS = new Set([
  "zip", "top", "xyz", "click", "country", "gq", "cf", "tk", "ml", "work",
  "support", "buzz", "rest", "monster", "mov",
]);

const URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
  "rebrand.ly", "cutt.ly", "shorturl.at",
]);

const URGENCY_RE = /\b(urgent|immediately|final\s*notice|account\s*(has\s*)?(been\s*)?changed|new\s*bank\s*details|overdue|within\s*24\s*hours|suspend(ed)?|verify\s*now)\b/i;

// Map look-alike homoglyphs / leetspeak to canonical letters before comparing.
function canonical(s: string): string {
  return s
    .toLowerCase()
    .replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e")
    .replace(/5/g, "s").replace(/7/g, "t").replace(/\$/g, "s")
    .replace(/[^a-z]/g, "");
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

function registrableRoot(host: string): string {
  const parts = host.split(".");
  return parts.length >= 2 ? parts[parts.length - 2] : host;
}

function tld(host: string): string {
  const parts = host.split(".");
  return parts[parts.length - 1] || "";
}

export function runHeuristics(ctx: PaymentContext): Flag[] {
  const flags: Flag[] = [];
  const host = (ctx.finalDomain || "").toLowerCase();
  const rootLabel = registrableRoot(host);
  const rootCanon = canonical(rootLabel);

  // --- Fake / spoofed website -------------------------------------------
  if (ctx.https === false || /^http:\/\//i.test(ctx.url || "")) {
    flags.push({ category: "url", weight: 25, reason: "This page is not using a secure (HTTPS) connection." });
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    flags.push({ category: "url", weight: 30, reason: "The site is hosted on a raw IP address instead of a domain name." });
  }

  if (host.startsWith("xn--") || host.includes(".xn--")) {
    flags.push({ category: "url", weight: 30, reason: "The domain uses punycode, a common trick for look-alike addresses." });
  }

  const labelCount = host.split(".").length;
  if (labelCount >= 5) {
    flags.push({ category: "url", weight: 15, reason: `The domain has an unusually long/nested structure (${host}).` });
  }

  if (SUSPICIOUS_TLDS.has(tld(host))) {
    flags.push({ category: "url", weight: 12, reason: `The domain ends in ".${tld(host)}", a TLD frequently abused for fraud.` });
  }

  // Look-alike of a known brand (close but not exact match)
  for (const brand of KNOWN_BRANDS) {
    if (rootCanon === brand && rootLabel !== brand) {
      flags.push({ category: "company", weight: 45, hardDanger: true, reason: `The domain imitates "${brand}" using look-alike characters (${rootLabel}).` });
      break;
    }
    const d = levenshtein(rootCanon, brand);
    if (d > 0 && d <= 2 && Math.abs(rootCanon.length - brand.length) <= 2 && rootCanon.length >= 4) {
      flags.push({ category: "company", weight: 40, hardDanger: true, reason: `The domain "${rootLabel}" closely resembles "${brand}" — possible impersonation.` });
      break;
    }
  }

  // --- Suspicious invoice ------------------------------------------------
  const text = ctx.invoiceText || "";
  const urgency = ctx.hasUrgency || URGENCY_RE.test(text);
  const hasBankDetails = !!ctx.payeeAccount || /\biban\b|sort\s*code|account\s*number|routing/i.test(text);

  if (urgency && hasBankDetails) {
    flags.push({ category: "invoice", weight: 28, reason: "The invoice mixes urgency (“pay now / details changed”) with new bank/account details — a classic invoice-fraud pattern." });
  } else if (urgency) {
    flags.push({ category: "invoice", weight: 12, reason: "The page pressures you to pay urgently." });
  }

  // Payee name vs domain mismatch
  const payee = canonical(ctx.payeeName || ctx.merchantName || "");
  if (payee && payee.length >= 4 && rootCanon && !rootCanon.includes(payee) && !payee.includes(rootCanon)) {
    // Only flag when the payee looks like a well-known brand but the domain doesn't match.
    const impersonatesBrand = KNOWN_BRANDS.some((b) => payee.includes(b));
    if (impersonatesBrand) {
      flags.push({ category: "company", weight: 30, hardDanger: true, reason: `The invoice claims to be from "${ctx.payeeName || ctx.merchantName}" but the website domain (${host}) doesn't belong to that brand.` });
    } else {
      flags.push({ category: "company", weight: 10, reason: `The payee name doesn't match the website domain (${host}).` });
    }
  }

  // --- Payment links & QR ------------------------------------------------
  for (const link of ctx.paymentLinks || []) {
    let linkHost = "";
    try { linkHost = new URL(link).hostname.toLowerCase(); } catch { continue; }
    if (URL_SHORTENERS.has(registrableRoot(linkHost) + "." + tld(linkHost)) || URL_SHORTENERS.has(linkHost)) {
      flags.push({ category: "url", weight: 18, reason: `A payment link uses a URL shortener (${linkHost}) that hides its real destination.` });
    } else if (registrableRoot(linkHost) !== rootLabel && linkHost !== host) {
      flags.push({ category: "url", weight: 15, reason: `A payment link points to a different domain (${linkHost}) than the site you're on.` });
    }
  }

  return dedupe(flags);
}

function dedupe(flags: Flag[]): Flag[] {
  const seen = new Set<string>();
  return flags.filter((f) => (seen.has(f.reason) ? false : (seen.add(f.reason), true)));
}

// TODO(integration): domain age via WHOIS/RDAP, Google Safe Browsing, VirusTotal.
// Add these as async flags that push high-weight reasons when a domain is young/blacklisted.
export async function threatIntel(ctx: PaymentContext): Promise<Flag[]> {
  // Placeholder — wire real feeds here (keyed off ctx.finalDomain). Returns nothing in the MVP.
  void ctx;
  return [];
}
