import { getPhoneThumb } from "../data/phones.js";
import { escapeHtml, formatPrice, norm } from "../utils/dom.js";

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const nText = norm(text);
  const nQ = norm(query);
  const idx = nText.indexOf(nQ);
  if (idx === -1) return escapeHtml(text);
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

export function initSearch({ phones, onQueryChange, onSelectPhone, isFocusOpen }) {
  const searchWrap = document.getElementById("search-wrap");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  const searchDd = document.getElementById("search-dd");
  if (!searchWrap || !searchInput) return { clear() {} };

  let hiIndex = -1;

  function matches(q) {
    const nq = norm(q);
    return phones.filter((p) =>
      norm(p.title).includes(nq) ||
      norm(p.brand).includes(nq) ||
      norm(p.chip).includes(nq) ||
      norm(p.finish).includes(nq)
    );
  }

  function render() {
    const q = searchInput.value.trim();
    searchWrap.classList.toggle("has-value", q.length > 0);
    if (!q) {
      searchWrap.classList.remove("open");
      searchDd.innerHTML = "";
      hiIndex = -1;
      return;
    }
    const list = matches(q);
    if (hiIndex >= list.length) hiIndex = list.length - 1;
    if (list.length === 0) {
      searchDd.innerHTML = `<div class="search-empty">No phones match “${escapeHtml(q)}”</div>`;
    } else {
      searchDd.innerHTML = list.map((p, idx) => `
        <button type="button" class="search-item ${idx === hiIndex ? "active" : ""}" data-idx="${p.idx}" role="option">
          <span class="search-thumb" style="background-color:${p.frontImg ? "transparent" : p.frame}">
            <img class="${p.frontImg ? "thumb-photo" : ""}" style="--tscale:${p.photoScale || 1.06}" src="${getPhoneThumb(p)}" alt="" />
          </span>
          <span class="search-meta">
            <div class="search-title">${highlightText(p.title, q)}</div>
            <div class="search-sub">${highlightText(p.brand, q)} · ${highlightText(p.chip, q)} · ${formatPrice(p.price)}</div>
          </span>
        </button>
      `).join("");
    }
    searchWrap.classList.add("open");
  }

  searchInput.addEventListener("input", () => {
    hiIndex = 0;
    onQueryChange(searchInput.value);
    render();
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) render();
  });

  searchInput.addEventListener("keydown", (e) => {
    const list = matches(searchInput.value.trim());
    if (e.key === "ArrowDown" && list.length) {
      e.preventDefault();
      hiIndex = (hiIndex + 1) % list.length;
      render();
    } else if (e.key === "ArrowUp" && list.length) {
      e.preventDefault();
      hiIndex = (hiIndex - 1 + list.length) % list.length;
      render();
    } else if (e.key === "Enter" && list.length) {
      e.preventDefault();
      const chosen = list[Math.max(0, hiIndex)];
      if (chosen) {
        searchWrap.classList.remove("open");
        searchInput.blur();
        onSelectPhone(chosen);
      }
    } else if (e.key === "Escape") {
      searchWrap.classList.remove("open");
      searchInput.blur();
    }
  });

  searchDd.addEventListener("click", (e) => {
    const btn = e.target.closest(".search-item");
    if (!btn) return;
    const p = phones[Number(btn.dataset.idx)];
    searchWrap.classList.remove("open");
    if (p) onSelectPhone(p);
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    onQueryChange("");
    render();
    searchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!searchWrap.contains(e.target)) searchWrap.classList.remove("open");
  });

  window.addEventListener("keydown", (e) => {
    const inInput = document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA");
    if (e.key === "/" && !inInput && !isFocusOpen()) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  return {
    clear() {
      searchInput.value = "";
      onQueryChange("");
      render();
    }
  };
}
