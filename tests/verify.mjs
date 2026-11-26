import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BASE_TILTS,
  BRANDS,
  RAW_PHONES,
  cameraModuleSvg,
  getPhoneById,
  getPhoneThumb,
  phoneThumbSvg
} from "../src/data/phones.js";
import { buildRing, sampleRing } from "../src/engine/ring.js";
import { C, K, computeTargets, stepSpring } from "../src/engine/physics.js";
import {
  addToCart,
  addToSaved,
  checkoutCart,
  computeCartTotals,
  getCartCount,
  getContactMessages,
  getCurrentUser,
  getOrders,
  getSavedIds,
  loginUser,
  logoutUser,
  registerUser,
  removeFromCart,
  removeFromSaved,
  saveContactMessage,
  updateCartQty,
  updateProfile
} from "../src/state/store.js";
import { clamp, formatPrice, norm } from "../src/utils/dom.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 1. Verify all 6 HTML entrypoints and referenced CSS/JS assets
const pages = [
  "index.html",
  "pages/contact.html",
  "pages/login.html",
  "pages/register.html",
  "pages/profile.html",
  "pages/cart.html"
];

for (const rel of pages) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing page: ${rel}`);
  const html = fs.readFileSync(full, "utf8");
  const dir = path.dirname(full);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = m[1];
    if (target.startsWith("http") || target.startsWith("data:")) continue;
    const resolved = path.resolve(dir, target);
    assert(fs.existsSync(resolved), `${rel} references missing asset: ${target}`);
  }
}

// 2. Verify CSS design tokens & 3D smartphone rules
const tokensCss = fs.readFileSync(path.join(root, "styles/tokens.css"), "utf8");
for (const tok of ["--paper: #f4f1ea", "--ink: #141414", "--mute: #86827a", "feTurbulence", "mix-blend-mode: multiply"]) {
  assert(tokensCss.includes(tok), `Missing token/rule in tokens.css: ${tok}`);
}
const phoneCss = fs.readFileSync(path.join(root, "styles/phone-3d.css"), "utf8");
assert(phoneCss.includes("perspective: 1900px") && phoneCss.includes("touch-action: none"));
assert(phoneCss.includes(".p-front") && phoneCss.includes(".p-back"));
const respCss = fs.readFileSync(path.join(root, "styles/responsive.css"), "utf8");
assert(respCss.includes("max-width: 759px") && respCss.includes("10.2vw"));

// 3. Verify 12 phones across 4 brands & SVG generators
assert.equal(RAW_PHONES.length, 12);
assert.equal(BASE_TILTS.length, 12);
assert.deepEqual(BRANDS, ["Apple", "Samsung", "OPPO", "Xiaomi"]);
const brandCounts = RAW_PHONES.reduce((acc, p) => {
  acc[p.brand] = (acc[p.brand] || 0) + 1;
  return acc;
}, {});
assert.deepEqual(brandCounts, { Apple: 3, Samsung: 3, OPPO: 3, Xiaomi: 3 });

assert.equal(getPhoneById("apple-iphone-18-pro-max").title, "iPhone 18 Pro Max");
assert.equal(getPhoneById("apple-iphone-17").title, "iPhone 17");
assert.equal(getPhoneById("apple-iphone-17-pro-max").title, "iPhone 17 Pro Max");
assert.equal(getPhoneById("samsung-galaxy-s26-ultra").title, "Samsung Galaxy S26 Ultra");
assert.equal(getPhoneById("samsung-galaxy-a17-5g").title, "Samsung Galaxy A17 5G");
assert.equal(getPhoneById("samsung-galaxy-s26").title, "Samsung Galaxy S26");
assert.equal(getPhoneById("oppo-find-x9s").title, "OPPO Find X9s");
assert.equal(getPhoneById("oppo-find-x10-pro-max").title, "OPPO Find X10 Pro Max");
assert.equal(getPhoneById("oppo-reno15-5g").title, "OPPO Reno15 5G");
for (const ph of RAW_PHONES) {
  for (const field of ["frontImg", "backImg"]) {
    if (ph[field] && !ph[field].startsWith("http")) {
      assert(fs.existsSync(path.join(root, ph[field])), `Missing local phone asset: ${ph[field]}`);
    }
  }
}
const r15 = getPhoneById("oppo-reno15-5g");
assert.equal(getPhoneThumb(r15), "./assets/phones/oppo-reno15-front.png");
const x17t = getPhoneById("xiaomi-17t-5g");
const x18pm = getPhoneById("xiaomi-18-pro-max");
const xr17 = getPhoneById("xiaomi-redmi-17-4g");
assert.equal(x17t.title, "Điện thoại Xiaomi 17T 5G 12GB/512GB chính hãng");
assert.equal(x18pm.title, "Xiaomi 18 Pro Max");
assert.equal(xr17.title, "Điện thoại Xiaomi REDMI 17 4G 6GB/256GB");
assert(x17t.frontImg.includes("p12a-black-front-r1-wallpaper.png") && x17t.backImg.includes("p12a-black-back-r3.png"));
assert(x18pm.frontImg.includes("(1).png") && x18pm.backImg.includes("(4).png"));
assert(xr17.frontImg.includes("q15a-black-front") && xr17.backImg.includes("q15a-black-back"));
assert(phoneThumbSvg(RAW_PHONES[0]).startsWith("data:image/svg+xml"));
assert(cameraModuleSvg(RAW_PHONES[6]).includes("<svg"));
assert.equal(norm("Snapdragon® 8"), "snapdragon® 8");
assert.equal(formatPrice(1199), "$1,199");
assert.equal(clamp(15, 0, 10), 10);

// 4. Verify ring & spring physics + 180° Inspect Back rotation
const ring = buildRing(1440, 900, false);
assert.equal(ring.pts.length, 721);
assert(ring.total > 3000 && ring.total < 4500);
const p0 = sampleRing(ring, 0);
const pHalf = sampleRing(ring, 0.5);
assert(p0.x > pHalf.x);

assert.deepEqual(K, { x: 120, y: 120, z: 140, rx: 160, ry: 160, rz: 120, s: 170, o: 90 });
assert.deepEqual(C, { x: 17, y: 17, z: 20, rx: 18, ry: 18, rz: 15, s: 21, o: 19 });

const simPhones = RAW_PHONES.map((p, i) => ({
  ...p,
  idx: i,
  seed: Math.sin(i * 91.7) * 0.5 + 0.5,
  depth: 1,
  tilt: BASE_TILTS[i],
  releasedAt: 0.25 + i * 0.07,
  released: false,
  active: true,
  p: { x: 720, y: 414, z: -40, rx: 0, ry: 0, rz: BASE_TILTS[i], s: 0.15, o: 0 },
  v: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 0, o: 0 },
  t: { x: 720, y: 414, z: 0, rx: 0, ry: 0, rz: BASE_TILTS[i], s: 0.15, o: 0 }
}));
const order = simPhones.map((_, i) => i);
for (let f = 0; f < 100; f++) {
  computeTargets(simPhones, order, {
    tSec: f * 0.02,
    W: 1440,
    H: 900,
    BW: 152,
    BH: 270,
    isMobile: false,
    ring,
    phase: f * 0.01,
    mx: 0.5,
    my: 0.5,
    pointerX: -999,
    pointerY: -999,
    pointerActive: false,
    layoutMode: "orbit",
    focusedPhone: null,
    focusInspectBack: false,
    hoveredPhone: null,
    draggedPhone: null
  });
  for (const ph of simPhones) stepSpring(ph, 0.016);
}
assert(simPhones.every((ph) => ph.released && ph.p.o > 0.8), "All 12 phones should release and fade in");

// Check top/bottom/side viewport bounds when filtered to 3 phones (like Samsung chip)
for (const ph of simPhones) ph.active = ph.brand === "Samsung";
computeTargets(simPhones, order, {
  tSec: 3,
  W: 1440,
  H: 900,
  BW: 152,
  BH: 270,
  isMobile: false,
  ring,
  phase: -Math.PI * 0.5, // forces a phone right at top-center
  mx: 0.5,
  my: 0.5,
  pointerX: -999,
  pointerY: -999,
  pointerActive: false,
  layoutMode: "orbit",
  focusedPhone: null,
  focusInspectBack: false,
  hoveredPhone: null,
  draggedPhone: null
});
for (const ph of simPhones.filter((p) => p.active)) {
  const topEdge = ph.t.y - 0.5 * 270 * ph.t.s;
  const botEdge = ph.t.y + 0.5 * 270 * ph.t.s;
  assert(topEdge >= 19, `Top edge clipped off screen: ${topEdge}`);
  assert(botEdge <= 900 - 20, `Bottom edge clipped off screen: ${botEdge}`);
  if (Math.abs(ph.t.x - 720) < 0.15 * 1440 && ph.t.y < 450) {
    assert(topEdge >= 110, `Top-center phone overlapped search pill: topEdge=${topEdge}`);
  }
}
for (const ph of simPhones) ph.active = true;

// Check Focus Inspect Back sets target ry near 168deg
computeTargets(simPhones, order, {
  tSec: 3,
  W: 1440,
  H: 900,
  BW: 152,
  BH: 270,
  isMobile: false,
  ring,
  phase: 0,
  mx: 0.5,
  my: 0.5,
  pointerX: -999,
  pointerY: -999,
  pointerActive: false,
  layoutMode: "orbit",
  focusedPhone: simPhones[0],
  focusInspectBack: true,
  hoveredPhone: null,
  draggedPhone: null
});
assert.equal(simPhones[0].t.ry, 168);

// 5. Verify Store: Auth, Profile, Saved, Cart (256GB/512GB + PHONE10), Checkout & Contact
const badLogin = loginUser({ email: "demo@phoneroom.store", password: "wrong" });
assert.equal(badLogin.ok, false);

const demoLogin = loginUser({ email: "demo@phoneroom.store", password: "phone2026" });
assert.equal(demoLogin.ok, true);
assert.equal(getCurrentUser().name, "Minh Nguyen");

logoutUser();
assert.equal(getCurrentUser(), null);

const reg = registerUser({
  name: "Linh Tran",
  email: "linh@phoneroom.store",
  password: "password123",
  brandPref: "Samsung"
});
assert.equal(reg.ok, true);
assert.equal(getCurrentUser().brandPref, "Samsung");

const dupReg = registerUser({ name: "Linh", email: "linh@phoneroom.store", password: "password123" });
assert.equal(dupReg.ok, false);

updateProfile({ name: "Linh T.", brandPref: "OPPO", bio: "Hasselblad shooter." });
assert.equal(getCurrentUser().brandPref, "OPPO");

addToSaved(RAW_PHONES[0].id);
addToSaved(RAW_PHONES[3].id);
assert.equal(getSavedIds().length, 2);
removeFromSaved(RAW_PHONES[0].id);
assert.deepEqual(getSavedIds(), [RAW_PHONES[3].id]);

addToCart(RAW_PHONES[0].id, 1, "256GB"); // $1299
addToCart(RAW_PHONES[0].id, 1, "256GB"); // $1299 * 2 = $2598
addToCart(RAW_PHONES[3].id, 1, "512GB"); // $1349 + $120 = $1469
assert.equal(getCartCount(), 3);

updateCartQty(RAW_PHONES[0].id, -1, "256GB"); // $1299 + $1469 = $2768
assert.equal(getCartCount(), 2);

const totals = computeCartTotals("PHONE10");
assert.equal(totals.subtotal, 2768);
assert.equal(totals.discount, 276.8);
assert.equal(totals.shipping, 0);
assert.equal(totals.total, 2491.2);

const co = checkoutCart({ email: "linh@phoneroom.store", promoCode: "PHONE10" });
assert.equal(co.ok, true);
assert.equal(getCartCount(), 0);
assert.equal(getOrders().length, 1);
assert.equal(getOrders()[0].total, 2491.2);

removeFromCart(RAW_PHONES[0].id, "256GB");

const contactRes = saveContactMessage({
  name: "Linh T.",
  email: "linh@phoneroom.store",
  topic: "Device Advice",
  message: "Comparing Pixel 9 Pro and Galaxy S25."
});
assert.equal(contactRes.ok, true);
assert.equal(getContactMessages().length, 1);

console.log("PASS: All 6 Phone Room pages, CSS 3D phones, 4 brands x3, Inspect Back physics, auth, profile, saved & cart tests passed.");
