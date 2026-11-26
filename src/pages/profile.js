import { mountNavbar } from "../components/navbar.js";
import { getPhoneById, getPhoneThumb } from "../data/phones.js";
import {
  addToCart,
  getCurrentUser,
  getOrders,
  getSavedIds,
  logoutUser,
  removeFromSaved,
  subscribe,
  updateProfile
} from "../state/store.js";
import { escapeHtml, formatPrice, showToast } from "../utils/dom.js";

mountNavbar({ activePage: "profile" });

const root = document.getElementById("profile-root");
let activeTab = "account";

function render() {
  const user = getCurrentUser();
  if (!user) {
    root.innerHTML = `
      <div class="page-head">
        <h1 class="page-title">Member Profile</h1>
        <p class="page-lead">Sign in or register to manage your saved phones, brand preferences, and order history.</p>
      </div>
      <div class="empty-state">
        <p>You are currently browsing as a guest. Your Saved phones and My Cart are still kept on this device.</p>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <a href="login.html" class="btn-primary">Sign in</a>
          <a href="register.html" class="btn-outline">Create an account</a>
        </div>
      </div>
    `;
    return;
  }

  const savedPhones = getSavedIds().map((id) => getPhoneById(id)).filter(Boolean);
  const orders = getOrders();

  root.innerHTML = `
    <div class="page-head" style="display:flex; justify-content:space-between; align-items:flex-end; gap:18px; flex-wrap:wrap;">
      <div>
        <h1 class="page-title">${escapeHtml(user.name)}</h1>
        <p class="page-lead">Preferred brand: ${escapeHtml(user.brandPref)} · Member since ${escapeHtml(user.joinedAt)}</p>
      </div>
      <button type="button" class="btn-outline" id="logout-btn">Sign out</button>
    </div>

    <div class="profile-tabs" role="tablist">
      <button type="button" class="tab-btn ${activeTab === "account" ? "active" : ""}" data-tab="account">Account Details</button>
      <button type="button" class="tab-btn ${activeTab === "saved" ? "active" : ""}" data-tab="saved">Saved Phones (${savedPhones.length})</button>
      <button type="button" class="tab-btn ${activeTab === "orders" ? "active" : ""}" data-tab="orders">Orders (${orders.length})</button>
    </div>

    <div id="tab-content"></div>
  `;

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    logoutUser();
    showToast("Signed out");
  });

  root.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      render();
    });
  });

  const panel = document.getElementById("tab-content");

  if (activeTab === "account") {
    panel.innerHTML = `
      <div class="split-grid">
        <section class="sheet">
          <h2 class="sheet-title">Edit Profile</h2>
          <form id="profile-form" class="form-stack">
            <div class="field">
              <label for="p-name">Display name</label>
              <input class="input" id="p-name" type="text" value="${escapeHtml(user.name)}" required />
            </div>
            <div class="field">
              <label for="p-email">Email</label>
              <input class="input" id="p-email" type="email" value="${escapeHtml(user.email)}" disabled />
            </div>
            <div class="field">
              <label for="p-brand">Preferred phone brand</label>
              <select class="select" id="p-brand">
                ${["Apple", "Samsung", "OPPO", "Xiaomi"].map((b) =>
                  `<option value="${b}" ${user.brandPref === b ? "selected" : ""}>${b}</option>`
                ).join("")}
              </select>
            </div>
            <div class="field">
              <label for="p-bio">Bio</label>
              <textarea class="textarea" id="p-bio">${escapeHtml(user.bio || "")}</textarea>
            </div>
            <div id="profile-msg" class="form-msg"></div>
            <div>
              <button type="submit" class="btn-primary">Save changes</button>
            </div>
          </form>
        </section>

        <aside>
          <h2 class="sheet-title">Account Summary</h2>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-val">${escapeHtml(user.email)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Saved Phones</span>
              <span class="info-val tabular">${savedPhones.length} devices</span>
            </div>
            <div class="info-row">
              <span class="info-label">Completed Orders</span>
              <span class="info-val tabular">${orders.length}</span>
            </div>
          </div>
        </aside>
      </div>
    `;

    document.getElementById("profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const res = updateProfile({
        name: document.getElementById("p-name").value,
        brandPref: document.getElementById("p-brand").value,
        bio: document.getElementById("p-bio").value
      });
      const msg = document.getElementById("profile-msg");
      if (res.ok) {
        msg.className = "form-msg ok";
        msg.textContent = "Profile updated.";
        showToast("Profile saved");
      }
    });
  } else if (activeTab === "saved") {
    if (!savedPhones.length) {
      panel.innerHTML = `
        <div class="empty-state">
          <p>You have no saved phones yet. Explore the 3D showcase and save your favorites.</p>
          <a href="../index.html" class="btn-primary">Explore 3D Phones</a>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="book-list">
          ${savedPhones.map((p) => `
            <div class="book-row">
              <div class="row-cover" style="background-color:${p.frontImg ? "transparent" : p.frame}">
                <img class="${p.frontImg ? "thumb-photo" : ""}" style="--tscale:${p.photoScale || 1.06}" src="${getPhoneThumb(p)}" alt="${escapeHtml(p.title)}" />
              </div>
              <div>
                <div class="row-title">${escapeHtml(p.title)}</div>
                <div class="row-meta">${escapeHtml(p.brand)} · ${escapeHtml(p.finish)} · ${escapeHtml(p.chip)}</div>
              </div>
              <div class="row-controls">
                <div class="row-price">${formatPrice(p.price)}</div>
                <div class="row-actions">
                  <a class="link-subtle" href="../index.html?phone=${encodeURIComponent(p.id)}">Inspect 3D</a>
                  <button type="button" class="btn-outline" style="height:34px; padding:0 14px;" data-cart="${p.id}">Add to Cart</button>
                  <button type="button" class="link-subtle" data-rm="${p.id}">Remove</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      panel.querySelectorAll("[data-cart]").forEach((btn) => {
        btn.addEventListener("click", () => {
          addToCart(btn.dataset.cart, 1, "256GB");
          showToast("Added to cart");
        });
      });

      panel.querySelectorAll("[data-rm]").forEach((btn) => {
        btn.addEventListener("click", () => {
          removeFromSaved(btn.dataset.rm);
          showToast("Removed from saved");
        });
      });
    }
  } else if (activeTab === "orders") {
    if (!orders.length) {
      panel.innerHTML = `
        <div class="empty-state">
          <p>You haven't ordered any devices yet.</p>
          <a href="cart.html" class="btn-primary">Go to My Cart</a>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="info-list">
          ${orders.map((o) => `
            <div class="order-row">
              <div class="order-top">
                <span>Order #${escapeHtml(o.id)}</span>
                <span class="tabular">${formatPrice(o.total)}</span>
              </div>
              <div class="order-items">
                ${escapeHtml(o.date)} · ${o.items.map((it) => `${escapeHtml(it.title)} (${escapeHtml(it.storageTier)} × ${it.qty})`).join(", ")}
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
  }
}

render();
subscribe(render);
