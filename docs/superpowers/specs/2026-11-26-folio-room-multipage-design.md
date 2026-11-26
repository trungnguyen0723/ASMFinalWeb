# Folio Room Multipage Design

**Goal:** Refactor the single-file Folio Room 3D book-orbit hero into a modular, multipage ES-module web application with 6 complete pages: Home, Contact, Login, Register, Profile, and My Cart.

**Architecture:**
- Static multipage HTML (`index.html` at root, `pages/{contact,login,register,profile,cart}.html`) sharing a layered CSS design system (`styles/`) and browser-native ES modules (`src/`).
- Shared persistent client store (`src/state/store.js`) backed by `localStorage` for user accounts, active session, My Shelf, My Cart (with book quantities), orders, and contact messages.
- Unified editorial paper visual language (`#f4f1ea` paper, `#141414` ink, `#86827a` mute, `Inter Tight` + `Inter`, SVG paper grain).

## Pages & Capabilities
1. **Home (`index.html`):** Full 3D book-orbit hero (all 12 CSS-3D books, 4-substep spring rAF loop, superellipse arc-length ring, drag-to-throw, search + highlight, category chips, Orbit/Grid morph, mini-book flip & shuffle, Focus panel with Read Sample, Add to Shelf arc-fly, and Add to Cart).
2. **Contact (`pages/contact.html`):** Editorial studio contact page with interactive inquiry form (name, email, topic, message), client validation, submission confirmation + saved inquiry log, and library/curator contact details.
3. **Login (`pages/login.html`):** Clean editorial sign-in form with email & password validation, password visibility toggle, one-click demo account fill, session persistence, and redirect to Profile/Home.
4. **Register (`pages/register.html`):** Account creation form (full name, email, favorite design discipline, password, confirm password), duplicate-email validation, automatic sign-in on success, redirect to Profile.
5. **Profile (`pages/profile.html`):** Member workspace showing active user details, inline profile edit form (name, discipline, bio), saved My Shelf books with quick open/remove/add-to-cart, order history from Cart checkouts, and Sign Out button (prompts sign-in state with direct links to Login/Register when signed out).
6. **My Cart (`pages/cart.html`):** Shopping bag for digital & print folio editions, item list with cover thumbnails, format/edition price, quantity `-`/`+`, remove item, promo code (`FOLIO10` for 10% off), live subtotal/discount/total with tabular numerals, checkout flow creating a persisted order and clearing cart, plus quick-add recommendations if empty.
