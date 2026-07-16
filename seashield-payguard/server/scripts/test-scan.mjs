// Quick end-to-end check of POST /api/scan. Run the dev server first, then: npm run test:scan
const BASE = process.env.SCAN_URL || "http://localhost:3000/api/scan";

const cases = [
  {
    name: "Legit PayPal checkout",
    ctx: {
      url: "https://www.paypal.com/checkoutnow",
      finalDomain: "www.paypal.com",
      https: true,
      merchantName: "PayPal",
      amount: "24.99",
      currency: "$",
      invoiceText: "Pay with PayPal. Total $24.99.",
      paymentLinks: [],
    },
  },
  {
    name: "Spoofed PayPal (look-alike domain + urgency + shortener)",
    ctx: {
      url: "http://secure-paypa1.com/pay",
      finalDomain: "secure-paypa1.com",
      https: false,
      merchantName: "PayPal",
      invoiceNumber: "INV-2024-00981",
      amount: "980.00",
      currency: "$",
      payeeAccount: "GB29 NWBK 6016 1331 9268 19",
      hasUrgency: true,
      invoiceText: "URGENT: Your account has changed. Pay immediately to avoid suspension. IBAN GB29NWBK60161331926819",
      paymentLinks: ["https://bit.ly/pay-now"],
    },
  },
  {
    name: "Unknown small merchant (should be caution, not danger)",
    ctx: {
      url: "https://coolgadgets-store.com/checkout",
      finalDomain: "coolgadgets-store.com",
      https: true,
      merchantName: "Cool Gadgets",
      amount: "39.00",
      currency: "$",
      invoiceText: "Checkout. Total due $39.00. Enter card number.",
      paymentLinks: [],
    },
  },
];

for (const c of cases) {
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c.ctx),
    });
    const v = await res.json();
    console.log(`\n=== ${c.name} ===`);
    console.log(`score=${v.score} level=${v.level} source=${v.source}`);
    console.log(`recommendation: ${v.recommendation}`);
    const byCat = {};
    (v.findings || []).forEach((f) => (byCat[f.category] ||= []).push(f.reason));
    for (const cat of ["url", "company", "invoice", "assessment"]) {
      if (byCat[cat]) {
        console.log(`  [${cat}]`);
        byCat[cat].forEach((r) => console.log(`    • ${r}`));
      }
    }
  } catch (e) {
    console.error(`FAILED ${c.name}:`, e.message);
  }
}
