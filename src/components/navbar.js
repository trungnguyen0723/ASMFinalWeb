import { RAW_PHONES, getPhoneThumb } from "../data/phones.js";
import { getCartCount, getCurrentUser, getSavedIds, removeFromSaved, subscribe } from "../state/store.js";
import { escapeHtml, formatPrice, getRootBase, showToast } from "../utils/dom.js";

export function mountNavbar({
  activePage = "home",
  includeSearch = false,
  onBrandClick = null,
  onOpenPhone = null
} = {}) {
  const header = document.getElementById("topbar");
  if (!header) return null;

  const base = getRootBase();
  const homeHref = `${base}/index.html`;
  const pageHref = (name) => `${base}/pages/${name}.html`;

  header.innerHTML = `
    <div class="top-left">
      <button type="button" class="mob-menu-btn" id="mob-menu-btn" aria-label="Open navigation menu" aria-expanded="false">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16"></path>
        </svg>
      </button>
      ${activePage === "home" ? `<div class="counter">4 brands · 12 flagships</div>` : ""}
      <nav class="nav-links" aria-label="Primary">
        <a href="${homeHref}" class="nav-link ${activePage === "home" ? "active" : ""}">Home</a>
        <a href="${pageHref("contact")}" class="nav-link ${activePage === "contact" ? "active" : ""}">Contact</a>
      </nav>
    </div>

    <div class="top-center">
      ${activePage === "home"
        ? `<button type="button" class="brand" id="brand-btn" aria-label="Phone Room home"><span>Phone</span><span>Room</span></button>`
        : `<a href="${homeHref}" class="brand" aria-label="Phone Room home"><span>Phone</span><span>Room</span></a>`
      }
      ${includeSearch ? `
        <div class="search-wrap" id="search-wrap">
          <div class="search-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
            <input id="search-input" type="text" placeholder="Search phones, chips or brands" autocomplete="off" spellcheck="false" aria-label="Search phones, chips or brands" />
            <kbd class="search-kbd">/</kbd>
            <button type="button" class="search-clear" id="search-clear" aria-label="Clear search">×</button>
          </div>
          <div class="search-dd" id="search-dd" role="listbox"></div>
        </div>
      ` : ""}
    </div>

    <div class="top-right">
      <a href="${pageHref("cart")}" class="nav-pill ${activePage === "cart" ? "active" : ""}" id="nav-cart-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
          <path d="M3 6h18"></path>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span class="pill-label-hide-sm">My Cart</span>
        <span class="nav-badge" id="nav-cart-count">0</span>
      </a>

      <div class="shelf-wrap" id="shelf-wrap">
        <button type="button" class="nav-pill" id="shelf-btn" aria-expanded="false">
          <span>Saved</span>
          <span class="nav-badge" id="shelf-count">0</span>
        </button>
        <div class="shelf-dd" id="shelf-dd">
          <div class="shelf-dd-head">
            <span>Saved Phones</span>
            <span id="shelf-dd-num">0</span>
          </div>
          <div class="shelf-list" id="shelf-list"></div>
        </div>
      </div>

      <a href="${pageHref("login")}" class="nav-pill ${activePage === "profile" || activePage === "login" || activePage === "register" ? "active" : ""}" id="nav-auth-link">
        <span id="nav-auth-label">Sign in</span>
      </a>
    </div>
  `;

  let drawer = document.getElementById("mob-drawer");
  if (!drawer) {
    drawer = document.createElement("nav");
    drawer.id = "mob-drawer";
    drawer.className = "mob-drawer";
    drawer.setAttribute("aria-label", "Mobile navigation");
    document.body.appendChild(drawer);
  }

  function renderDrawer() {
    const user = getCurrentUser();
    drawer.innerHTML = `
      <a href="${homeHref}" class="${activePage === "home" ? "active" : ""}">Home</a>
      <a href="${pageHref("contact")}" class="${activePage === "contact" ? "active" : ""}">Contact</a>
      <a href="${pageHref("cart")}" class="${activePage === "cart" ? "active" : ""}">My Cart (${getCartCount()})</a>
      ${user
        ? `<a href="${pageHref("profile")}" class="${activePage === "profile" ? "active" : ""}">Profile · ${escapeHtml(user.name)}</a>`
        : `<a href="${pageHref("login")}" class="${activePage === "login" ? "active" : ""}">Login</a>
           <a href="${pageHref("register")}" class="${activePage === "register" ? "active" : ""}">Register</a>`
      }
    `;
  }

  const mobBtn = document.getElementById("mob-menu-btn");
  const shelfWrap = document.getElementById("shelf-wrap");
  const shelfBtn = document.getElementById("shelf-btn");
  const shelfCount = document.getElementById("shelf-count");
  const shelfDdNum = document.getElementById("shelf-dd-num");
  const shelfList = document.getElementById("shelf-list");
  const cartCountEl = document.getElementById("nav-cart-count");
  const authLink = document.getElementById("nav-auth-link");
  const authLabel = document.getElementById("nav-auth-label");

  if (activePage === "home" && onBrandClick) {
    document.getElementById("brand-btn")?.addEventListener("click", onBrandClick);
  }

  mobBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.toggle("open");
    mobBtn.setAttribute("aria-expanded", String(isOpen));
  });

  shelfBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = shelfWrap.classList.toggle("open");
    shelfBtn.setAttribute("aria-expanded", String(open));
  });

  shelfList?.addEventListener("click", (e) => {
    const rm = e.target.closest(".shelf-rm");
    if (rm) {
      removeFromSaved(rm.dataset.rm);
      showToast("Removed from saved");
      return;
    }
    const openBtn = e.target.closest(".shelf-open");
    if (openBtn) {
      const id = openBtn.dataset.id;
      shelfWrap.classList.remove("open");
      shelfBtn.setAttribute("aria-expanded", "false");
      if (onOpenPhone) {
        onOpenPhone(id);
      } else {
        window.location.href = `${homeHref}?phone=${encodeURIComponent(id)}`;
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (shelfWrap && !shelfWrap.contains(e.target)) {
      shelfWrap.classList.remove("open");
      shelfBtn?.setAttribute("aria-expanded", "false");
    }
    if (drawer && !drawer.contains(e.target) && !mobBtn?.contains(e.target)) {
      drawer.classList.remove("open");
      mobBtn?.setAttribute("aria-expanded", "false");
    }
  });

  function syncChrome() {
    const ids = getSavedIds();
    shelfCount.textContent = String(ids.length);
    shelfDdNum.textContent = String(ids.length);
    cartCountEl.textContent = String(getCartCount());

    const user = getCurrentUser();
    if (user) {
      authLink.href = pageHref("profile");
      authLabel.textContent = user.name.split(/\s+/)[0] || "Profile";
    } else {
      authLink.href = pageHref("login");
      authLabel.textContent = "Sign in";
    }

    if (ids.length === 0) {
      shelfList.innerHTML = `<div class="shelf-empty">No saved phones yet. Open any device to save it here.</div>`;
    } else {
      const items = ids.map((id) => RAW_PHONES.find((p) => p.id === id)).filter(Boolean);
      shelfList.innerHTML = items.map((p) => `
        <div class="shelf-item">
          <button type="button" class="shelf-open" data-id="${p.id}">
            <span class="shelf-thumb" style="background-color:${p.frontImg ? "transparent" : p.frame}">
              <img class="${p.frontImg ? "thumb-photo" : ""}" style="--tscale:${p.photoScale || 1.06}" src="${getPhoneThumb(p)}" alt="" />
            </span>
            <span class="search-meta">
              <div class="search-title">${escapeHtml(p.title)}</div>
              <div class="search-sub">${escapeHtml(p.brand)} · ${formatPrice(p.price)}</div>
            </span>
          </button>
          <button type="button" class="shelf-rm" data-rm="${p.id}" aria-label="Remove ${escapeHtml(p.title)}">×</button>
        </div>
      `).join("");
    }
    renderDrawer();
  }

  syncChrome();
  const unsub = subscribe(syncChrome);

  return {
    shelfBtn,
    cartBtn: document.getElementById("nav-cart-btn"),
    bumpShelf() {
      shelfBtn.classList.add("bump");
      setTimeout(() => shelfBtn.classList.remove("bump"), 320);
    },
    bumpCart() {
      const el = document.getElementById("nav-cart-btn");
      el?.classList.add("bump");
      setTimeout(() => el?.classList.remove("bump"), 320);
    },
    destroy: unsub
  };
}
