// SeaShield — merge heuristic + reputation + AI signals into a single verdict.
import type { Flag, Verdict, RiskLevel, Finding } from "./types";

function levelFromScore(score: number): RiskLevel {
  if (score >= 71) return "danger";
  if (score >= 31) return "caution";
  return "safe";
}

export interface AiResult {
  score: number;
  reasons: string[];
  recommendation: string;
}

export function mergeVerdict(flags: Flag[], ai: AiResult | null): Verdict {
  const heuristicScore = Math.min(100, flags.reduce((s, f) => s + f.weight, 0));
  const hardDanger = flags.some((f) => f.hardDanger);

  let score: number;
  let source: Verdict["source"];
  if (ai) {
    // Blend: take the heuristics and AI equally, but never below the stronger signal by much.
    score = Math.round(0.5 * heuristicScore + 0.5 * clamp(ai.score));
    score = Math.max(score, Math.round(Math.max(heuristicScore, clamp(ai.score)) * 0.8));
    source = "heuristics+ai";
  } else {
    score = heuristicScore;
    source = "heuristics";
  }

  if (hardDanger) score = Math.max(score, 78);
  score = clamp(score);

  const level = levelFromScore(score);

  const sortedFlags = [...flags].sort((a, b) => b.weight - a.weight);
  const heuristicReasons = sortedFlags.map((f) => f.reason);
  const reasons = dedupe([...(ai?.reasons || []), ...heuristicReasons]).slice(0, 6);

  // Categorised findings for the "Risk breakdown" panel: heuristic/reputation
  // flags keep their category; AI reasons go under "assessment".
  const findings: Finding[] = dedupeFindings([
    ...sortedFlags.map((f) => ({ category: f.category, reason: f.reason })),
    ...(ai?.reasons || []).map((r) => ({ category: "assessment" as const, reason: r })),
  ]);

  const recommendation =
    (ai && ai.recommendation) ||
    defaultRecommendation(level, flags);

  return { score, level, reasons, findings, recommendation, source };
}

function defaultRecommendation(level: RiskLevel, flags: Flag[]): string {
  if (level === "danger") {
    const top = flags.find((f) => f.hardDanger) || flags[0];
    return top ? `Do not pay. ${top.reason}` : "Do not pay — this payment looks fraudulent.";
  }
  if (level === "caution") return "Double-check the payee, amount and website before paying.";
  return "No obvious red flags found, but always confirm the payee and amount.";
}

function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n || 0))); }
function dedupe(arr: string[]) {
  const seen = new Set<string>();
  return arr.filter((x) => (x && !seen.has(x) ? (seen.add(x), true) : false));
}
function dedupeFindings(arr: Finding[]) {
  const seen = new Set<string>();
  return arr.filter((f) => (f.reason && !seen.has(f.reason) ? (seen.add(f.reason), true) : false));
}
