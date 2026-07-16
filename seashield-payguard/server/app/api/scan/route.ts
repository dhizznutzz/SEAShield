import { runHeuristics, threatIntel } from "@/lib/heuristics";
import { lookupReputation } from "@/lib/reputation";
import { analyzeWithAI } from "@/lib/ai";
import { mergeVerdict } from "@/lib/score";
import type { PaymentContext } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let ctx: PaymentContext;
  try {
    ctx = (await req.json()) as PaymentContext;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!ctx || !ctx.url) {
    return json({ error: "Missing payment context (url required)" }, 400);
  }

  // 1) fast deterministic flags  2) reputation  3) (optional) threat-intel feeds
  const [intel] = await Promise.all([threatIntel(ctx)]);
  const flags = [...runHeuristics(ctx), ...lookupReputation(ctx), ...intel];

  // 4) AI reasoning (skipped automatically if no gateway key configured)
  const ai = await analyzeWithAI(ctx, flags);

  const verdict = mergeVerdict(flags, ai);
  return json(verdict, 200);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
