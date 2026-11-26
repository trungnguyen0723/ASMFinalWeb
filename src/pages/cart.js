import { mountNavbar } from "../components/navbar.js";
import { RAW_PHONES, getPhoneThumb } from "../data/phones.js";
import {
  addToCart,
  checkoutCart,
  computeCartTotals,
  getCurrentUser,
  removeFromCart,
  subscribe,
  updateCartQty
} from "../state/store.js";
import { escapeHtml, formatPrice, showToast } from "../utils/dom.js";

mountNavbar({ activePage: "cart" });

const root = document.getElementById("cart-root");
let promoCode = "";
let lastOrder = null;

function render() {
  const totals = computeCartTotals(promoCode);
  const user = getCurrentUser();

  if (lastOrder && totals.items.length === 0) {
    root.innerHTML = `
      <div class="page-head">
        <h1 class="page-title">Order Confirmed</h1>
        <p class="page-lead">Order #${escapeHtml(lastOrder.id)} is reserved for ${escapeHtml(lastOrder.email)}.</p>
      </div>
      <div class="sheet" style="max-width:620px;">
        <h2 class="sheet-title">Receipt Summary</h2>
        <div class="summary-lines">
          ${lastOrder.items.map((it) => `
            <div class="summary-line">
              <span>${escapeHtml(it.title)} · ${escapeHtml(it.storageTier)} × ${it.qty}</span>
              <span class="tabular">${formatPrice(it.unitPrice * it.qty)}</span>
            </div>
          `).join("")}
          <div class="summary-line total">
            <span>Total Paid</span>
            <span class="tabular">${formatPrice(lastOrder.total)}</span>
          </div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="../index.html" class="btn-primary">Return to 3D Orbit</a>
          <a href="profile.html" class="btn-outline">View in Profile</a>
        </div>
      </div>
    `;
    return;
  }

  if (totals.items.length === 0) {
    const picks = [RAW_PHONES[0], RAW_PHONES[3], RAW_PHONES[6]];
    root.innerHTML = `
      <div class="page-head">
        <h1 class="page-title">My Cart</h1>
        <p class="page-lead">Factory unlocked flagship smartphones with insured express delivery.</p>
      </div>

      <div class="empty-state">
        <p>Your cart is empty. Inspect any model in the 3D orbit or add a flagship pick below.</p>
        <a href="../index.html" class="btn-primary">Browse 3D Orbit</a>
      </div>

      <div class="quick-grid">
        ${picks.map((p) => `
          <div class="quick-item">
            <span class="row-cover" style="width:48px; height:64px; flex-shrink:0; background-color:${p.frontImg ? "transparent" : p.frame}">
              <img class="${p.frontImg ? "thumb-photo" : ""}" style="--tscale:${p.frontScale ?? p.photoScale ?? 1.06}" src="${getPhoneThumb(p)}" alt="${escapeHtml(p.title)}" />
            </span>
            <div style="flex:1; min-width:0;">
              <div class="search-title">${escapeHtml(p.title)}</div>
              <div class="search-sub">${escapeHtml(p.brand)} · ${formatPrice(p.price)}</div>
            </div>
            <button type="button" class="btn-outline" style="height:34px; padding:0 12px;" data-quick-add="${p.id}">Add</button>
          </div>
        `).join("")}
      </div>
    `;

    root.querySelectorAll("[data-quick-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        addToCart(btn.dataset.quickAdd, 1, "256GB");
        showToast("Added to cart");
      });
    });
    return;
  }

  root.innerHTML = `
    <div class="page-head">
      <h1 class="page-title">My Cart</h1>
      <p class="page-lead">${totals.items.reduce((s, x) => s + x.qty, 0)} device(s) ready for dispatch. Use code <strong>PHONE10</strong> for 10% off.</p>
    </div>

    <div class="split-grid split-grid--cart">
      <section aria-label="Cart items">
        <div class="book-list">
          ${totals.items.map((item) => `
            <div class="book-row">
              <div class="row-cover" style="background-color:${item.phone.frontImg ? "transparent" : item.phone.frame}">
                <img class="${item.phone.frontImg ? "thumb-photo" : ""}" style="--tscale:${item.phone.photoScale || 1.06}" src="${getPhoneThumb(item.phone)}" alt="${escapeHtml(item.phone.title)}" />
              </div>
              <div>
                <div class="row-title"><a href="../index.html?phone=${encodeURIComponent(item.id)}">${escapeHtml(item.phone.title)}</a></div>
                <div class="row-meta">${escapeHtml(item.phone.brand)} · ${escapeHtml(item.phone.finish)} · ${escapeHtml(item.storageTier)} · ${formatPrice(item.unitPrice)} each</div>
                <div style="margin-top:8px;">
                  <button type="button" class="link-subtle" data-switch="${item.id}" data-tier="${escapeHtml(item.storageTier)}">
                    Switch to ${item.storageTier === "256GB" ? "512GB (+$120)" : "256GB"}
                  </button>
                </div>
              </div>
              <div class="row-controls">
                <div class="row-price">${formatPrice(item.lineTotal)}</div>
                <div class="row-actions">
                  <div class="qty-pill">
                    <button type="button" data-dec="${item.id}" data-tier="${escapeHtml(item.storageTier)}" aria-label="Decrease quantity">−</button>
                    <span>${item.qty}</span>
                    <button type="button" data-inc="${item.id}" data-tier="${escapeHtml(item.storageTier)}" aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" class="link-subtle" data-rm="${item.id}" data-tier="${escapeHtml(item.storageTier)}">Remove</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <aside class="sheet">
        <h2 class="sheet-title">Order Summary</h2>
        <div class="promo-row">
          <input class="input" id="promo-input" type="text" placeholder="Promo code (PHONE10)" value="${escapeHtml(promoCode)}" />
          <button type="button" class="btn-outline" id="promo-apply">Apply</button>
        </div>

        <div class="summary-lines">
          <div class="summary-line">
            <span>Subtotal</span>
            <span class="tabular">${formatPrice(totals.subtotal)}</span>
          </div>
          ${totals.discount > 0 ? `
            <div class="summary-line" style="color:var(--accent-ok);">
              <span>Promo (PHONE10)</span>
              <span class="tabular">−${formatPrice(totals.discount)}</span>
            </div>
          ` : ""}
          <div class="summary-line">
            <span>Express Insured Shipping</span>
            <span class="tabular">Free</span>
          </div>
          <div class="summary-line total">
            <span>Total</span>
            <span class="tabular">${formatPrice(totals.total)}</span>
          </div>
        </div>

        <form id="checkout-form" class="form-stack">
          <div class="field">
            <label for="co-email">Delivery & invoice email</label>
            <input class="input" id="co-email" type="email" value="${escapeHtml(user?.email || "")}" placeholder="you@studio.design" required />
          </div>
          <div id="co-msg" class="form-msg"></div>
          <button type="submit" class="btn-primary" style="width:100%;">Complete Checkout</button>
        </form>
      </aside>
    </div>
  `;

  root.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => updateCartQty(btn.dataset.inc, 1, btn.dataset.tier));
  });
  root.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => updateCartQty(btn.dataset.dec, -1, btn.dataset.tier));
  });
  root.querySelectorAll("[data-rm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.rm, btn.dataset.tier);
      showToast("Removed from cart");
    });
  });
  root.querySelectorAll("[data-switch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.switch;
      const oldTier = btn.dataset.tier;
      const newTier = oldTier === "256GB" ? "512GB" : "256GB";
      const current = totals.items.find((x) => x.id === id && x.storageTier === oldTier);
      const qty = current ? current.qty : 1;
      removeFromCart(id, oldTier);
      addToCart(id, qty, newTier);
      showToast(`Switched to ${newTier}`);
    });
  });

  document.getElementById("promo-apply")?.addEventListener("click", () => {
    promoCode = document.getElementById("promo-input").value.trim();
    if (promoCode.toUpperCase() === "PHONE10") showToast("10% discount applied");
    else if (promoCode) showToast("Code not recognized (try PHONE10)");
    render();
  });

  document.getElementById("checkout-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("co-email").value.trim();
    const msg = document.getElementById("co-msg");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.className = "form-msg error";
      msg.textContent = "Please enter a valid email address for your receipt.";
      return;
    }
    const res = checkoutCart({ email, promoCode });
    if (!res.ok) {
      msg.className = "form-msg error";
      msg.textContent = res.error;
      return;
    }
    lastOrder = res.order;
    showToast("Order placed");
    render();
  });
}

render();
subscribe(render);
