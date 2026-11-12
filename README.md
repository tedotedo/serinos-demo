# Serino's Deli & Wine Bar — Static Concept Website

Unsolicited static concept website created by **Mark Aszkenasy** for **Serino's Deli & Wine Bar** (`5 Station Road, Eaglescliffe, Stockton-on-Tees TS16 0BU`).

## Structure

- `index.html` — Day-to-night station bistro homepage featuring *This Is Yarm* reader poll badges (`#1 Breakfast`, `#2 Coffee`, `#3 Pizza`), daytime brunch/deli preview, dark merlot evening wine/pizza chapter, and station-side directions.
- `menus.html` — Keyboard-accessible 3-tab menu showcase (`Morning Coffee & Brunch`, `Deli Counter & Lunch`, `Evening Wine, Antipasti & Pizza`) with transparent `.ph` owner placeholders.
- `bookings.html` — Accessible dual form switcher (**Reserve a Table** and **Wine Night & Private Hire Enquiry**) with client-side validation and demo-only status confirmation.
- `css/styles.css` — Self-hosted typography (`Cormorant Garamond` + `DM Sans`), WCAG AA contrast palette (`#FAF6F0`, `#5C1D28`, `#1F191A`, `#354A39`, `#C9963B`), mobile-first layout (`360px–1440px`), and solid opaque sticky mobile action bar.
- `js/main.js` — Accessible mobile navigation (`Escape` closes), ARIA tablist keyboard controls, URL hash deep-linking, and dummy form validation.
- `favicon.svg` & `images/logo-mark.svg` — Custom architectural station-arch & `S` monogram SVG emblems.
- `PITCH.md` — Walk-in pitch guide, domain audit (`serinosdeli.co.uk` unregistered vs `serinosdeli.com` spam), 3-tap demo flow, and owner placeholder checklist.

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
