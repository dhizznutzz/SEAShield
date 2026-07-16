// Shared types for the SeaShield risk engine.

export interface PaymentContext {
  url: string;
  finalDomain: string;
  title?: string;
  https?: boolean;
  merchantName?: string;
  payeeName?: string;
  amount?: string;
  currency?: string;
  payeeAccount?: string;
  invoiceNumber?: string;
  hasUrgency?: boolean;
  invoiceText?: string;
  paymentLinks?: string[];
}

export type RiskLevel = "safe" | "caution" | "danger";

// The three things a user reasons about, plus the AI's holistic take.
export type FindingCategory = "url" | "company" | "invoice" | "assessment";

export interface Flag {
  reason: string;
  weight: number; // contribution to the 0-100 score
  hardDanger?: boolean; // if true, verdict is forced to "danger"
  category: FindingCategory;
}

export interface Finding {
  category: FindingCategory;
  reason: string;
}

export interface Verdict {
  score: number; // 0-100
  level: RiskLevel;
  reasons: string[]; // flat list (kept for API consumers / summaries)
  findings: Finding[]; // categorised list for the "Risk breakdown" panel
  recommendation: string;
  source: "heuristics" | "heuristics+ai";
}
