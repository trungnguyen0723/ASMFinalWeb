import { addToCart, addToSaved, isSaved, removeFromSaved, subscribe } from "../state/store.js";
import { formatPrice, showToast } from "../utils/dom.js";
import { flyPhoneToTarget } from "./fly-anim.js";

export function initFocus({ phones, getOrderedActivePhones, navbar, onFocusChange }) {
  const focusClose = document.getElementById("focus-close");
  const focusPrev = document.getElementById("fp-prev");
  const focusNext = document.getElementById("fp-next");
  const fpKicker = document.getElementById("fp-kicker");
  const fpTitle = document.getElementById("fp-title");
  const fpSub = document.getElementById("fp-sub");
  const fpChip = document.getElementById("fp-chip");
  const fpDisplay = document.getElementById("fp-display");
  const fpCamera = document.getElementById("fp-camera");
  const fpNote = document.getElementById("fp-note");
  const fpFlip = document.getElementById("fp-flip");
  const fpSave = document.getElementById("fp-save");
  const fpCart = document.getElementById("fp-cart");

  let focusedPhone = null;
  let inspectBack = false;

  function syncSaveBtn() {
    if (!focusedPhone) return;
    const saved = isSaved(focusedPhone.id);
    fpSave.classList.toggle("saved", saved);
    fpSave.textContent = saved ? "Saved ✓" : "Save phone";
  }

  function updatePanel(phone) {
    fpKicker.textContent = `${phone.brand.toUpperCase()} · ${phone.year}`;
    fpTitle.textContent = phone.title;
    fpTitle.classList.toggle("fp-title--long", phone.title.length > 24);
    fpSub.textContent = `${phone.finish} · ${phone.battery} · ★ ${phone.score.toFixed(1)}`;
    fpChip.textContent = phone.chip;
    fpDisplay.textContent = phone.display;
    fpCamera.textContent = phone.camera;
    fpNote.textContent = phone.note;
    fpFlip.textContent = inspectBack ? "Inspect Front" : "Inspect Back";
    if (fpCart) fpCart.textContent = `Add to cart · ${formatPrice(phone.price)}`;
    syncSaveBtn();
  }

  function open(phone) {
    if (!phone) return;
    focusedPhone = phone;
    inspectBack = false;
    document.body.classList.add("focus");
    updatePanel(phone);
    onFocusChange(focusedPhone, inspectBack);
  }

  function close() {
    if (!focusedPhone) return;
    inspectBack = false;
    focusedPhone = null;
    document.body.classList.remove("focus");
    onFocusChange(null, false);
  }

  function step(dir) {
    if (!focusedPhone) return;
    const pool = getOrderedActivePhones();
    const list = pool.length ? pool : phones;
    const pos = list.indexOf(focusedPhone);
    const nextIdx = ((pos === -1 ? 0 : pos) + dir + list.length) % list.length;
    open(list[nextIdx]);
  }

  focusClose?.addEventListener("click", close);
  focusPrev?.addEventListener("click", () => step(-1));
  focusNext?.addEventListener("click", () => step(1));

  fpFlip?.addEventListener("click", () => {
    if (!focusedPhone) return;
    inspectBack = !inspectBack;
    fpFlip.textContent = inspectBack ? "Inspect Front" : "Inspect Back";
    onFocusChange(focusedPhone, inspectBack);
  });

  fpSave?.addEventListener("click", () => {
    if (!focusedPhone) return;
    if (isSaved(focusedPhone.id)) {
      removeFromSaved(focusedPhone.id);
      syncSaveBtn();
      showToast("Removed from saved");
    } else {
      const targetPhone = focusedPhone;
      addToSaved(targetPhone.id);
      syncSaveBtn();
      flyPhoneToTarget(targetPhone, navbar?.shelfBtn, () => navbar?.bumpShelf());
    }
  });

  fpCart?.addEventListener("click", () => {
    if (!focusedPhone) return;
    addToCart(focusedPhone.id, 1, "256GB");
    navbar?.bumpCart();
    showToast(`Added "${focusedPhone.title}" to cart`);
  });

  window.addEventListener("keydown", (e) => {
    if (!focusedPhone) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  subscribe(syncSaveBtn);

  return {
    open,
    close,
    getFocused: () => focusedPhone
  };
}
