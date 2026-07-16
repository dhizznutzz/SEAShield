// SeaShield — warning overlay. Injected into a Shadow DOM so the host page's CSS can't touch it.
// Exposes window.SeaShieldOverlay.show(verdict, context, { onProceed, onCancel }).

(function () {
  const LEVEL_COLORS = {
    safe: { bg: "#052e1a", accent: "#22c55e", label: "LOW RISK" },
    caution: { bg: "#3a2a05", accent: "#f59e0b", label: "CAUTION" },
    danger: { bg: "#3a0a0a", accent: "#ef4444", label: "HIGH RISK" },
  };

  // The three things the breakdown reasons about, in display order.
  const GROUPS = [
    { key: "url", icon: "🌐", title: "Website address", value: (c) => c.finalDomain || "(unknown)" },
    { key: "company", icon: "🏢", title: "Company / payee", value: (c) => c.merchantName || c.payeeName || "(not detected)" },
    { key: "invoice", icon: "🧾", title: "Invoice details", value: invoiceValue },
  ];

  function invoiceValue(c) {
    const parts = [];
    if (c.invoiceNumber) parts.push("#" + c.invoiceNumber);
    if (c.amount) parts.push((c.currency || "") + c.amount);
    if (c.payeeAccount) parts.push("Acct " + c.payeeAccount);
    return parts.join("  ·  ") || "(no invoice details found)";
  }

  function levelFor(verdict) {
    if (verdict.level) return verdict.level;
    if (verdict.score >= 71) return "danger";
    if (verdict.score >= 31) return "caution";
    return "safe";
  }

  function show(verdict, context, handlers) {
    // Back-compat: allow show(verdict, handlers) with no context.
    if (context && (typeof context.onProceed === "function" || typeof context.onCancel === "function")) {
      handlers = context;
      context = {};
    }
    context = context || {};
    const { onProceed, onCancel } = handlers || {};
    const level = levelFor(verdict);
    const theme = LEVEL_COLORS[level] || LEVEL_COLORS.caution;
    const requireType = level === "danger";

    const existing = document.getElementById("seashield-overlay-host");
    if (existing) existing.remove();

    const host = document.createElement("div");
    host.id = "seashield-overlay-host";
    host.style.all = "initial";
    const root = host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(host);

    root.innerHTML = `
      <style>
        :host { all: initial; }
        .backdrop {
          position: fixed; inset: 0; z-index: 2147483647;
          background: rgba(0,0,0,.72);
          display: flex; align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .card {
          width: min(470px, 92vw); max-height: 90vh; overflow-y: auto;
          background: ${theme.bg}; border: 1px solid ${theme.accent}; border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,.6); color: #f8fafc;
        }
        .head { display:flex; align-items:center; gap:12px; padding:18px 22px 6px; }
        .badge {
          font-size: 11px; font-weight: 700; letter-spacing:.08em;
          padding: 4px 10px; border-radius: 999px; color: ${theme.accent}; border:1px solid ${theme.accent};
        }
        .brand { font-size:13px; opacity:.75; margin-left:auto; }
        .score-wrap { display:flex; align-items:center; gap:18px; padding: 8px 22px 0; }
        .gauge {
          --pct: ${verdict.score};
          width:88px; height:88px; border-radius:50%;
          background: conic-gradient(${theme.accent} calc(var(--pct)*1%), rgba(255,255,255,.12) 0);
          display:flex; align-items:center; justify-content:center; flex:none;
        }
        .gauge > div { width:66px; height:66px; border-radius:50%; background:${theme.bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .gauge b { font-size:22px; line-height:1; }
        .gauge span { font-size:10px; opacity:.7; margin-top:2px; }
        .headline { font-size:16px; font-weight:600; }
        .rec { font-size:13.5px; opacity:.9; margin-top:4px; }

        .why-btn {
          display:flex; align-items:center; justify-content:space-between; gap:8px;
          margin: 16px 22px 0; padding: 11px 14px; width: calc(100% - 44px);
          background: rgba(255,255,255,.06); color:#f8fafc; cursor:pointer;
          border:1px solid rgba(255,255,255,.18); border-radius:10px; font-size:14px; font-weight:600;
        }
        .why-btn .chev { transition: transform .18s; opacity:.8; }
        .why-btn[aria-expanded="true"] .chev { transform: rotate(180deg); }

        .details { display:none; margin: 12px 22px 0; }
        .details.open { display:block; }
        .group { border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:10px 12px; margin-bottom:10px; }
        .group-head { display:flex; align-items:center; gap:8px; }
        .group-title { font-weight:600; font-size:13.5px; }
        .group-val { font-size:12px; opacity:.7; margin-left:auto; max-width:52%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pill { font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; flex:none; }
        .pill.risk { color:${theme.accent}; border:1px solid ${theme.accent}; }
        .pill.ok { color:#22c55e; border:1px solid #22c55e; }
        .pill.none { color:#94a3b8; border:1px solid #475569; }
        .group ul { margin:8px 0 0; padding-left:18px; font-size:12.5px; line-height:1.5; opacity:.95; }
        .group li { margin:3px 0; }
        .group.checked-ok { opacity:.75; }
        .ai-note { font-size:12px; opacity:.75; margin:2px 2px 8px; }

        .type-row { padding: 14px 22px 0; font-size:12.5px; opacity:.9; }
        .type-row input {
          margin-top:6px; width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px;
          border:1px solid rgba(255,255,255,.25); background: rgba(0,0,0,.25); color:#fff; font-size:14px;
        }
        .actions { display:flex; gap:10px; padding: 16px 22px 20px; }
        button.act { flex:1; padding:11px 14px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:1px solid transparent; }
        .cancel { background:#e5e7eb; color:#111827; }
        .proceed { background: transparent; color:#f8fafc; border-color: rgba(255,255,255,.35); }
        .proceed:disabled { opacity:.4; cursor:not-allowed; }
        .footnote { font-size:11px; opacity:.55; text-align:center; padding:0 22px 14px; }
      </style>
      <div class="backdrop">
        <div class="card" role="alertdialog" aria-modal="true">
          <div class="head">
            <span class="badge">${theme.label}</span>
            <span class="brand">🛡️ SeaShield</span>
          </div>
          <div class="score-wrap">
            <div class="gauge"><div><b>${verdict.score}</b><span>/ 100</span></div></div>
            <div>
              <div class="headline">Review before you pay</div>
              <div class="rec">${escapeHtml(verdict.recommendation || "Check these details carefully.")}</div>
            </div>
          </div>

          <button class="why-btn" id="ss-why" aria-expanded="false" aria-controls="ss-details">
            <span>Why flagged?</span><span class="chev">▾</span>
          </button>
          <div class="details" id="ss-details">${buildBreakdown(verdict, context, theme)}</div>

          ${requireType ? `
            <div class="type-row">
              This looks high risk. To continue anyway, type <b>PROCEED</b>:
              <input id="ss-confirm" autocomplete="off" placeholder="Type PROCEED" />
            </div>` : ""}
          <div class="actions">
            <button class="act cancel" id="ss-cancel">Cancel payment</button>
            <button class="act proceed" id="ss-proceed" ${requireType ? "disabled" : ""}>Proceed anyway</button>
          </div>
          <div class="footnote">SeaShield is an assistant, not a guarantee. You make the final decision.</div>
        </div>
      </div>
    `;

    const close = () => host.remove();
    const details = root.getElementById("ss-details");
    const whyBtn = root.getElementById("ss-why");
    whyBtn.addEventListener("click", () => {
      const open = details.classList.toggle("open");
      whyBtn.setAttribute("aria-expanded", String(open));
      whyBtn.querySelector("span").textContent = open ? "Hide breakdown" : "Why flagged?";
    });

    const cancelBtn = root.getElementById("ss-cancel");
    const proceedBtn = root.getElementById("ss-proceed");
    cancelBtn.addEventListener("click", () => { close(); onCancel && onCancel(); });
    proceedBtn.addEventListener("click", () => { close(); onProceed && onProceed(); });

    if (requireType) {
      const input = root.getElementById("ss-confirm");
      input.addEventListener("input", () => {
        proceedBtn.disabled = input.value.trim().toUpperCase() !== "PROCEED";
      });
      input.focus();
    } else {
      cancelBtn.focus();
    }
  }

  // ---- breakdown builder ---------------------------------------------------
  function buildBreakdown(verdict, ctx, theme) {
    const findings = Array.isArray(verdict.findings) ? verdict.findings : [];

    // Fallback for older backends that only send a flat `reasons` list.
    if (!findings.length && Array.isArray(verdict.reasons) && verdict.reasons.length) {
      return `<div class="group"><div class="group-head"><span class="group-title">Reasons</span></div>
        <ul>${verdict.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>`;
    }

    let html = GROUPS.map((g) => {
      const items = findings.filter((f) => f.category === g.key);
      const value = g.value(ctx);
      const hasValue = value && !value.startsWith("(");
      const status = items.length ? "risk" : hasValue ? "ok" : "none";
      const pill = status === "risk" ? "⚠ Risk" : status === "ok" ? "✓ Looks OK" : "— Not checked";
      const list = items.length
        ? `<ul>${items.map((f) => `<li>${escapeHtml(f.reason)}</li>`).join("")}</ul>`
        : "";
      return `<div class="group ${status === "ok" ? "checked-ok" : ""}">
        <div class="group-head">
          <span>${g.icon}</span>
          <span class="group-title">${g.title}</span>
          <span class="group-val" title="${escapeHtml(value)}">${escapeHtml(value)}</span>
          <span class="pill ${status}">${pill}</span>
        </div>${list}
      </div>`;
    }).join("");

    // AI holistic assessment (if any).
    const ai = findings.filter((f) => f.category === "assessment");
    if (ai.length) {
      html += `<div class="group" style="border-color:${theme.accent}">
        <div class="group-head"><span>🤖</span><span class="group-title">SeaShield AI assessment</span></div>
        <ul>${ai.map((f) => `<li>${escapeHtml(f.reason)}</li>`).join("")}</ul>
      </div>`;
    }
    return html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  window.SeaShieldOverlay = { show };
})();
