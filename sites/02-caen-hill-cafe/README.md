# Caen Hill Cafe — landing page

A single-page site for Caen Hill Cafe, the canal-side café at the Caen Hill
Locks on the Kennet & Avon Canal, The Locks, Devizes SN10 1QR.

Standalone Vite + React 19. Plain CSS, no UI kit, no router, no backend, no
state library. **No payment, ordering or booking functionality of any kind.**

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

---

## Photography

Two photographs were supplied. They were shown in chat but never arrived as
files, so **the two paths below are currently empty**. Drop the files in and
the page picks them up with no other change:

| Path | Photo | Ratio | Where it appears |
|---|---|---|---|
| `public/images/toastie.jpg` | Toasted granary sandwich cut in half, griddle stripes, melted cheese, ready-salted crisps, kraft tray on weathered outdoor wood | ~3:2 landscape | Hero, eager, `fetchpriority=high` |
| `public/images/interior.jpg` | Sage-green room, brick fireplace with a framed photo of the locks propped in it, roman-numeral clock, oilcloth table, wooden counter | ~4:3 landscape | "The stop" band, lazy |

Both go through `src/components/Photo.jsx`, which holds a fixed
`aspect-ratio`, uses `object-fit: cover` (never distorts), and paints a sage
gradient behind the slot. If the file is missing the `<img>` fades out and the
band keeps its exact proportions — no layout shift when the real photo lands.
Until the files exist the browser will log a 404 per slot; that is the only
console output on the page.

Two photos is *thin* — see "What is pending" below.

---

## Where the four libraries are used

One heavy WebGL context at a time, enforced in `App.jsx` by intersection flags:
the hero water and the lock flight are never mounted together.

### 1. ShaderGradient — `src/effects/CanalWater.jsx`
`type="waterPlane"` behind the hero. It is the one preset that is literally the
subject: a slow sheet of moving water in the sage → canal-green family
(`#e6ecdd` / `#a3b39a` / `#2f5a4c`) at `uSpeed 0.08`, `uStrength 0.9`. A cream
wash (`.hero__canvas::after`) sits over it so the headline is always on legible
ground. `lightType` is pinned to `'3d'` on purpose — the `'env'` path fetches
remote HDR maps, which is the wrong trade for a towpath.

### 2. React Three Fiber — `src/effects/LockFlight.jsx`
Its own scene, not a passenger of ShaderGradient. Eight flat sheets of water
step away from the camera behind the dark "at the counter" band, each displaced
by two crossing sine waves in a custom vertex shader and lit by a slow
travelling sheen in the fragment shader. It abstracts the setting — water going
downhill in stages — and deliberately makes no claim about how many locks there
are or how far they drop.

### 3. Liquid Metal — `src/effects/MetalWordmark.jsx`
`@paper-design/shaders-react` (Apache-2.0). The shader needs a high-contrast
mask, so the mask is the business name set as real type: "CAEN HILL / CAFE"
drawn white-on-transparent to a `<canvas>` in the same Bitter face used for the
headings, fitted and tracked to the box, then handed to `LiquidMetal` as
`image`. No invented logo device. The real text stays in the DOM underneath for
screen readers and for the no-WebGL case, and only fades out once the shader is
live. Reads as light moving on water rather than chrome.

### 4. Liquid Glass JS — `src/components/GlassDock.jsx` + `src/lib/liquidGlass.js`
Vendored from `dashersw/liquid-glass-js` (MIT — `public/vendor/liquid-glass-js/`
with the LICENSE retained; it is not on npm, and the npm package of that name is
a different author's work). It has exactly **one** job: the sticky *"Find us at
the locks"* action that appears once you scroll past the hero.

- `src/lib/liquidGlass.js` dynamically imports html2canvas (keeping ~47 kB
  gzipped off first paint), pins it to `window`, then injects `container.js`,
  `button.js` and a small `bridge.js` shim that hands the two classic-script
  globals to the module world.
- `GlassDock.jsx` builds on mount inside `requestIdleCallback`, takes the
  html2canvas snapshot itself (once — the dock and every `<canvas>` are excluded
  so the glass does not refract itself), re-samples only on a debounced,
  meaningful width change, never per scroll frame, and tears the GL context down
  on unmount.
- The accessible control is a real `<a>` at 56 px with its own solid
  background. The glass plate is a decorative, `pointer-events: none` layer
  behind it, so if WebGL, html2canvas or the vendored scripts fail, the button
  is unchanged.

---

## Design rationale

Wide, banded and horizontal, because the place is outdoors and you arrive at it
sideways along a towpath. Full-bleed bands alternate cream → deeper cream →
deep canal green → cream → sage → canal, so the page reads as a walk rather
than a stack of cards.

Palette is taken from the room itself: sage walls, brick fireplace, cream, and
a deep canal green for the two dark bands. Type is Nunito Sans (warm humanist
sans, body) against Bitter (soft slab, headings) — both self-hosted variable
subsets, ~65 kB total, no third-party font requests. No handwriting faces, no
chalkboard textures, no bunting: the room already has those, the site does not
need to imitate them.

Motion is slow and water-like throughout — 1.1 s drift-in reveals, 500–700 ms
easing, `cubic-bezier(0.22, 0.61, 0.24, 1)`. Nothing snaps.

The hook, in order: where it is, that dogs are welcome, that there are benches
outside. That is what actually decides whether someone stops.

### Copy discipline
Every factual claim traces to the brief or to the two photographs. There is
**no phone number and no call CTA anywhere** — none was supplied. There is no
weekly hours table; only "closes 4pm" and "opens 10:30am Friday" are known, so
the page says that and points at the Google listing. No awards, no staff names,
no invented menu items, no social links. The three review quotes are the real
supplied ones, attributed by first name.

---

## Performance and accessibility

- **One heavy context at a time.** `waterOn`, `flightOn` and `metalOn` are
  mutually exclusive intersection flags; all three also require the tab to be
  visible (`usePageVisible`).
- **`prefers-reduced-motion`** stops every shader (`animate: 'off'`, R3F
  `frameloop: 'demand'`, `speed: 0`), removes the reveals, and disables the
  glass dock entirely.
- **DPR is capped** at 1.25 on phones and 1.5 elsewhere (`dprCap`).
- **Data saver.** `prefersLightweight()` reads `navigator.connection`; on
  `saveData` or a 2g/slow-2g connection no canvas mounts at all and the CSS
  gradient fallbacks carry the page. Rural Wiltshire mobile data is the normal
  case here, not the edge case.
- **No WebGL2 → static.** Every canvas is gated on a cached WebGL2 probe; the
  hero, the counter band and the wordmark all have designed CSS fallbacks and
  the page still reads as premium with every canvas dead.
- **Bundle.** three.js (~246 kB gzipped) is in its own lazy chunk and is only
  fetched when a shader section actually enters view; html2canvas and the two
  shader libraries are likewise split out. First paint pulls React, the CSS and
  the two fonts.
- Semantic landmarks (`header`/`main`/`footer`, `section` + `aria-labelledby`),
  a skip link, `alt` text describing both photographs, visible 3 px focus rings
  (re-coloured to sage on the dark bands), tap targets ≥ 44 px (CTAs 52–56 px).
- Contrast: `--sage-ink` (`#556549`) is the only sage used for small type —
  ≥ 4.5:1 on cream, deeper cream and sage-pale. `--sage-deep` is borders and
  decoration only; it clears 3.8:1 and must not be used for text.
- `dist/` builds clean with no warnings other than the expected three.js chunk
  size notice.

---

## What is pending real information

Everything below is deliberately absent rather than invented:

- **The two photo files** (see above). They are the only blocking item.
- **More photography.** Two images is genuinely thin for a site this length.
  The single strongest missing shot is the outdoor benches with the lock flight
  behind them — that is the whole proposition and there is currently no picture
  of it. A second would be the counter/ice-cream cabinet.
- **Phone number.** None on the Google profile. Until one exists there is no
  call CTA; the "Phone" fact in the Visiting band says so plainly.
- **Full opening hours.** Only two data points are known. Seasonal hours are
  likely at a canal-side site, so the page points at the Google listing rather
  than printing a table. When real hours arrive, add `openingHoursSpecification`
  to the JSON-LD block in `index.html` as well.
- **Social URLs.** A Facebook page and an Instagram account exist but no links
  were supplied, so there are no social icons.
- **A canonical domain**, for `og:url` and a canonical link.
- The JSON-LD deliberately omits `aggregateRating`; the 4.4/919 figure comes
  from Google itself and should not be marked up as first-party review data. It
  is shown in the page copy, attributed to its source.
