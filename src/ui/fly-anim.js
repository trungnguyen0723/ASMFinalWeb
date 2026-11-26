import { getPhoneThumb } from "../data/phones.js";
import { clamp } from "../utils/dom.js";

export function flyPhoneToTarget(phone, targetEl, onLand) {
  if (!phone || !targetEl) {
    onLand?.();
    return;
  }

  const rect = phone.el.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const startX = rect.left + rect.width * 0.5;
  const startY = rect.top + rect.height * 0.5;
  const endX = targetRect.left + targetRect.width * 0.5;
  const endY = targetRect.top + targetRect.height * 0.5;

  const w = Math.max(68, rect.width * 0.42);
  const h = w * 1.78;

  const clone = document.createElement("div");
  clone.className = "fly-clone";
  clone.style.width = `${w}px`;
  clone.style.height = `${h}px`;
  clone.style.left = `${-w / 2}px`;
  clone.style.top = `${-h / 2}px`;
  clone.style.backgroundColor = phone.frontImg ? "transparent" : phone.frame;
  clone.innerHTML = `<img class="${phone.frontImg ? "thumb-photo" : ""}" style="--tscale:${phone.photoScale || 1.06}" src="${getPhoneThumb(phone)}" alt="" />`;
  document.body.appendChild(clone);

  const ctrlX = (startX + endX) * 0.5 + (startX < endX ? -60 : 60);
  const ctrlY = Math.min(startY, endY) - 160;
  const startTime = performance.now();
  const duration = 900;

  function tick(now) {
    const raw = clamp((now - startTime) / duration, 0, 1);
    const t = 1 - Math.pow(1 - raw, 3);
    const inv = 1 - t;
    const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
    const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;
    const scale = 1 - 0.92 * t;
    const rot = -14 + 340 * t;

    clone.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
    clone.style.opacity = raw > 0.85 ? String((1 - raw) / 0.15) : "1";

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      clone.remove();
      onLand?.();
    }
  }
  requestAnimationFrame(tick);
}
