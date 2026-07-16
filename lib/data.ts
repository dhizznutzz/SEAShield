// Central mock data for the SEAShield demo. No backend — everything here is
// static, illustrative content used across the landing, demo, and dashboard.

export type RiskLevel = "critical" | "high" | "safe";

export type FlagReason = {
  label: string;
  detail: string;
};

export type DemoEmail = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string[];
  time: string;
  risk: RiskLevel;
  /** Short verdict shown on the alert panel header */
  verdict: string;
  reasons: FlagReason[];
  /** Only present for spoofed-domain cases */
  spoof?: { real: string; fake: string };
};

export const demoEmails: DemoEmail[] = [
  {
    id: "e1",
    senderName: "Golden Harvest Trading",
    senderEmail: "accounts@supplier-c0.com",
    subject: "URGENT: Updated Bank Details for Invoice #4521",
    preview:
      "Hi, please note our bank account has changed effective immediately. Kindly update…",
    body: [
      "Hi,",
      "Please note our bank account has changed effective immediately. Kindly update the payment details for the outstanding invoice and process today to avoid delay penalties.",
      "Regards,",
      "Finance Team",
    ],
    time: "09:14",
    risk: "critical",
    verdict: "Likely Business Email Compromise (invoice fraud)",
    spoof: { real: "supplier-co.com", fake: "supplier-c0.com" },
    reasons: [
      {
        label: "Look-alike domain",
        detail:
          "Sender domain supplier-c0.com uses a zero in place of the 'o' in your verified supplier supplier-co.com.",
      },
      {
        label: "Unscheduled bank-detail change",
        detail:
          "Request to change payout account mid-invoice. No prior change was authorised on this account.",
      },
      {
        label: "First-time recipient account",
        detail:
          "The new account number has never appeared in your 24-month payment history with this supplier.",
      },
      {
        label: "Urgency & pressure language",
        detail:
          '"effective immediately", "process today", "avoid delay penalties" — classic pressure tactics to bypass verification.',
      },
    ],
  },
  {
    id: "e2",
    senderName: "Lim Wei Sheng (CEO)",
    senderEmail: "lim.weisheng@apex-logistics-sg.net",
    subject: "Quick favour — need this handled discreetly",
    preview:
      "Are you at your desk? I need you to process an urgent supplier payment before our board call…",
    body: [
      "Are you at your desk?",
      "I need you to process an urgent supplier payment before our board call this afternoon. It's time-sensitive and confidential — please don't loop in anyone else yet.",
      "Reply here and I'll send the beneficiary details. Sent from my mobile.",
      "Wei Sheng",
    ],
    time: "08:47",
    risk: "critical",
    verdict: "Likely CEO-fraud (impersonation)",
    spoof: { real: "apexlogistics.com.sg", fake: "apex-logistics-sg.net" },
    reasons: [
      {
        label: "Executive impersonation",
        detail:
          'Display name "Lim Wei Sheng (CEO)" sent from apex-logistics-sg.net, not your corporate domain apexlogistics.com.sg.',
      },
      {
        label: "Secrecy request",
        detail:
          '"confidential", "don\'t loop in anyone else" — an attempt to defeat your dual-approval controls.',
      },
      {
        label: "Payment-request pattern",
        detail:
          "Unusual out-of-band request for an urgent payment with beneficiary details 'to follow'.",
      },
      {
        label: "Pretext for delays",
        detail:
          '"Sent from my mobile" primes you to excuse odd phrasing and account changes.',
      },
    ],
  },
  {
    id: "e3",
    senderName: "Maria Tan",
    senderEmail: "maria.tan@pacificfreight.com",
    subject: "Re: PO #8890 — shipment confirmed for Thu",
    preview:
      "Thanks for the update. Container is booked and we're on schedule for Thursday pickup…",
    body: [
      "Hi team,",
      "Thanks for the update. Container is booked and we're on schedule for Thursday pickup. I've attached the signed PO for your records.",
      "Let me know if the loading window shifts.",
      "Best,",
      "Maria",
    ],
    time: "Yesterday",
    risk: "safe",
    verdict: "No threats detected",
    reasons: [],
  },
  {
    id: "e4",
    senderName: "DBS IDEAL",
    senderEmail: "alerts@dbs-secure-verify.com",
    subject: "Action required: verify your corporate account",
    preview:
      "We detected unusual activity. Confirm your login within 12 hours or access will be suspended…",
    body: [
      "Dear Customer,",
      "We detected unusual activity on your corporate account. Please confirm your login credentials within 12 hours or access will be suspended.",
      "Verify now: http://dbs-secure-verify.com/login",
      "DBS Security Team",
    ],
    time: "Mon",
    risk: "high",
    verdict: "Phishing — credential harvesting",
    spoof: { real: "dbs.com.sg", fake: "dbs-secure-verify.com" },
    reasons: [
      {
        label: "Spoofed bank domain",
        detail:
          "Legitimate DBS communications come from dbs.com.sg, never dbs-secure-verify.com.",
      },
      {
        label: "Credential-harvesting link",
        detail:
          "Link points to an unverified http:// page mimicking the DBS IDEAL login.",
      },
      {
        label: "Deadline pressure",
        detail:
          '"within 12 hours or access will be suspended" manufactures urgency to stop you thinking.',
      },
    ],
  },
  {
    id: "e5",
    senderName: "Grab for Business",
    senderEmail: "no-reply@grab.com",
    subject: "Your June corporate ride receipt",
    preview:
      "Here's your monthly summary. Total: S$284.50 across 18 trips. Download your invoice…",
    body: [
      "Hi there,",
      "Here's your monthly summary for June. Total: S$284.50 across 18 trips.",
      "You can download the itemised invoice from your Grab for Business dashboard.",
      "Thanks for riding with us.",
    ],
    time: "Mon",
    risk: "safe",
    verdict: "No threats detected",
    reasons: [],
  },
];

export type WhatsAppMessage = {
  id: string;
  from: "them" | "me";
  text: string;
  time: string;
};

export const whatsappThread: WhatsAppMessage[] = [
  {
    id: "w1",
    from: "them",
    text: "Hi, this is Daniel from Meridian Supplies finance dept 👋",
    time: "10:02",
  },
  {
    id: "w2",
    from: "them",
    text: "We've switched banks. Please send the payment for INV-2290 to our new UOB account today — old account is closed.",
    time: "10:02",
  },
  {
    id: "w3",
    from: "them",
    text: "Acc: 451-902-8837. Kindly confirm once transferred 🙏 It's urgent, our auditor needs it cleared by 12pm.",
    time: "10:03",
  },
];

export const whatsappFlag = {
  verdict: "Likely invoice-redirection scam",
  reasons: [
    {
      label: "Unverified new number",
      detail:
        "Message is from a number not linked to any saved Meridian Supplies contact.",
    },
    {
      label: "Bank switch + urgency",
      detail:
        'Sudden "we\'ve switched banks" plus a same-day deadline is the top WhatsApp invoice-scam pattern.',
    },
    {
      label: "New beneficiary account",
      detail:
        "UOB account 451-902-8837 has no prior payment history with this supplier.",
    },
  ],
};

// ---------- Dashboard mock data ----------

export const dashboardStats = {
  blockedThisMonth: 47,
  blockedDelta: 12, // vs last month
  amountProtected: 428500, // S$
  channelsMonitored: 3,
  falsePositiveRate: 1.8, // %
};

export type TrendPoint = {
  week: string;
  flagged: number;
  blocked: number;
};

export const riskTrend: TrendPoint[] = [
  { week: "W1", flagged: 6, blocked: 5 },
  { week: "W2", flagged: 9, blocked: 8 },
  { week: "W3", flagged: 7, blocked: 7 },
  { week: "W4", flagged: 13, blocked: 12 },
  { week: "W5", flagged: 11, blocked: 10 },
  { week: "W6", flagged: 16, blocked: 15 },
  { week: "W7", flagged: 14, blocked: 14 },
  { week: "W8", flagged: 18, blocked: 17 },
];

export type IncidentStatus = "Blocked" | "Reviewed" | "False Positive";

export type Incident = {
  id: string;
  type: string;
  channel: "Email" | "WhatsApp" | "Call";
  source: string;
  detected: string;
  risk: RiskLevel;
  status: IncidentStatus;
  amount?: number;
};

export const incidents: Incident[] = [
  {
    id: "INC-1043",
    type: "Invoice fraud — bank-detail change",
    channel: "Email",
    source: "supplier-c0.com",
    detected: "Today, 09:14",
    risk: "critical",
    status: "Blocked",
    amount: 38400,
  },
  {
    id: "INC-1042",
    type: "CEO impersonation",
    channel: "Email",
    source: "apex-logistics-sg.net",
    detected: "Today, 08:47",
    risk: "critical",
    status: "Blocked",
    amount: 62000,
  },
  {
    id: "INC-1041",
    type: "Invoice redirection",
    channel: "WhatsApp",
    source: "+65 8•• ••• 37",
    detected: "Today, 10:03",
    risk: "high",
    status: "Reviewed",
    amount: 15750,
  },
  {
    id: "INC-1040",
    type: "Credential phishing",
    channel: "Email",
    source: "dbs-secure-verify.com",
    detected: "Mon, 16:22",
    risk: "high",
    status: "Blocked",
  },
  {
    id: "INC-1039",
    type: "Suspected voice deepfake",
    channel: "Call",
    source: "+65 3•• ••• 08",
    detected: "Mon, 11:05",
    risk: "critical",
    status: "Reviewed",
    amount: 90000,
  },
  {
    id: "INC-1038",
    type: "Payment-reminder lookalike",
    channel: "Email",
    source: "billing@xero-invoices.co",
    detected: "Sun, 14:31",
    risk: "high",
    status: "Blocked",
    amount: 4200,
  },
  {
    id: "INC-1037",
    type: "Genuine supplier update",
    channel: "Email",
    source: "pacificfreight.com",
    detected: "Sat, 09:50",
    risk: "safe",
    status: "False Positive",
  },
];

// ---------- Shared marketing content ----------

export const problemStats = [
  {
    value: "US$23B",
    label: "Lost by Southeast Asian SMEs to scams and fraud every year.",
    source: "ASEAN region, annual",
  },
  {
    value: "S$65M+",
    label:
      "Lost by Singapore SMEs to Business Email Compromise in 2023 alone.",
    source: "Singapore, 2023",
  },
  {
    value: "< 2%",
    label:
      "Of IT budget SMEs spend on security — versus 8–12% at large enterprises.",
    source: "SME vs enterprise",
  },
];

export const sdgs = [
  {
    number: 8,
    title: "Decent Work & Economic Growth",
    detail:
      "Protecting SME cash flow and jobs from fraud that can wipe out thin margins.",
  },
  {
    number: 9,
    title: "Industry, Innovation & Infrastructure",
    detail:
      "Bringing enterprise-grade security infrastructure within reach of small businesses.",
  },
  {
    number: 16,
    title: "Peace, Justice & Strong Institutions",
    detail:
      "Reducing financial crime and strengthening digital trust across ASEAN's economy.",
  },
];
