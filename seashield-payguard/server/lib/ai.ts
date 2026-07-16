// SeaShield — LLM risk reasoning layer (AI SDK v6 via Vercel AI Gateway).
// Optional: if no gateway key is configured, we skip AI and rely on heuristics.
import { generateObject } from "ai";
import { z } from "zod";
import type { PaymentContext, Flag } from "./types";
import type { AiResult } from "./score";

// Model routed through the Vercel AI Gateway using a "provider/model" string.
// Override with SEASHIELD_MODEL. Requires AI_GATEWAY_API_KEY in the environment.
const MODEL = process.env.SEASHIELD_MODEL || "anthropic/claude-sonnet-5";

const schema = z.object({
  score: z.number().min(0).max(100).describe("Fraud risk from 0 (safe) to 100 (certain fraud)."),
  reasons: z.array(z.string()).max(4).describe("Short, plain-English reasons a non-technical person understands."),
  recommendation: z.string().describe("One sentence: what should the user do?"),
});

export function aiEnabled(): boolean {
  return !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export async function analyzeWithAI(ctx: PaymentContext, flags: Flag[]): Promise<AiResult | null> {
  if (!aiEnabled()) return null;

  const heuristicSummary = flags.length
    ? flags.map((f) => `- ${f.reason} (weight ${f.weight})`).join("\n")
    : "- none";

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema,
      system:
        "You are SeaShield, a payment-fraud analyst. A user is about to authorise an online payment. " +
        "Assess the risk of fraud/scam based on the website, invoice, payee and payment links. " +
        "Be especially alert to: brand impersonation, payee/domain mismatches, unexpected bank-detail " +
        "changes, urgency/pressure, look-alike domains and links that redirect elsewhere. " +
        "Do not raise risk merely because a site is unfamiliar. Return concise, non-technical reasons.",
      prompt:
        `Payment context:\n` +
        `URL: ${ctx.url}\n` +
        `Domain: ${ctx.finalDomain}\n` +
        `HTTPS: ${ctx.https}\n` +
        `Merchant/Payee: ${ctx.merchantName || ctx.payeeName || "(unknown)"}\n` +
        `Invoice number: ${ctx.invoiceNumber || "(none shown)"}\n` +
        `Amount: ${ctx.currency || ""}${ctx.amount || "(unknown)"}\n` +
        `Payee account: ${ctx.payeeAccount || "(none shown)"}\n` +
        `Payment links: ${(ctx.paymentLinks || []).join(", ") || "(none)"}\n\n` +
        `Deterministic red-flags already detected:\n${heuristicSummary}\n\n` +
        `Invoice / page text (truncated):\n${(ctx.invoiceText || "").slice(0, 2500)}`,
    });
    return object;
  } catch (err) {
    console.error("[SeaShield] AI layer failed, falling back to heuristics:", err);
    return null;
  }
}
