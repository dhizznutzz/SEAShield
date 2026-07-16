# 🛡️ SeaShield — AI Payment Guard

A browser extension + cloud AI service that acts as a **safety layer before you authorise an
online payment**. When you're on a checkout or invoice page and click **Pay / Authorise**,
SeaShield pauses the payment, inspects the **website, invoice, payee, and payment links**, asks a
cloud AI + heuristics engine for a **risk score (0–100)**, and — if anything looks suspicious —
**interrupts with a warning** you must clear before the payment goes through. For high-risk
payments you must type `PROCEED` to override, giving the human a real second checkpoint.

> **What it can and can't see:** a browser extension reads the **web page** you're on (checkout
> pages, online invoices, payment links). It cannot see native banking apps, desktop apps, or
> in-store card taps — those are out of scope.

## Layout

```
seashield-payguard/
  extension/     Chrome MV3 extension (the "scanner")
  server/        Next.js app on Vercel (the "AI brain": POST /api/scan)
  test-pages/    Demo checkout + fake-invoice pages to try it
```

## Run it (5 minutes)

### 1. Start the risk service
```bash
cd server
npm install
npm run dev          # http://localhost:3000
```
Verify it works:
```bash
npm run test:scan    # prints scored verdicts for safe / spoofed / unknown cases
```
The AI layer is **optional**. Without a key it runs on heuristics + reputation only. To enable
AI reasoning, copy `.env.example` → `.env` and set `AI_GATEWAY_API_KEY` (Vercel AI Gateway).

### 2. Load the extension
1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder
4. The SeaShield popup lets you toggle protection, set the warning threshold, and see recent scans

### 3. Try it
- Open `test-pages/safe-checkout.html` → click **Pay** → proceeds normally (low risk).
- Open `test-pages/fake-invoice.html` → click **Authorise payment** → a **red HIGH RISK** overlay
  appears (look-alike/urgency/bank-change/shortened-link signals); you must type `PROCEED` to
  continue.

## How scoring works

`POST /api/scan` runs three layers and merges them into one verdict:

1. **`lib/heuristics.ts`** — deterministic red flags: non-HTTPS, look-alike/homoglyph domains
   (`paypa1.com`), punycode, raw-IP hosts, suspicious TLDs, payee↔domain mismatch, urgency +
   bank-detail changes, shortened/off-domain payment links.
2. **`lib/reputation.ts`** — merchant/payee allow/deny lists + first-seen tracking.
3. **`lib/ai.ts`** — LLM reasoning (AI SDK via Vercel AI Gateway, structured output) for the fuzzy
   judgement heuristics miss.

Score → behaviour: **0–30** safe (proceeds), **31–70** caution (warn), **71–100** danger (warn +
typed override).

## Deploy the service to Vercel
```bash
cd server
vercel deploy
vercel env add AI_GATEWAY_API_KEY   # to enable the AI layer
```
Then set the deployed URL in the extension popup's **Risk service URL** field (and add it to
`host_permissions` in `manifest.json`).

## Integration points (marked `TODO` in code)
- **Threat intel** (`heuristics.ts → threatIntel`): WHOIS/RDAP domain age, Google Safe Browsing,
  VirusTotal.
- **Reputation** (`reputation.ts`): swap the in-memory lists for a real DB / third-party API.
- **QR decoding**: decode QR-code payment images in the content script (e.g. `jsqr`) and feed the
  decoded URL into `paymentLinks`.

## Honest limitations
- Web pages only (no native apps / in-store).
- Click interception is best-effort; unusual custom buttons may need per-site hardening.
- Payment-page content is sent to the service for scoring — disclose this; card numbers should be
  stripped client-side before sending.
- Scores are probabilistic — the human always makes the final call.

**Stack:** Next.js 15 · AI SDK 5 (Vercel AI Gateway) · Zod · Chrome MV3.
