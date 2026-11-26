# Folio Room Multipage Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task and verify after completion.

**Goal:** Split the monolithic hero into a clean multipage architecture (`index.html` + `pages/*.html`, `styles/*.css`, `src/**/*.js`) supporting Home, Contact, Login, Register, Profile, and My Cart.

**Tech Stack:** HTML5, CSS3 (Tokens, 3D transforms, responsive layout), Vanilla ES Modules (`<script type="module">`), `localStorage`, Node ESM tests (`tests/verify.mjs`).

## Tasks
1. **Task 1: Project Metadata & Shared Data/State Modules**
   - Create `package.json`, `README.md`, `src/data/books.js` (12 books + deterministic prices + helpers), `src/state/store.js` (auth, shelf, cart, orders, messages, demo user seed, pub/sub listeners), `src/utils/dom.js` (`norm`, `escapeHtml`, `showToast`, `formatPrice`, `basePath`).
2. **Task 2: Layered CSS Design System**
   - Create `styles/tokens.css`, `styles/chrome.css`, `styles/book-3d.css`, `styles/home.css`, `styles/pages.css`, `styles/responsive.css`.
3. **Task 3: Shared Navbar & 3D Home Engine Modules**
   - Create `src/components/navbar.js` (shared navigation across all 6 pages, live Shelf & Cart badges, Account/Login state, mobile drawer/menu).
   - Extract `src/engine/ring.js`, `src/engine/physics.js`, `src/ui/books-dom.js`, `src/ui/search.js`, `src/ui/shelf.js`, `src/ui/focus.js` (with `Add to Cart`), `src/ui/mini-book.js`, `src/pages/home.js`.
   - Update `index.html` cleanly to use `styles/*` and `src/pages/home.js` (preserving 100% of the 3D Hero spec + Focus link to Cart + `?book=` URL param support so Profile/Cart links can open any book directly in Focus view!).
4. **Task 4: Contact, Login, Register, Profile & My Cart Pages**
   - Create `pages/contact.html` + `src/pages/contact.js`
   - Create `pages/login.html` + `src/pages/login.js`
   - Create `pages/register.html` + `src/pages/register.js`
   - Create `pages/profile.html` + `src/pages/profile.js`
   - Create `pages/cart.html` + `src/pages/cart.js`
5. **Task 5: End-to-End Verification**
   - Write `tests/verify.mjs` covering all 6 HTML entrypoints, CSS/JS module imports, store operations (register, login, profile update, shelf add/remove, cart add/qty/promo/checkout -> order history, contact inquiry), ring/physics math, and run `npm test`.
