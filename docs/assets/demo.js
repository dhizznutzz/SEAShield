// SeaShield — demo detector (adapted from extension/content/detector.js).
// Intercepts Pay/Authorise clicks, extracts the page context, and scores it with the
// in-browser engine (assets/engine.js) instead of the extension background worker + server.
//
// Because GitHub Pages serves every demo from the same real host, each demo page declares a
// *simulated* payment context via `window.SEASHIELD_DEMO_CONTEXT` (e.g. finalDomain:
// "secure-paypa1.com"). Those fields override the real location so the engine scores the
// scenario the page is demonstrating, not github.io.
(function () {
  "use strict";

  const PAY_BUTTON_RE = /\b(pay(\s*now)?|authori[sz]e|confirm\s*(payment|order|purchase)?|complete\s*(payment|purchase|order)|place\s*order|send\s*money|checkout|buy\s*now)\b/i;
  const URGENCY_RE = /\b(urgent|immediately|final\s*notice|account\s*(has\s*)?changed|overdue|within\s*24\s*hours|suspend)/i;

  function firstMoney(text) {
    const m = text.match(/(?:(\$|€|£|₹)|\b(USD|EUR|GBP|INR|AUD|CAD)\b)\s?([\d,]+(?:\.\d{1,2})?)/i);
    if (!m) return { amount: "", currency: "" };
    return { amount: m[3], currency: m[1] || m[2] || "" };
  }

  function matchLabeled(text, re) {
    const m = text.match(re);
    return m ? m[1].trim() : "";
  }

  function extractContext() {
    const sim = window.SEASHIELD_DEMO_CONTEXT || {};
    const bodyText = (document.body && document.body.innerText || "").replace(/\s+/g, " ").trim();
    const { amount, currency } = firstMoney(bodyText);

    const ogSite = document.querySelector('meta[property="og:site_name"]');
    const merchantName =
      (ogSite && ogSite.content) ||
      matchLabeled(bodyText, /pay\s*to\s*:?\s*([A-Z][\w .,&'-]{2,60})/i) ||
      matchLabeled(bodyText, /from\s*:?\s*([A-Z][\w .,&'-]{2,60})/i) ||
      document.title.split(/[|\-–]/)[0].trim();

    const payeeAccount =
      matchLabeled(bodyText, /\b([A-Z]{2}\d{2}[A-Z0-9]{10,30})\b/) ||
      matchLabeled(bodyText, /account\s*(?:no\.?|number)?\s*:?\s*(\d[\d\s-]{6,20}\d)/i) ||
      matchLabeled(bodyText, /\b([\w.\-]{2,}@[a-z]{2,})\b(?=.*upi)/i) ||
      "";

    const paymentLinks = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.href)
      .filter((h) => /^https?:/i.test(h) && /(pay|checkout|invoice|billpay|paymentrequest)/i.test(h))
      .slice(0, 10);

    // Real DOM-extracted context, with the demo's simulated site fields layered on top.
    return {
      url: sim.url || location.href,
      finalDomain: sim.finalDomain || location.hostname,
      title: document.title,
      https: sim.https != null ? sim.https : location.protocol === "https:",
      merchantName: (merchantName || "").trim(),
      payeeName: (merchantName || "").trim(),
      amount,
      currency,
      payeeAccount,
      hasUrgency: URGENCY_RE.test(bodyText),
      invoiceText: bodyText.slice(0, 4000),
      paymentLinks,
    };
  }

  function onCaptureClick(e) {
    const btn = e.target.closest && e.target.closest('button, input, a, [role="button"]');
    if (!btn) return;

    if (btn.__seashieldApproved) {
      btn.__seashieldApproved = false;
      return;
    }

    const label = (btn.innerText || btn.value || btn.getAttribute("aria-label") || "").trim();
    if (!label || !PAY_BUTTON_RE.test(label)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const context = extractContext();
    const verdict = window.SeaShield.scan(context);

    if (verdict.level === "safe" && verdict.score < 31) {
      proceed(btn);
      return;
    }

    window.SeaShieldOverlay.show(verdict, {
      onProceed: () => proceed(btn),
      onCancel: () => { /* stay on page */ },
    });
  }

  function proceed(btn) {
    btn.__seashieldApproved = true;
    if (btn.tagName === "INPUT" && btn.type === "submit" && btn.form) {
      if (btn.form.requestSubmit) btn.form.requestSubmit(btn);
      else btn.form.submit();
    } else {
      btn.click();
    }
  }

  document.addEventListener("click", onCaptureClick, true); // capture phase
})();
