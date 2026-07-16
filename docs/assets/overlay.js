// SeaShield — warning overlay (demo build, adapted from extension/content/overlay.js).
// Injected into a Shadow DOM so the host page's CSS can't touch it.
// Exposes window.SeaShieldOverlay.show(verdict, { onProceed, onCancel }).
(function () {
  "use strict";

  const LEVEL_COLORS = {
    safe: { bg: "#052e1a", accent: "#22c55e", label: "LOW RISK" },
    caution: { bg: "#3a2a05", accent: "#f59e0b", label: "CAUTION" },
    danger: { bg: "#3a0a0a", accent: "#ef4444", label: "HIGH RISK" },
  };

  function levelFor(verdict) {
    if (verdict.level) return verdict.level;
    if (verdict.score >= 71) return "danger";
    if (verdict.score >= 31) return "caution";
    return "safe";
  }

  function show(verdict, handlers) {
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

    const reasons = (verdict.reasons || [])
      .map((r) => `<li>${escapeHtml(r)}</li>`)
      .join("");

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
          width: min(460px, 92vw); background: ${theme.bg};
          border: 1px solid ${theme.accent}; border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,.6); color: #f8fafc; overflow: hidden;
        }
        .head { display:flex; align-items:center; gap:12px; padding:18px 22px 6px; }
        .badge {
          font-size: 11px; font-weight: 700; letter-spacing:.08em;
          padding: 4px 10px; border-radius: 999px;
          color: ${theme.accent}; border:1px solid ${theme.accent};
        }
        .brand { font-size:13px; opacity:.75; margin-left:auto; }
        .score-wrap { display:flex; align-items:center; gap:18px; padding: 8px 22px 0; }
        .gauge {
          --pct: ${verdict.score};
          width:88px; height:88px; border-radius:50%;
          background: conic-gradient(${theme.accent} calc(var(--pct)*1%), rgba(255,255,255,.12) 0);
          display:flex; align-items:center; justify-content:center; flex:none;
        }
        .gauge > div {
          width:66px; height:66px; border-radius:50%; background:${theme.bg};
          display:flex; flex-direction:column; align-items:center; justify-content:center;
        }
        .gauge b { font-size:22px; line-height:1; }
        .gauge span { font-size:10px; opacity:.7; margin-top:2px; }
        .headline { font-size:16px; font-weight:600; }
        .rec { font-size:13.5px; opacity:.9; margin-top:4px; }
        ul { margin: 12px 22px 4px; padding-left: 18px; font-size:13px; line-height:1.5; }
        li { margin: 3px 0; }
        .type-row { padding: 6px 22px 0; font-size:12.5px; opacity:.85; }
        .type-row input {
          margin-top:6px; width:100%; box-sizing:border-box; padding:8px 10px;
          border-radius:8px; border:1px solid rgba(255,255,255,.25);
          background: rgba(0,0,0,.25); color:#fff; font-size:14px;
        }
        .actions { display:flex; gap:10px; padding: 16px 22px 20px; }
        button {
          flex:1; padding:11px 14px; border-radius:10px; font-size:14px; font-weight:600;
          cursor:pointer; border:1px solid transparent;
        }
        .cancel { background:#e5e7eb; color:#111827; }
        .proceed { background: transparent; color:#f8fafc; border-color: rgba(255,255,255,.35); }
        .proceed:disabled { opacity:.4; cursor:not-allowed; }
        .footnote { font-size:11px; opacity:.55; text-align:center; padding:0 22px 14px; }
      </style>
      <div class="backdrop" part="backdrop">
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
          ${reasons ? `<ul>${reasons}</ul>` : ""}
          ${requireType ? `
            <div class="type-row">
              This looks high risk. To continue anyway, type <b>PROCEED</b>:
              <input id="ss-confirm" autocomplete="off" placeholder="Type PROCEED" />
            </div>` : ""}
          <div class="actions">
            <button class="cancel" id="ss-cancel">Cancel payment</button>
            <button class="proceed" id="ss-proceed" ${requireType ? "disabled" : ""}>Proceed anyway</button>
          </div>
          <div class="footnote">SeaShield is an assistant, not a guarantee. You make the final decision.</div>
        </div>
      </div>
    `;

    const close = () => host.remove();
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  window.SeaShieldOverlay = { show };
})();
