# Serino's Deli & Wine Bar — Static Concept Website

Unsolicited static concept website created by **Mark Aszkenasy** for **Serino's Deli & Wine Bar** (`5 Station Road, Eaglescliffe, Stockton-on-Tees TS16 0BU`).

## Design Archetype: Interactive Day-to-Night Dual Railway Arch Diptych & Milanese Masthead

- `index.html` — Centered Milanese broadsheet masthead with a live persisted **`☀ Daytime Deli` / `☾ Wine & Pizza`** mood switcher (`data-mood="day|night"`), *This Is Yarm* Triple-Crown Ribbon (`#1 Breakfast`, `#2 Coffee`, `#3 Pizza`), side-by-side **50/50 Dual Station-Arch Split Diptych** (*I · Mattina & Pranzo* vs *II · Sera & Enoteca*), Station Departure-Style Ledger Strip, and 3-leaf folded Italian *La Carta* preview.
- `menus.html` — Full folded-paper *La Carta* menu showcase (`01 · Caffetteria & Brunch`, `02 · Banco Gastronomia`, `03 · Enoteca, Antipasti & Pizza`) with accessible ARIA tabs and transparent `.ph` owner placeholders.
- `bookings.html` — Accessible dual form switcher (**Reserve a Table** and **Wine Night & Private Hire Enquiry**) with sitting pre-selection, client-side validation, and demo-only status confirmation.
- `css/styles.css` — Self-hosted typography (`Cormorant Garamond` + `DM Sans`), WCAG AA+ contrast palette (`#FAF5EC`, `#38121A`, `#5A1C28`, `#1C1617`, `#E4BD70`), classical railway arch frames, and solid opaque sticky mobile action bar.
- `js/main.js` — Live `localStorage` Day/Night mood switcher, keyboard-accessible mobile navigation, ARIA tablist controls, URL hash deep-linking, and dummy form validation.
- `favicon.svg` & `images/logo-mark.svg` — Custom architectural station-arch & `S` monogram SVG emblems.
- `PITCH.md` — Walk-in pitch guide, domain audit, 3-tap demo flow, and owner placeholder checklist.

## Local Preview

Serve from this folder with any static HTTP server:

```bash
python3 -m http.server 8081
```

Then open `http://localhost:8081` in a browser.

## Compliance & Privacy

- Every HTML page carries `<meta name="robots" content="noindex, nofollow">`.
- Zero external network requests (all fonts, styles, scripts, and SVGs are self-hosted locally).
- Zero fabricated dishes, prices, reviews, or awards; unknown details are clearly marked in `.ph` tags for owner confirmation.

## Set D — Station Departure Board

- `d/index.html`, `d/css/styles.css`, `d/js/app.js` — The page follows the clock: a split-flap board shows which service is on now, and the headline, photo, colours and open menu tab change with it.
- Live at https://tedotedo.github.io/serinos-demo/d/. Reuses the root `fonts/` and `images/`; same `noindex`, zero external requests and `.ph` placeholder rules as Sets A–C.
- Service times on the board are illustrative (`08:00`, `11:30`, `16:30`, `18:00`) and labelled as demo. The train picker does not use live train times.
