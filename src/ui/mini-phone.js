import { getPhoneThumb } from "../data/phones.js";
import { showToast } from "../utils/dom.js";

export function initMiniPhone({ phones, onShuffle }) {
  const miniPhone = document.getElementById("mini-phone");
  const imgA = document.getElementById("mini-img-a");
  const imgB = document.getElementById("mini-img-b");
  if (!miniPhone || !imgA || !imgB) return;

  function applyPhone(img, p) {
    const hasPhoto = Boolean(p.frontImg);
    img.src = getPhoneThumb(p);
    img.classList.remove("thumb-photo");
    img.style.setProperty("--tscale", String(p.frontScale ?? p.photoScale ?? 1));
    img.parentElement.classList.toggle("is-photo", hasPhoto);
    img.parentElement.style.setProperty("--mframe", hasPhoto ? "transparent" : p.frame);
    miniPhone.classList.toggle("is-photo", hasPhoto);
  }

  let miniIdx = 0;
  let miniAngle = 0;
  applyPhone(imgA, phones[0]);
  applyPhone(imgB, phones[1]);

  setInterval(() => {
    if (document.body.classList.contains("focus")) return;
    miniIdx = (miniIdx + 1) % phones.length;
    const nextPhone = phones[miniIdx];
    miniAngle += 180;
    const showBack = (Math.round(miniAngle / 180) % 2) === 1;
    const targetImg = showBack ? imgB : imgA;
    applyPhone(targetImg, nextPhone);
    miniPhone.style.setProperty("--mframe", nextPhone.frame);
    miniPhone.style.setProperty("--my", `${miniAngle}deg`);
  }, 2600);

  miniPhone.addEventListener("click", () => {
    onShuffle();
    showToast("Lineup shuffled");
  });
}
