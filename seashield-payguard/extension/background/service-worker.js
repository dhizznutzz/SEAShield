// SeaShield — background service worker (MV3)
// Responsible for: calling the cloud API, caching verdicts, badge state, scan history.

const DEFAULT_API = "http://localhost:3000/api/scan";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const HISTORY_MAX = 25;

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return {
    enabled: true,
    apiUrl: DEFAULT_API,
    // block threshold: overlay is shown when score >= this value
    threshold: 31,
    ...(settings || {}),
  };
}

async function getCache() {
  const { verdictCache } = await chrome.storage.local.get("verdictCache");
  return verdictCache || {};
}

async function saveHistory(entry) {
  const { history } = await chrome.storage.local.get("history");
  const next = [entry, ...(history || [])].slice(0, HISTORY_MAX);
  await chrome.storage.local.set({ history: next });
}

function cacheKey(context) {
  // Cache per domain + amount so a different amount re-scans.
  return `${context.finalDomain || context.url}|${context.amount || ""}`;
}

async function scan(context) {
  const settings = await getSettings();
  if (!settings.enabled) {
    return { score: 0, level: "safe", reasons: [], recommendation: "Protection disabled.", disabled: true };
  }

  // Serve from cache when fresh
  const key = cacheKey(context);
  const cache = await getCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { ...cached.verdict, cached: true };
  }

  let verdict;
  try {
    const res = await fetch(settings.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    verdict = await res.json();
  } catch (err) {
    // Fail OPEN but visibly: if we can't reach the brain, tell the user we couldn't verify.
    verdict = {
      score: 50,
      level: "caution",
      reasons: [`SeaShield could not reach its risk service (${err.message}).`],
      recommendation: "Could not verify this payment. Proceed only if you trust this site.",
      error: true,
    };
  }

  // Persist to cache + history
  cache[key] = { ts: Date.now(), verdict };
  await chrome.storage.local.set({ verdictCache: cache });
  await saveHistory({
    ts: Date.now(),
    domain: context.finalDomain || context.url,
    merchant: context.merchantName || context.payeeName || "",
    amount: context.amount || "",
    currency: context.currency || "",
    score: verdict.score,
    level: verdict.level,
  });

  return verdict;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SEASHIELD_SCAN") {
    scan(msg.context).then((verdict) => sendResponse({ verdict }));
    return true; // async response
  }
  if (msg.type === "SEASHIELD_BADGE") {
    const tabId = sender.tab && sender.tab.id;
    if (tabId != null) {
      const on = msg.paymentPage;
      chrome.action.setBadgeText({ tabId, text: on ? "$" : "" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563eb" });
    }
    return false;
  }
});
