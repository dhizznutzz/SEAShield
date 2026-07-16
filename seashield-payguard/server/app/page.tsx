import { aiEnabled } from "@/lib/ai";

export default function Home() {
  const ai = aiEnabled();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 28 }}>🛡️ SeaShield — Risk Service</h1>
      <p style={{ opacity: 0.8 }}>
        This is the cloud &quot;AI brain&quot; for the SeaShield browser extension. It scores the
        fraud risk of a payment from the invoice, website, payee and payment links.
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 999,
          border: `1px solid ${ai ? "#22c55e" : "#f59e0b"}`,
          color: ai ? "#22c55e" : "#f59e0b",
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        AI layer: {ai ? "enabled (AI Gateway key found)" : "disabled — using heuristics only"}
      </div>

      <h2 style={{ fontSize: 18 }}>Endpoint</h2>
      <pre style={{ background: "#1e293b", padding: 16, borderRadius: 10, overflowX: "auto" }}>
{`POST /api/scan
Content-Type: application/json

{
  "url": "https://secure-paypa1.com/pay",
  "finalDomain": "secure-paypa1.com",
  "merchantName": "PayPal",
  "amount": "980.00",
  "currency": "$",
  "payeeAccount": "GB29 NWBK 6016 1331 9268 19",
  "hasUrgency": true,
  "invoiceText": "URGENT: account changed, pay immediately",
  "paymentLinks": ["https://bit.ly/pay-now"]
}

→ { "score": 90, "level": "danger", "reasons": [...], "recommendation": "..." }`}
      </pre>

      <p style={{ opacity: 0.6, fontSize: 13 }}>
        To enable the AI layer, set <code>AI_GATEWAY_API_KEY</code> (and optionally{" "}
        <code>SEASHIELD_MODEL</code>) in the environment.
      </p>
    </main>
  );
}
