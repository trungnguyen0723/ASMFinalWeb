import { clamp } from "../utils/dom.js";

export function buildRing(W, H, isMobile, samples = 720) {
  const rx = (isMobile ? 0.44 : 0.40) * W;
  const ry = (isMobile ? 0.36 : 0.34) * H;
  const cx = W * 0.5;
  const cy = H * 0.56;
  const pts = [];
  let total = 0;

  for (let i = 0; i <= samples; i++) {
    const th = (i / samples) * Math.PI * 2;
    const ct = Math.cos(th);
    const st = Math.sin(th);
    const x = cx + Math.sign(ct) * Math.pow(Math.abs(ct), 0.5) * rx;
    const y = cy + Math.sign(st) * Math.pow(Math.abs(st), 0.5) * ry;
    if (i > 0) {
      total += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
    }
    pts.push({ x, y, len: total });
  }

  for (let i = 0; i <= samples; i++) {
    pts[i].u = total > 0 ? pts[i].len / total : i / samples;
  }

  return { pts, total };
}

export function sampleRing(ring, u) {
  const pts = ring.pts;
  const t = ((u % 1) + 1) % 1;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (pts[mid].u <= t) lo = mid;
    else hi = mid;
  }
  const a = pts[lo];
  const b = pts[hi];
  const span = b.u - a.u || 1;
  const f = clamp((t - a.u) / span, 0, 1);
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f
  };
}
