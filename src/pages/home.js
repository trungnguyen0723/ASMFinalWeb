import { RAW_PHONES } from "../data/phones.js";
import { buildRing } from "../engine/ring.js";
import { computeTargets, stepSpring } from "../engine/physics.js";
import { mountNavbar } from "../components/navbar.js";
import { createPhones, renderPhonesDOM } from "../ui/phones-dom.js";
import { initSearch } from "../ui/search.js";
import { initMiniPhone } from "../ui/mini-phone.js";
import { initFocus } from "../ui/focus.js";
import { clamp, escapeHtml, norm, showToast } from "../utils/dom.js";

const THROW_TOASTS = ["Nice throw.", "It always comes back.", "Gravity: optional."];

const stage = document.getElementById("stage");
const tooltip = document.getElementById("tooltip");
const ctaBtn = document.getElementById("cta-btn");
const ctaLabel = document.getElementById("cta-label");
const swOrbit = document.getElementById("sw-orbit");
const swGrid = document.getElementById("sw-grid");
const chipsWrap = document.getElementById("chips");

let W = window.innerWidth;
let H = window.innerHeight;
let isMobile = W < 760;
let BW = 152;
let BH = 270;
let ring = null;

function updateMetrics() {
  W = window.innerWidth;
  H = window.innerHeight;
  isMobile = W < 760;
  BW = isMobile ? Math.min(W * 0.26, 118) : clamp(W * 0.106, 114, 184);
  BH = BW * 1.78;
  ring = buildRing(W, H, isMobile);
}

updateMetrics();

const phones = createPhones(stage, W, H);
const order = RAW_PHONES.map((_, i) => i);

let layoutMode = "orbit";
let activeBrand = "";
let searchQuery = "";
let focusedPhone = null;
let focusInspectBack = false;
let hoveredPhone = null;
let draggedPhone = null;
let emptyDrag = null;
let phase = 0;
let phaseV = 0;
let mx = 0.5;
let my = 0.5;
let pointerX = -9999;
let pointerY = -9999;
let pointerActive = false;

function matchesPhone(phone) {
  if (activeBrand && phone.brand !== activeBrand) return false;
  if (searchQuery) {
    const q = norm(searchQuery.trim());
    if (q) {
      const hay = `${norm(phone.title)} ${norm(phone.brand)} ${norm(phone.chip)} ${norm(phone.finish)}`;
      if (!hay.includes(q)) return false;
    }
  }
  return true;
}

function refreshFilters() {
  for (const ph of phones) ph.active = matchesPhone(ph);
}

function getOrderedActivePhones() {
  const list = [];
  for (const idx of order) {
    if (phones[idx].active) list.push(phones[idx]);
  }
  return list;
}

function setLayout(mode) {
  if (layoutMode === mode) return;
  layoutMode = mode;
  document.body.classList.toggle("grid", mode === "grid");
  swOrbit.classList.toggle("active", mode === "orbit");
  swGrid.classList.toggle("active", mode === "grid");
  ctaLabel.textContent = mode === "grid" ? "Back to Orbit" : "View All Models";

  for (const ph of phones) {
    ph.v.rz += (Math.random() - 0.5) * 280;
    ph.v.z += 160 + Math.random() * 240;
  }
}

let focusCtrl = null;
let searchCtrl = null;

const navbar = mountNavbar({
  activePage: "home",
  includeSearch: true,
  onBrandClick() {
    focusCtrl?.close();
    activeBrand = "";
    searchCtrl?.clear();
    for (const c of chipsWrap.querySelectorAll(".chip")) c.classList.remove("active");
    refreshFilters();
    setLayout("orbit");
  },
  onOpenPhone(id) {
    const target = phones.find((p) => p.id === id);
    if (target) focusCtrl?.open(target);
  }
});

focusCtrl = initFocus({
  phones,
  getOrderedActivePhones,
  navbar,
  onFocusChange(phone, back) {
    focusedPhone = phone;
    focusInspectBack = back;
    if (phone) {
      hoveredPhone = null;
      tooltip.classList.remove("show");
    }
  }
});

searchCtrl = initSearch({
  phones,
  onQueryChange(val) {
    searchQuery = val;
    refreshFilters();
  },
  onSelectPhone(phone) {
    focusCtrl.open(phone);
  },
  isFocusOpen: () => Boolean(focusedPhone)
});

initMiniPhone({
  phones,
  onShuffle() {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (const ph of phones) {
      ph.tilt = Math.round((Math.random() * 2 - 1) * 18);
      ph.v.z += 180 + Math.random() * 240;
      ph.v.rz += (Math.random() - 0.5) * 340;
      ph.v.rx += (Math.random() - 0.5) * 140;
      ph.v.ry += (Math.random() - 0.5) * 180;
    }
    phaseV += 0.04;
  }
});

ctaBtn.addEventListener("click", () => {
  setLayout(layoutMode === "orbit" ? "grid" : "orbit");
});
swOrbit.addEventListener("click", () => setLayout("orbit"));
swGrid.addEventListener("click", () => setLayout("grid"));

chipsWrap.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const brand = chip.dataset.brand;
  activeBrand = activeBrand === brand ? "" : brand;
  for (const c of chipsWrap.querySelectorAll(".chip")) {
    c.classList.toggle("active", c.dataset.brand === activeBrand);
  }
  refreshFilters();
});

window.addEventListener("wheel", (e) => {
  if (focusedPhone || layoutMode !== "orbit") return;
  const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  phaseV += delta * 0.00009;
}, { passive: true });

stage.addEventListener("pointerdown", (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
  pointerActive = true;
  mx = clamp(e.clientX / W, 0, 1);
  my = clamp(e.clientY / H, 0, 1);

  const phoneEl = e.target.closest(".phone");
  if (phoneEl && !focusedPhone) {
    const phone = phones[Number(phoneEl.dataset.index)];
    if (!phone || !phone.active) return;
    phoneEl.setPointerCapture(e.pointerId);
    phoneEl.classList.add("dragging");
    draggedPhone = {
      phone,
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
      vx: 0,
      vy: 0,
      moved: 0
    };
    hoveredPhone = null;
    tooltip.classList.remove("show");
    return;
  }

  if (focusedPhone) {
    if (e.target === stage) focusCtrl.close();
    return;
  }

  if (layoutMode === "orbit") {
    stage.setPointerCapture(e.pointerId);
    emptyDrag = { pointerId: e.pointerId, lastX: e.clientX };
  }
});

window.addEventListener("pointermove", (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
  pointerActive = true;
  mx = clamp(e.clientX / W, 0, 1);
  my = clamp(e.clientY / H, 0, 1);

  if (draggedPhone) {
    const now = performance.now();
    const dtMs = Math.max(4, now - draggedPhone.lastTime);
    const dx = e.clientX - draggedPhone.lastX;
    const dy = e.clientY - draggedPhone.lastY;
    draggedPhone.moved += Math.hypot(dx, dy);

    const instVx = (dx / dtMs) * 16.67;
    const instVy = (dy / dtMs) * 16.67;
    draggedPhone.vx = draggedPhone.vx * 0.55 + instVx * 0.45;
    draggedPhone.vy = draggedPhone.vy * 0.55 + instVy * 0.45;
    draggedPhone.lastX = e.clientX;
    draggedPhone.lastY = e.clientY;
    draggedPhone.lastTime = now;
    return;
  }

  if (emptyDrag) {
    const dx = e.clientX - emptyDrag.lastX;
    emptyDrag.lastX = e.clientX;
    phaseV += dx * 0.00042;
    return;
  }

  if (!focusedPhone) {
    const phoneEl = e.target.closest && e.target.closest(".phone");
    const cand = phoneEl ? phones[Number(phoneEl.dataset.index)] : null;
    hoveredPhone = cand && cand.active ? cand : null;

    if (hoveredPhone) {
      tooltip.innerHTML = `<strong>${escapeHtml(hoveredPhone.title)}</strong><span>${escapeHtml(hoveredPhone.brand)} · $${hoveredPhone.price}</span>`;
      tooltip.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 18}px, 0) scale(1)`;
      tooltip.classList.add("show");
    } else {
      tooltip.classList.remove("show");
    }
  }
});

function endDrag(e) {
  if (draggedPhone && e.pointerId === draggedPhone.pointerId) {
    const { phone, moved, vx, vy } = draggedPhone;
    phone.el.classList.remove("dragging");
    try { phone.el.releasePointerCapture(e.pointerId); } catch {}
    draggedPhone = null;

    if (moved < 6) {
      focusCtrl.open(phone);
    } else {
      phone.v.x = clamp(vx * 60, -2800, 2800);
      phone.v.y = clamp(vy * 60, -2800, 2800);
      showToast(THROW_TOASTS[Math.floor(Math.random() * THROW_TOASTS.length)]);
    }
  }

  if (emptyDrag && e.pointerId === emptyDrag.pointerId) {
    try { stage.releasePointerCapture(e.pointerId); } catch {}
    emptyDrag = null;
  }
}

window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);
window.addEventListener("pointerleave", () => {
  pointerActive = false;
  hoveredPhone = null;
  tooltip.classList.remove("show");
});

window.addEventListener("resize", updateMetrics);

const startEpoch = performance.now();
let lastFrame = startEpoch;

function renderFrame(now) {
  const dt = Math.min(0.033, Math.max(0.001, (now - lastFrame) / 1000));
  lastFrame = now;
  const tSec = (now - startEpoch) / 1000;

  if (!focusedPhone && layoutMode === "orbit") {
    phase += 0.035 * dt + phaseV;
    phaseV *= Math.pow(0.93, dt * 60);
    if (Math.abs(phaseV) < 1e-6) phaseV = 0;
  }

  computeTargets(phones, order, {
    tSec, W, H, BW, BH, isMobile, ring, phase, mx, my,
    pointerX, pointerY, pointerActive,
    layoutMode, focusedPhone, focusInspectBack, hoveredPhone, draggedPhone
  });

  for (let i = 0; i < phones.length; i++) {
    stepSpring(phones[i], dt);
  }

  renderPhonesDOM(phones, { BW, BH, focusedPhone, draggedPhone, hoveredPhone });
  requestAnimationFrame(renderFrame);
}

requestAnimationFrame(() => {
  document.body.classList.add("ready");
  setTimeout(() => {
    document.querySelectorAll(".hl-line").forEach((el) => el.classList.add("revealed"));
  }, 1050);

  const requestedId = new URLSearchParams(window.location.search).get("phone");
  if (requestedId) {
    const match = phones.find((p) => p.id === requestedId);
    if (match) {
      setTimeout(() => focusCtrl.open(match), 420);
    }
  }
});

requestAnimationFrame(renderFrame);
