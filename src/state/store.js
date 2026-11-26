import { getPhoneById } from "../data/phones.js";

const KEYS = {
  users: "phoneroom_users_v1",
  session: "phoneroom_session_v1",
  wishlist: "phoneroom_wishlist_v1",
  cart: "phoneroom_cart_v1",
  orders: "phoneroom_orders_v1",
  messages: "phoneroom_messages_v1"
};

const memStorage = new Map();
function storage() {
  if (typeof localStorage !== "undefined") return localStorage;
  return {
    getItem: (k) => (memStorage.has(k) ? memStorage.get(k) : null),
    setItem: (k, v) => memStorage.set(k, String(v)),
    removeItem: (k) => memStorage.delete(k)
  };
}

function readJson(key, fallback) {
  try {
    const raw = storage().getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    storage().setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues in restricted environments
  }
  notify();
}

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

function ensureDemoUser() {
  const users = readJson(KEYS.users, []);
  if (!users.some((u) => u.email === "demo@phoneroom.store")) {
    users.push({
      id: "demo-member",
      name: "Minh Nguyen",
      email: "demo@phoneroom.store",
      password: "phone2026",
      brandPref: "Apple",
      bio: "Mobile photographer and hardware enthusiast comparing flagship camera sensors.",
      joinedAt: "2025-03-14"
    });
    try {
      storage().setItem(KEYS.users, JSON.stringify(users));
    } catch {
      // ignore
    }
  }
}
ensureDemoUser();

/* --- Auth & Profile --- */
export function getUsers() {
  ensureDemoUser();
  return readJson(KEYS.users, []);
}

export function getCurrentUser() {
  const sessionEmail = readJson(KEYS.session, null);
  if (!sessionEmail) return null;
  return getUsers().find((u) => u.email === sessionEmail) || null;
}

export function registerUser({ name, email, password, brandPref = "Apple" }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();
  if (!cleanName || !cleanEmail || !password) {
    return { ok: false, error: "Please fill in your name, email, and password." };
  }
  const users = getUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    return { ok: false, error: "An account with that email already exists." };
  }
  const user = {
    id: `u_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password,
    brandPref,
    bio: "Exploring flagship smartphones and mobile optics.",
    joinedAt: new Date().toISOString().slice(0, 10)
  };
  users.push(user);
  writeJson(KEYS.users, users);
  writeJson(KEYS.session, user.email);
  return { ok: true, user };
}

export function loginUser({ email, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const user = getUsers().find((u) => u.email === cleanEmail);
  if (!user || user.password !== password) {
    return { ok: false, error: "Email or password did not match our records." };
  }
  writeJson(KEYS.session, user.email);
  return { ok: true, user };
}

export function logoutUser() {
  storage().removeItem(KEYS.session);
  notify();
}

export function updateProfile({ name, brandPref, bio }) {
  const current = getCurrentUser();
  if (!current) return { ok: false, error: "You must be signed in to update your profile." };
  const users = getUsers().map((u) =>
    u.email === current.email
      ? {
          ...u,
          name: String(name || u.name).trim() || u.name,
          brandPref: String(brandPref || u.brandPref).trim() || u.brandPref,
          bio: String(bio ?? u.bio).trim()
        }
      : u
  );
  writeJson(KEYS.users, users);
  return { ok: true, user: getCurrentUser() };
}

/* --- Saved Wishlist --- */
export function getSavedIds() {
  return readJson(KEYS.wishlist, []);
}

export function isSaved(phoneId) {
  return getSavedIds().includes(phoneId);
}

export function addToSaved(phoneId) {
  const ids = getSavedIds();
  if (!ids.includes(phoneId)) {
    ids.push(phoneId);
    writeJson(KEYS.wishlist, ids);
  }
  return ids;
}

export function removeFromSaved(phoneId) {
  const next = getSavedIds().filter((id) => id !== phoneId);
  writeJson(KEYS.wishlist, next);
  return next;
}

/* --- My Cart --- */
export function getCart() {
  return readJson(KEYS.cart, []);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function addToCart(phoneId, qty = 1, storageTier = "256GB") {
  const phone = getPhoneById(phoneId);
  if (!phone) return getCart();
  const cart = getCart();
  const existing = cart.find((item) => item.id === phoneId && item.storageTier === storageTier);
  if (existing) {
    existing.qty = Math.min(20, existing.qty + qty);
  } else {
    cart.push({ id: phoneId, storageTier, qty: Math.max(1, qty) });
  }
  writeJson(KEYS.cart, cart);
  return cart;
}

export function updateCartQty(phoneId, delta, storageTier = "256GB") {
  const cart = getCart()
    .map((item) =>
      item.id === phoneId && item.storageTier === storageTier
        ? { ...item, qty: item.qty + delta }
        : item
    )
    .filter((item) => item.qty > 0);
  writeJson(KEYS.cart, cart);
  return cart;
}

export function removeFromCart(phoneId, storageTier = "256GB") {
  const cart = getCart().filter((item) => !(item.id === phoneId && item.storageTier === storageTier));
  writeJson(KEYS.cart, cart);
  return cart;
}

export function clearCart() {
  writeJson(KEYS.cart, []);
}

export function computeCartTotals(promoCode = "") {
  const items = getCart()
    .map((entry) => {
      const phone = getPhoneById(entry.id);
      if (!phone) return null;
      const unitPrice = entry.storageTier === "512GB" ? phone.price + 120 : phone.price;
      return {
        ...entry,
        phone,
        unitPrice,
        lineTotal: unitPrice * entry.qty
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((s, x) => s + x.lineTotal, 0);
  const code = String(promoCode || "").trim().toUpperCase();
  const discountRate = code === "PHONE10" ? 0.1 : 0;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const shipping = 0; // Free insured express courier on all phones
  const total = Math.max(0, subtotal - discount + shipping);

  return { items, subtotal, discount, discountRate, shipping, total, promoValid: discountRate > 0 };
}

export function checkoutCart({ email, note = "", promoCode = "" } = {}) {
  const totals = computeCartTotals(promoCode);
  if (totals.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  const user = getCurrentUser();
  const order = {
    id: `PR-${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().slice(0, 10),
    email: email || user?.email || "guest@phoneroom.store",
    note,
    items: totals.items.map((x) => ({
      id: x.id,
      title: x.phone.title,
      brand: x.phone.brand,
      storageTier: x.storageTier,
      qty: x.qty,
      unitPrice: x.unitPrice
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total
  };
  const orders = readJson(KEYS.orders, []);
  orders.unshift(order);
  writeJson(KEYS.orders, orders);
  clearCart();
  return { ok: true, order };
}

export function getOrders() {
  return readJson(KEYS.orders, []);
}

/* --- Contact Inquiries --- */
export function saveContactMessage({ name, email, topic, message }) {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim();
  const cleanMsg = String(message || "").trim();
  if (!cleanName || !cleanEmail || !cleanMsg) {
    return { ok: false, error: "Please complete your name, email, and message." };
  }
  const list = readJson(KEYS.messages, []);
  const entry = {
    id: `msg_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    topic: topic || "Device Advice",
    message: cleanMsg,
    createdAt: new Date().toISOString()
  };
  list.unshift(entry);
  writeJson(KEYS.messages, list);
  return { ok: true, entry };
}

export function getContactMessages() {
  return readJson(KEYS.messages, []);
}
