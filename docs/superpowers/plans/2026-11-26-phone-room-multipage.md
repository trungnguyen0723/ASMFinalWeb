# Phone Room Multipage Implementation Plan

**Goal:** Convert the Folio Room multipage architecture into **Phone Room**, an interactive 3D smartphone showcase & multipage store featuring 4 major brands (`Apple`, `Samsung`, `Google`, `Xiaomi` — 12 flagship devices total) across 6 pages (`Home`, `Contact`, `Login`, `Register`, `Profile`, `My Cart`).

**Architecture:** Keep the exact layered multipage structure (`index.html` + `pages/*.html`, `styles/*.css`, `src/**/*.js`, `tests/verify.mjs`), replacing book assets and cover-opening geometry with CSS-3D smartphone geometry (OLED screen + specular sheen, metallic side rails, rear glass + brand-specific SVG camera module, and 180° spring-driven `Inspect Back` flip in Focus view).

## Tasks
1. **Task 1: Replace Data, Store & Artwork Generators for Smartphones**
   - Remove legacy `book*` files (`src/data/books.js`, `src/ui/books-dom.js`, `src/ui/mini-book.js`, `src/ui/shelf.js`, `styles/book-3d.css`).
   - Create `src/data/phones.js` with 12 flagship devices (Apple 3, Samsung 3, Google 3, Xiaomi 3), specs (`chip`, `display`, `camera`, `battery`, `finish`, `price`), brand-matched OLED screen & SVG camera-island builders, and `BASE_TILTS`.
   - Update `src/state/store.js` for Phone Room (`Saved` wishlist, `Cart` with `256GB` / `512GB (+$120)` storage variants, `PHONE10` 10% promo code, demo user `demo@phoneroom.store` / `phone2026`).
2. **Task 2: Update CSS 3D Smartphone Geometry & Styles**
   - Create `styles/phone-3d.css` (OLED front screen, Dynamic Island/punch hole, specular glass sheen, rear camera module, metallic frame rails, floor shadow).
   - Update `styles/tokens.css`, `styles/chrome.css`, `styles/home.css`, `styles/pages.css`, `styles/responsive.css` for smartphone proportions and Phone Room branding.
3. **Task 3: Update Navbar, Physics Engine, 3D DOM & Home Page**
   - Update `src/engine/physics.js` to support `focusInspectBack` (rotating `ry` 180° smoothly in Focus view).
   - Create `src/ui/phones-dom.js`, `src/ui/mini-phone.js`, `src/ui/fly-anim.js`, and update `src/components/navbar.js`, `src/ui/search.js`, `src/ui/focus.js`, `src/pages/home.js`, and `index.html`.
4. **Task 4: Update Contact, Login, Register, Profile & My Cart Pages**
   - Update `pages/{contact,login,register,profile,cart}.html` and `src/pages/{contact,login,register,profile,cart}.js` with phone-store copy, storage tier switching, wishlist & order management.
5. **Task 5: Update & Run Verification Suite**
   - Update `tests/verify.mjs` for Phone Room (`12` devices, `4` brands × `3`, `Inspect Back` 180° physics, `PHONE10` + `512GB` cart math, auth, profile, wishlist, contact) and run `npm test` + `node --check`.
