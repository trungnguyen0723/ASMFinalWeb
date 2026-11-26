import { BASE_TILTS, RAW_PHONES, cameraModuleSvg, resolveAssetUrl } from "../data/phones.js";
import { clamp, formatPrice } from "../utils/dom.js";

export function createPhones(stage, W, H) {
  return RAW_PHONES.map((data, i) => {
    const seed = Math.sin(i * 91.7) * 0.5 + 0.5;
    const tilt = BASE_TILTS[i];

    const shadowEl = document.createElement("div");
    shadowEl.className = "bshadow";
    stage.appendChild(shadowEl);

    const el = document.createElement("div");
    const hasPhoto = Boolean(data.frontImg && data.backImg);
    el.className = `phone${hasPhoto ? " has-photo" : ""}${data.isFold ? " is-fold" : ""}`;
    el.style.setProperty("--frame", data.frame);
    el.style.setProperty("--back", data.back);
    el.style.setProperty("--screenA", data.screenA);
    el.style.setProperty("--screenB", data.screenB);
    if (hasPhoto) {
      el.style.setProperty("--pscale", String(data.photoScale ?? 1.06));
      if (data.frontScale != null) el.style.setProperty("--fscale", String(data.frontScale));
      if (data.backScale != null) el.style.setProperty("--bscale", String(data.backScale));
      el.style.setProperty("--pw", String(data.photoWidth ?? 0.84));
    }
    el.dataset.index = String(i);

    el.innerHTML = hasPhoto
      ? `
        <div class="p3d">
          <div class="p-face p-left"></div>
          <div class="p-face p-right"></div>
          <div class="p-face p-top"></div>
          <div class="p-face p-bottom"></div>
          <div class="p-face p-back">
            <div class="p-photo-clip">
              <img class="p-real-img" src="${resolveAssetUrl(data.backImg)}" alt="${data.title} back view" draggable="false" />
            </div>
          </div>
          <div class="p-face p-front">
            <div class="p-photo-clip">
              <img class="p-real-img" src="${resolveAssetUrl(data.frontImg)}" alt="${data.title} front view" draggable="false" />
              <div class="sheen"></div>
            </div>
          </div>
        </div>
      `
      : `
        <div class="p3d">
          <div class="p-face p-left"></div>
          <div class="p-face p-right"></div>
          <div class="p-face p-top"></div>
          <div class="p-face p-bottom"></div>
          <div class="p-face p-back">
            ${cameraModuleSvg(data)}
            <div class="p-back-brand">${data.brand}</div>
          </div>
          <div class="p-face p-front">
            <div class="p-bezel">
              <div class="p-screen">
                <div class="p-notch ${data.notch}"></div>
                <div class="p-ui-mid">
                  <div class="p-time">9:41</div>
                  <div class="p-brand-tag">${data.brand}</div>
                </div>
                <div class="p-ui-foot">
                  <div class="p-model">${data.title}</div>
                  <div class="p-finish">${data.finish} · ${formatPrice(data.price)}</div>
                </div>
                <div class="sheen"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    stage.appendChild(el);

    const startX = W * 0.5;
    const startY = H * 0.46;

    return {
      ...data,
      idx: i,
      seed,
      depth: 0.6 + seed * 0.8,
      tilt,
      el,
      shadowEl,
      releasedAt: 0.25 + i * 0.07,
      released: false,
      active: true,
      p: { x: startX, y: startY, z: -40, rx: 0, ry: 0, rz: tilt, s: 0.15, o: 0 },
      v: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 0, o: 0 },
      t: { x: startX, y: startY, z: 0, rx: 0, ry: 0, rz: tilt, s: 0.15, o: 0 }
    };
  });
}

export function renderPhonesDOM(phones, { BW, BH, focusedPhone, draggedPhone, hoveredPhone }) {
  const sorted = phones.slice().sort((a, b) => a.p.z - b.p.z);
  for (let rank = 0; rank < sorted.length; rank++) {
    const ph = sorted[rank];
    const isTop = ph === focusedPhone || (draggedPhone && draggedPhone.phone === ph) || hoveredPhone === ph;
    const zIdx = isTop ? 60 : 12 + rank;
    ph.shadowEl.style.zIndex = String(zIdx - 1);
    ph.el.style.zIndex = String(zIdx);
  }

  for (let i = 0; i < phones.length; i++) {
    const ph = phones[i];
    const p = ph.p;
    const op = clamp(p.o, 0, 1);

    ph.el.style.opacity = op >= 0.995 ? "" : op.toFixed(3);
    ph.el.style.pointerEvents = op > 0.15 && (ph.active || ph === focusedPhone) ? "auto" : "none";
    ph.el.style.transform =
      `translate3d(${(p.x - BW / 2).toFixed(2)}px, ${(p.y - BH / 2).toFixed(2)}px, ${p.z.toFixed(2)}px) ` +
      `rotateZ(${p.rz.toFixed(2)}deg) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) scale(${p.s.toFixed(4)})`;
    ph.el.style.setProperty("--gx", `${clamp(p.ry * 2.2 - p.rx * 0.8, -60, 60).toFixed(1)}px`);

    const lift = Math.max(0, p.z + 40);
    const sx = p.x - BW / 2 + 8 + lift * 0.14;
    const sy = p.y - BH / 2 + 16 + lift * 0.22;
    const sScale = p.s * (1 + lift * 0.0005);
    const sOp = op * clamp(1 - lift / 360, 0.18, 1);

    ph.shadowEl.style.opacity = sOp.toFixed(3);
    ph.shadowEl.style.transform =
      `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0px) rotateZ(${p.rz.toFixed(2)}deg) scale(${sScale.toFixed(4)})`;
  }
}
