// SeaShield — detector. Runs on every page.
// 1) decide if this is a payment page, 2) intercept Pay/Authorise clicks,
// 3) extract context, 4) ask the background worker to scan, 5) gate the click on the overlay.

(function () {
  const PAY_BUTTON_RE = /\b(pay(\s*now)?|authori[sz]e|confirm\s*(payment|order|purchase)?|complete\s*(payment|purchase|order)|place\s*order|send\s*money|checkout|buy\s*now)\b/i;
  const PAGE_KEYWORDS = /\b(invoice|checkout|pay\s*now|amount\s*due|total\s*due|billing|card\s*number|cvv|iban|upi|sort\s*code|routing\s*number|pay\s*to)\b/i;
  const URGENCY_RE = /\b(urgent|immediately|final\s*notice|account\s*(has\s*)?changed|overdue|within\s*24\s*hours|suspend)/i;

  let armed = false; // becomes true once we've flagged this as a payment page
  let observer = null;

  function isPaymentPage() {
    const text = (document.body && document.body.innerText || "").slice(0, 20000);
    let signals = 0;
    if (PAGE_KEYWORDS.test(text)) signals++;
    if (document.querySelector('input[autocomplete="cc-number"], input[name*="card" i], input[id*="card" i]')) signals += 2;
    if (document.querySelector('input[name*="iban" i], input[name*="upi" i], input[name*="account" i]')) signals++;
    if (document.querySelector('iframe[src*="stripe"], iframe[src*="paypal"], iframe[src*="razorpay"], iframe[src*="checkout"]')) signals += 2;
    if (findPayButtons().length) signals++;
    if (/\b(\$|€|£|₹|USD|EUR|GBP|INR)\s?\d/.test(text)) signals++;
    return signals >= 2;
  }

  function findPayButtons() {
    const candidates = Array.from(
      document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"], [role="button"]')
    );
    return candidates.filter((el) => {
      const label = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim();
      return label && PAY_BUTTON_RE.test(label) && el.offsetParent !== null;
    });
  }

  // ---- context extraction --------------------------------------------------
  function firstMoney(text) {
    const m = text.match(/(?:(\$|€|£|₹)|\b(USD|EUR|GBP|INR|AUD|CAD)\b)\s?([\d,]+(?:\.\d{1,2})?)/i);
    if (!m) return { amount: "", currency: "" };
    return { amount: m[3], currency: m[1] || m[2] || "" };
  }

  function extractContext() {
    const bodyText = (document.body && document.body.innerText || "").replace(/\s+/g, " ").trim();
    const { amount, currency } = firstMoney(bodyText);

    const ogSite = document.querySelector('meta[property="og:site_name"]');
    const merchantName =
      (ogSite && ogSite.content) ||
      matchLabeled(bodyText, /pay\s*to\s*:?\s*([A-Z][\w .,&'-]{2,60})/i) ||
      matchLabeled(bodyText, /from\s*:?\s*([A-Z][\w .,&'-]{2,60})/i) ||
      document.title.split(/[|\-–]/)[0].trim();

    const payeeAccount =
      matchLabeled(bodyText, /\b([A-Z]{2}\d{2}[A-Z0-9]{10,30})\b/) ||        // IBAN
      matchLabeled(bodyText, /account\s*(?:no\.?|number)?\s*:?\s*(\d[\d\s-]{6,20}\d)/i) ||
      matchLabeled(bodyText, /\b([\w.\-]{2,}@[a-z]{2,})\b(?=.*upi)/i) ||     // UPI id
      "";

    const invoiceNumber =
      matchLabeled(bodyText, /invoice\s*(?:#|no\.?|number|num)?\s*:?\s*([A-Z0-9][A-Z0-9\-\/]{2,20})/i) ||
      matchLabeled(bodyText, /\b(INV[-\/ ]?[A-Z0-9\-\/]{3,20})\b/i) ||
      "";

    const paymentLinks = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.href)
      .filter((h) => /^https?:/i.test(h) && /(pay|checkout|invoice|billpay|paymentrequest)/i.test(h))
      .slice(0, 10);

    return {
      url: location.href,
      finalDomain: location.hostname,
      title: document.title,
      https: location.protocol === "https:",
      merchantName: (merchantName || "").trim(),
      payeeName: (merchantName || "").trim(),
      amount,
      currency,
      payeeAccount,
      invoiceNumber,
      hasUrgency: URGENCY_RE.test(bodyText),
      invoiceText: bodyText.slice(0, 4000),
      paymentLinks,
    };
  }

  function matchLabeled(text, re) {
    const m = text.match(re);
    return m ? m[1].trim() : "";
  }

  // ---- click interception --------------------------------------------------
  function onCaptureClick(e) {
    const btn = e.target.closest && e.target.closest('button, input, a, [role="button"]');
    if (!btn) return;

    // If user already approved this element, let the click flow through.
    if (btn.__seashieldApproved) {
      btn.__seashieldApproved = false;
      return;
    }

    const label = (btn.innerText || btn.value || btn.getAttribute("aria-label") || "").trim();
    if (!label || !PAY_BUTTON_RE.test(label)) return;

    // Intercept: stop the payment until we've scanned.
    e.preventDefault();
    e.stopImmediatePropagation();

    const context = extractContext();
    chrome.runtime.sendMessage({ type: "SEASHIELD_SCAN", context }, (resp) => {
      const verdict = (resp && resp.verdict) || {
        score: 50, level: "caution", reasons: ["No response from SeaShield."],
        recommendation: "Could not verify. Proceed with caution.",
      };

      if (verdict.disabled || (verdict.level === "safe" && verdict.score < 31)) {
        // Safe / disabled → let the payment proceed transparently.
        proceed(btn);
        return;
      }

      window.SeaShieldOverlay.show(verdict, context, {
        onProceed: () => proceed(btn),
        onCancel: () => { /* stay on page; do nothing */ },
      });
    });
  }

  function proceed(btn) {
    btn.__seashieldApproved = true;
    // Re-fire the original action.
    if (btn.tagName === "INPUT" && btn.type === "submit" && btn.form) {
      if (btn.form.requestSubmit) btn.form.requestSubmit(btn);
      else btn.form.submit();
    } else {
      btn.click();
    }
  }

  // ---- boot ----------------------------------------------------------------
  function arm() {
    if (armed) return;
    armed = true;
    document.addEventListener("click", onCaptureClick, true); // capture phase
    chrome.runtime.sendMessage({ type: "SEASHIELD_BADGE", paymentPage: true });
    if (observer) observer.disconnect();
  }

  function evaluate() {
    if (isPaymentPage()) arm();
  }

  // Initial + observe DOM changes (SPA checkouts render late).
  evaluate();
  if (!armed) {
    observer = new MutationObserver(() => { if (!armed) evaluate(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Give up after 20s to save CPU on non-payment pages.
    setTimeout(() => observer && observer.disconnect(), 20000);
  }
})();
