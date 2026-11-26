export function norm(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function formatPrice(n) {
  return `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: Number(n) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}

export function getRootBase() {
  if (typeof window === "undefined") return ".";
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

let toastTimer = null;
export function showToast(msg) {
  if (typeof document === "undefined") return;
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2300);
}
