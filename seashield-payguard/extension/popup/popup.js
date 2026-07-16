const DEFAULT_API = "http://localhost:3000/api/scan";

const els = {
  enabled: document.getElementById("enabled"),
  threshold: document.getElementById("threshold"),
  threshVal: document.getElementById("threshVal"),
  apiUrl: document.getElementById("apiUrl"),
  history: document.getElementById("history"),
};

async function load() {
  const { settings, history } = await chrome.storage.local.get(["settings", "history"]);
  const s = { enabled: true, apiUrl: DEFAULT_API, threshold: 31, ...(settings || {}) };
  els.enabled.checked = s.enabled;
  els.threshold.value = s.threshold;
  els.threshVal.textContent = s.threshold;
  els.apiUrl.value = s.apiUrl;
  renderHistory(history || []);
}

async function save() {
  const settings = {
    enabled: els.enabled.checked,
    threshold: Number(els.threshold.value),
    apiUrl: els.apiUrl.value.trim() || DEFAULT_API,
  };
  await chrome.storage.local.set({ settings });
}

function renderHistory(history) {
  if (!history.length) {
    els.history.innerHTML = '<li class="empty">No scans yet.</li>';
    return;
  }
  els.history.innerHTML = history
    .map((h) => {
      const when = new Date(h.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const money = h.amount ? `${h.currency || ""}${h.amount} · ` : "";
      return `<li>
        <span class="dot ${h.level}"></span>
        <div style="min-width:0">
          <div class="h-domain">${escapeHtml(h.domain)}</div>
          <div class="h-meta">${escapeHtml(money)}${escapeHtml(h.merchant || "")} · ${when}</div>
        </div>
        <span class="h-score">${h.score}</span>
      </li>`;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

els.enabled.addEventListener("change", save);
els.apiUrl.addEventListener("change", save);
els.threshold.addEventListener("input", () => {
  els.threshVal.textContent = els.threshold.value;
  save();
});

load();
