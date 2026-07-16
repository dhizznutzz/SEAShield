// SeaShield — client-side risk engine (demo build).
// A faithful browser port of the server's heuristics + reputation + score-merge
// (server/lib/heuristics.ts, reputation.ts, score.ts). No AI, no network — everything
// runs in the visitor's browser so the GitHub Pages demo works with zero setup.
//
// Exposes: window.SeaShield.scan(context) -> Verdict
(function () {
  "use strict";

  // ---- reputation (port of lib/reputation.ts) ------------------------------
  const DENYLIST_DOMAINS = new Set([
    "secure-paypa1.com",
    "amaz0n-billing.top",
    "hmrc-refund-verify.xyz",
  ]);
  const DENYLIST_ACCOUNTS = new Set([
    "GB29NWBK60161331926819",
  ]);
  const ALLOWLIST_DOMAINS = new Set([
    "paypal.com", "www.paypal.com", "stripe.com", "checkout.stripe.com",
    "amazon.com", "www.amazon.com", "razorpay.com",
  ]);

  // Demo runs statelessly, but we keep a per-session sighting counter so the
  // "first time you're paying X" flag behaves like the server's in-memory map.
  const sightings = new Map();

  function root(host) {
    const p = host.split(".");
    return p.length >= 2 ? p.slice(-2).join(".") : host;
  }

  function lookupReputation(ctx) {
    const flags = [];
    const host = (ctx.finalDomain || "").toLowerCase();
    const acct = (ctx.payeeAccount || "").replace(/\s/g, "").toUpperCase();

    if (DENYLIST_DOMAINS.has(host) || DENYLIST_DOMAINS.has(root(host))) {
      flags.push({ category: "reputation", weight: 60, hardDanger: true, reason: `This domain (${host}) is on SeaShield's known-fraud list.` });
    }
    if (acct && DENYLIST_ACCOUNTS.has(acct)) {
      flags.push({ category: "reputation", weight: 60, hardDanger: true, reason: `The payee account has been reported for fraud.` });
    }

    const isAllowed = ALLOWLIST_DOMAINS.has(host) || ALLOWLIST_DOMAINS.has(root(host));
    if (!isAllowed && flags.length === 0) {
      const n = (sightings.get(host) || 0) + 1;
      sightings.set(host, n);
      if (n === 1) {
        flags.push({ category: "reputation", weight: 8, reason: `SeaShield hasn't seen this payee before — first time you're paying ${host}.` });
      }
    }
    return flags;
  }

  // ---- heuristics (port of lib/heuristics.ts) ------------------------------
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

  function canonical(s) {
    return s
      .toLowerCase()
      .replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e")
      .replace(/5/g, "s").replace(/7/g, "t").replace(/\$/g, "s")
      .replace(/[^a-z]/g, "");
  }

  function levenshtein(a, b) {
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

  function registrableRoot(host) {
    const parts = host.split(".");
    return parts.length >= 2 ? parts[parts.length - 2] : host;
  }
  function tld(host) {
    const parts = host.split(".");
    return parts[parts.length - 1] || "";
  }

  function runHeuristics(ctx) {
    const flags = [];
    const host = (ctx.finalDomain || "").toLowerCase();
    const rootLabel = registrableRoot(host);
    const rootCanon = canonical(rootLabel);

    if (ctx.https === false || /^http:\/\//i.test(ctx.url || "")) {
      flags.push({ category: "site", weight: 25, reason: "This page is not using a secure (HTTPS) connection." });
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      flags.push({ category: "site", weight: 30, reason: "The site is hosted on a raw IP address instead of a domain name." });
    }
    if (host.startsWith("xn--") || host.includes(".xn--")) {
      flags.push({ category: "site", weight: 30, reason: "The domain uses punycode, a common trick for look-alike addresses." });
    }
    const labelCount = host.split(".").length;
    if (labelCount >= 5) {
      flags.push({ category: "site", weight: 15, reason: `The domain has an unusually long/nested structure (${host}).` });
    }
    if (SUSPICIOUS_TLDS.has(tld(host))) {
      flags.push({ category: "site", weight: 12, reason: `The domain ends in ".${tld(host)}", a TLD frequently abused for fraud.` });
    }

    for (const brand of KNOWN_BRANDS) {
      if (rootCanon === brand && rootLabel !== brand) {
        flags.push({ category: "site", weight: 45, hardDanger: true, reason: `The domain imitates "${brand}" using look-alike characters (${rootLabel}).` });
        break;
      }
      const d = levenshtein(rootCanon, brand);
      if (d > 0 && d <= 2 && Math.abs(rootCanon.length - brand.length) <= 2 && rootCanon.length >= 4) {
        flags.push({ category: "site", weight: 40, hardDanger: true, reason: `The domain "${rootLabel}" closely resembles "${brand}" — possible impersonation.` });
        break;
      }
    }

    const text = ctx.invoiceText || "";
    const urgency = ctx.hasUrgency || URGENCY_RE.test(text);
    const hasBankDetails = !!ctx.payeeAccount || /\biban\b|sort\s*code|account\s*number|routing/i.test(text);

    if (urgency && hasBankDetails) {
      flags.push({ category: "invoice", weight: 28, reason: "The invoice mixes urgency (“pay now / details changed”) with new bank/account details — a classic invoice-fraud pattern." });
    } else if (urgency) {
      flags.push({ category: "invoice", weight: 12, reason: "The page pressures you to pay urgently." });
    }

    const payee = canonical(ctx.payeeName || ctx.merchantName || "");
    if (payee && payee.length >= 4 && rootCanon && !rootCanon.includes(payee) && !payee.includes(rootCanon)) {
      const impersonatesBrand = KNOWN_BRANDS.some((b) => payee.includes(b));
      if (impersonatesBrand) {
        flags.push({ category: "invoice", weight: 30, hardDanger: true, reason: `The invoice claims to be from "${ctx.payeeName || ctx.merchantName}" but the website domain (${host}) doesn't belong to that brand.` });
      } else {
        flags.push({ category: "invoice", weight: 10, reason: `The payee name doesn't match the website domain (${host}).` });
      }
    }

    for (const link of ctx.paymentLinks || []) {
      let linkHost = "";
      try { linkHost = new URL(link).hostname.toLowerCase(); } catch (e) { continue; }
      if (URL_SHORTENERS.has(registrableRoot(linkHost) + "." + tld(linkHost)) || URL_SHORTENERS.has(linkHost)) {
        flags.push({ category: "link", weight: 18, reason: `A payment link uses a URL shortener (${linkHost}) that hides its real destination.` });
      } else if (registrableRoot(linkHost) !== rootLabel && linkHost !== host) {
        flags.push({ category: "link", weight: 15, reason: `A payment link points to a different domain (${linkHost}) than the site you're on.` });
      }
    }

    return dedupeFlags(flags);
  }

  function dedupeFlags(flags) {
    const seen = new Set();
    return flags.filter((f) => (seen.has(f.reason) ? false : (seen.add(f.reason), true)));
  }

  // ---- score merge (port of lib/score.ts) ----------------------------------
  function levelFromScore(score) {
    if (score >= 71) return "danger";
    if (score >= 31) return "caution";
    return "safe";
  }
  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n || 0))); }
  function dedupeStr(arr) {
    const seen = new Set();
    return arr.filter((x) => (x && !seen.has(x) ? (seen.add(x), true) : false));
  }

  function mergeVerdict(flags) {
    const heuristicScore = Math.min(100, flags.reduce((s, f) => s + f.weight, 0));
    const hardDanger = flags.some((f) => f.hardDanger);

    // Demo has no AI layer, so the score is the heuristic score (source: heuristics).
    let score = heuristicScore;
    if (hardDanger) score = Math.max(score, 78);
    score = clamp(score);

    const level = levelFromScore(score);
    const heuristicReasons = flags.slice().sort((a, b) => b.weight - a.weight).map((f) => f.reason);
    const reasons = dedupeStr(heuristicReasons).slice(0, 6);
    const recommendation = defaultRecommendation(level, flags);

    return { score, level, reasons, recommendation, source: "heuristics" };
  }

  function defaultRecommendation(level, flags) {
    if (level === "danger") {
      const top = flags.find((f) => f.hardDanger) || flags[0];
      return top ? `Do not pay. ${top.reason}` : "Do not pay — this payment looks fraudulent.";
    }
    if (level === "caution") return "Double-check the payee, amount and website before paying.";
    return "No obvious red flags found, but always confirm the payee and amount.";
  }

  // ---- public API ----------------------------------------------------------
  function scan(ctx) {
    const flags = [...lookupReputation(ctx), ...runHeuristics(ctx)];
    return mergeVerdict(flags);
  }

  window.SeaShield = { scan };
})();
