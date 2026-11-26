import { sampleRing } from "./ring.js";
import { clamp } from "../utils/dom.js";

export const K = { x: 120, y: 120, z: 140, rx: 160, ry: 160, rz: 120, s: 170, o: 90 };
export const C = { x: 17, y: 17, z: 20, rx: 18, ry: 18, rz: 15, s: 21, o: 19 };
export const AXES = ["x", "y", "z", "rx", "ry", "rz", "s", "o"];

export function stepSpring(phone, dt) {
  const sub = 4;
  const h = dt / sub;
  for (let step = 0; step < sub; step++) {
    for (let i = 0; i < AXES.length; i++) {
      const k = AXES[i];
      const acc = K[k] * (phone.t[k] - phone.p[k]) - C[k] * phone.v[k];
      phone.v[k] += acc * h;
      phone.p[k] += phone.v[k] * h;
    }
  }
}

export function computeTargets(phones, order, state) {
  const {
    tSec, W, H, BW, BH, isMobile, ring, phase, mx, my,
    pointerX, pointerY, pointerActive,
    layoutMode, focusedPhone, focusInspectBack, hoveredPhone, draggedPhone
  } = state;

  const activeList = [];
  for (const idx of order) {
    if (phones[idx].active) activeList.push(phones[idx]);
  }
  const activeCount = Math.max(1, activeList.length);
  const activePosMap = new Map();
  activeList.forEach((p, k) => activePosMap.set(p, k));

  const cols = isMobile ? 3 : 6;
  const rows = Math.ceil(activeCount / cols);
  const gridScale = isMobile
    ? Math.min(0.76, (0.23 * H) / BH, (0.86 * W) / (cols * BW * 1.18))
    : Math.min(0.78, (0.24 * H) / BH);
  const cellW = BW * gridScale * 1.3;
  const cellH = BH * gridScale * 1.16;

  for (let i = 0; i < phones.length; i++) {
    const ph = phones[i];

    if (!ph.released) {
      if (tSec >= ph.releasedAt) {
        ph.released = true;
        ph.v.z += 120;
      } else {
        ph.t.x = W * 0.5;
        ph.t.y = H * 0.46;
        ph.t.z = -40;
        ph.t.rx = 0;
        ph.t.ry = 0;
        ph.t.rz = ph.tilt;
        ph.t.s = 0.15;
        ph.t.o = 0;
        continue;
      }
    }

    if (focusedPhone) {
      if (ph === focusedPhone) {
        const s = isMobile
          ? Math.min(1.12, (0.31 * H) / BH)
          : Math.min(1.55, (0.56 * H) / BH);
        const fx = isMobile
          ? W * 0.5
          : Math.max(BW * s * 0.72 + 40, 0.36 * W);
        const fy = isMobile ? 0.31 * H : 0.5 * H;

        ph.t.x = fx + (mx - 0.5) * -8;
        ph.t.y = fy + (my - 0.5) * -6;
        ph.t.z = 120;
        ph.t.rz = 0;
        ph.t.ry = (focusInspectBack ? 180 : 0) - 12 + (mx - 0.5) * 12;
        ph.t.rx = (my - 0.5) * -9;
        ph.t.s = s;
        ph.t.o = 1;
      } else {
        const dx = ph.p.x - W * 0.5;
        const dy = ph.p.y - H * 0.5;
        const ang = Math.atan2(dy || Math.sin(i), dx || Math.cos(i));
        ph.t.x = W * 0.5 + Math.cos(ang) * (W * 0.62 + BW);
        ph.t.y = H * 0.5 + Math.sin(ang) * (H * 0.62 + BH);
        ph.t.z = -120;
        ph.t.rx = 0;
        ph.t.ry = 0;
        ph.t.rz = ph.tilt * 1.5;
        ph.t.s = 0.72;
        ph.t.o = 0;
      }
      continue;
    }

    if (draggedPhone && draggedPhone.phone === ph) {
      ph.p.x = pointerX;
      ph.p.y = pointerY;
      ph.v.x = 0;
      ph.v.y = 0;
      ph.t.x = pointerX;
      ph.t.y = pointerY;
      ph.t.z = 110;
      ph.t.s = 1.1;
      ph.t.o = 1;
      ph.t.rz = ph.tilt + clamp(draggedPhone.vx * 2.2, -32, 32);
      ph.t.ry = clamp(draggedPhone.vx * 3, -36, 36);
      ph.t.rx = clamp(-draggedPhone.vy * 3, -30, 30);
      continue;
    }

    if (!ph.active) {
      ph.t.x = ph.p.x;
      ph.t.y = H + 1.2 * BH;
      ph.t.z = -80;
      ph.t.rx = 18;
      ph.t.ry = (i % 2 ? 1 : -1) * 24;
      ph.t.rz = ph.tilt + (i % 2 ? 28 : -28);
      ph.t.s = 0.75;
      ph.t.o = 0;
      continue;
    }

    const k = activePosMap.get(ph) ?? 0;
    const isHovered = hoveredPhone === ph;

    if (layoutMode === "grid") {
      const row = Math.floor(k / cols);
      const col = k % cols;
      const rowCount = row === rows - 1 ? activeCount - row * cols : cols;
      const gx = W * 0.5 + (col - (rowCount - 1) * 0.5) * cellW + (mx - 0.5) * -14 * ph.depth;
      const gy = H * 0.66 + (row - (rows - 1) * 0.5) * cellH + (my - 0.5) * -10 * ph.depth;

      ph.t.x = gx;
      ph.t.y = gy;
      ph.t.z = isHovered ? 70 : 0;
      ph.t.rx = (my - 0.5) * -12;
      ph.t.ry = (mx - 0.5) * 16 + (isHovered ? 12 : 0);
      ph.t.rz = ph.tilt * 0.22 * (isHovered ? 0.45 : 1);
      ph.t.s = gridScale * (isHovered ? 1.07 : 1);
      ph.t.o = 1;
    } else {
      const u = phase / (Math.PI * 2) + k / activeCount;
      const pt = sampleRing(ring, u);
      let x = pt.x;
      let y = pt.y;
      let s = 1;

      const dxTop = Math.abs(x - W * 0.5);
      let topClear = 0;
      if (y < H * 0.56 && dxTop < 0.22 * W) {
        topClear = 0.5 * (1 + Math.cos((dxTop / (0.22 * W)) * Math.PI));
        s *= 1 - 0.34 * topClear;
      }

      x += (mx - 0.5) * -38 * ph.depth;
      y += (my - 0.5) * -26 * ph.depth;
      y += Math.sin(tSec * 0.7 + i * 1.7) * 5;

      let rz = ph.tilt + Math.sin(tSec * 0.55 + i * 1.3) * 2.2;
      let z = (ph.seed - 0.5) * 24;
      let ry = (mx - 0.5) * 22;

      if (pointerActive && !isHovered) {
        const rxVec = x - pointerX;
        const ryVec = y - pointerY;
        const dist = Math.hypot(rxVec, ryVec);
        const maxDist = 1.25 * BW;
        if (dist > 0.001 && dist < maxDist) {
          const push = (1 - dist / maxDist) * 0.35 * BW;
          x += (rxVec / dist) * push;
          y += (ryVec / dist) * push;
        }
      }

      if (isHovered) {
        z = 70;
        s *= 1.07;
        rz *= 0.45;
        ry += 14;
      }

      // Keep orbiting phones safely inside viewport and below the topbar/search pill
      const halfW = 0.5 * BW * s;
      const halfH = 0.5 * BH * s;
      const topSafe = (y < H * 0.56 ? (isMobile ? 152 : 124) * topClear + (isMobile ? 74 : 64) * (1 - topClear) : 24) + halfH;
      const botSafe = H - (isMobile ? 64 : 28) - halfH;
      x = clamp(x, 20 + halfW, W - 20 - halfW);
      y = clamp(y, topSafe, Math.max(topSafe, botSafe));

      ph.t.x = x;
      ph.t.y = y;
      ph.t.z = z;
      ph.t.rx = (my - 0.5) * -16;
      ph.t.ry = ry;
      ph.t.rz = rz;
      ph.t.s = s;
      ph.t.o = 1;
    }
  }
}
