# Phone Room

Interactive 3D smartphone orbit showcase and multipage flagship store built with HTML5, layered CSS3, and Vanilla ES Modules.

## Run locally

ES modules require an HTTP server (opening `file://` directly is blocked by browser CORS).

```bash
npm run dev
# Open http://localhost:8080/
```

Run automated checks:

```bash
npm test
```

## Structure

- `index.html` — Home (100vh 3D Smartphone-Orbit Hero, Search, Brand Filter, Grid Morph, Focus View + 180° Inspect Back)
- `pages/` — `contact.html`, `login.html`, `register.html`, `profile.html`, `cart.html`
- `styles/` — `tokens.css`, `chrome.css`, `phone-3d.css`, `home.css`, `pages.css`, `responsive.css`
- `src/` — `data/`, `state/`, `utils/`, `components/`, `engine/`, `ui/`, `pages/`
- `tests/verify.mjs` — Automated verification suite
