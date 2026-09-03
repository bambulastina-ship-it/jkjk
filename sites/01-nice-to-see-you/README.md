# Nice To See You — landing page

A single-page site for **Nice To See You**, a family-run coffee shop at
30 Goodramgate, York YO1 7LG, right by the Minster.

Standalone Vite + React 19. Plain CSS, no UI kit, no router, no backend, no
state library. **No payment functionality of any kind** — this is a walk-in
café with a phone number, so the page's whole job is to get someone to the
door or on the phone.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the build
```

`vite.config.js` sets `base: './'`, so `dist/` can be dropped at any path on
any static host.

---

## What is on the page

| Section | Ground | Job |
|---|---|---|
| Hero | ink | The wordmark, the one-line position, the two actions, the shopfront |
| The shop | paper | The owner's own description, in a narrow offset column |
| — | ink | Full-bleed band: the branded cup |
| The signature | paper-2 | Orange & cranberry scones, against the counter display |
| On the counter | paper | Everything the brief actually lists, set as a typographic list |
| The reviews | ink | The three supplied Google quotes and the 4.6 / 434 rating |
| Visit | ink | Address, phone, what is known about hours, the two actions again |

Primary action throughout is **Visit us** (a plain Google Maps search for the
address — no API key, no tracking script). Secondary is **Call**
`tel:+447707559048`.

---

## Photography

**The image files are not on disk yet.** See
[`public/images/README.md`](public/images/README.md) for the five filenames,
which section each one belongs to, and the photograph each describes.

Until they arrive each frame holds a warm solid tone at the right aspect ratio,
so the page reads as designed and nothing reflows when the files land. Images
are never distorted: fixed `aspect-ratio` + `object-fit: cover` +
a chosen `object-position`.

---

## Art direction

Monochrome editorial, taken from the shopfront itself: near-black ink
(`#100e0c`), bone paper (`#f5f1ea`), and one burnt amber pulled off the
espresso crema and the orange juice. No third colour anywhere.

- **Type** — Bodoni Moda for display against Inter for body: high-contrast
  serif, tight display leading, generous body leading, a ~65ch measure.
- **Layout** — a twelve-column grid used asymmetrically, and a deliberately
  uneven rhythm: full-bleed band, narrow offset column, two-up, two-up
  reversed, list. Never the same shape twice in a row.
- **Motion** — one gesture: a slow fade with a small upward lift, once, no
  stagger. Everything else is still.

---

## The four libraries, and why each one is where it is

### 1. Liquid Metal — `@paper-design/shaders-react` (Apache-2.0)

`src/components/MetalWordmark.jsx`, with the mask built in
`src/lib/wordmarkMask.js`.

The fascia board above the door carries NICE TO SEE YOU in spaced black
capitals. That is the one piece of type this business already owns, so it is
the one place a material effect earns its keep. The mask is **not a fabricated
logo device and not a photograph**: `wordmarkMask.js` sets those exact words in
the page's own grotesque onto a canvas — white type, transparent ground — and
hands the shader that high-contrast bitmap, which is what it wants.

The shader is composited with `mix-blend-mode: screen` over real, plain-CSS
type of the same size and tracking, with `colorBack` set to black. So the metal
can only ever *add* a warm sheen; the wordmark can never end up less legible
than the plain type underneath. With no WebGL, or when the mask cannot be
built, you simply get the plain type — which is what the fascia looks like
anyway.

### 2. React Three Fiber — `@react-three/fiber` + `three` (MIT)

`src/components/CremaField.jsx`, behind the review quotes.

Its own scene, not a passenger: a custom-GLSL plane with two-octave simplex
noise displacing it, analytic normals, and a single warm specular key — a slow
dark liquid lit like the crema on a black coffee, seen at a shallow angle. One
mesh, no textures, no post-processing. It is the only place on the page where
the amber actually moves.

### 3. ShaderGradient — `@shadergradient/react` (+ `three-stdlib`, `camera-controls`)

`src/components/VisitBackdrop.jsx`, behind the closing address panel.

A `waterPlane` kept dark and nearly still — near-black, a burnt umber and one
ember of the house amber — under a heavy scrim so the address, the phone number
and the buttons sit on solid ground. `lightType="3d"` is deliberate: the `env`
path fetches three remote HDR maps.

### 4. Liquid Glass JS — vendored, MIT (© 2025 Armagan Amcalar)

`public/vendor/liquid-glass-js/` (licence retained) with the React wrapper in
`src/components/GlassVisitPill.jsx`.

One bounded job: the sticky **Visit us** action that appears once the hero's own
buttons have scrolled away, and steps aside again when the closing panel puts
the same buttons back on screen. Nothing else on the page is glass.

Notes on the integration, because it is imperative and canvas-sampling:

- The npm package called `liquid-glass-js` is a *different author's* project.
  The files here are copied from `dashersw/liquid-glass-js` and are not edited.
  `expose.js` is ours — a three-line shim that lifts the vendor's global class
  bindings onto `window.LiquidGlass` so an ES module can reach them.
- The wrapper takes the html2canvas snapshot itself and hands it over via
  `Container.pageSnapshot`, so it can exclude every `<canvas>` (a WebGL canvas
  without `preserveDrawingBuffer` samples blank) and silence the vendor's
  logging. It samples once, and re-samples only on a debounced resize — never
  per scroll frame.
- The glass is decorative; the thing you actually click is a real `<a>` on top
  of it, so link semantics, focus and keyboard behaviour are native.
- html2canvas waits on the *cloned* document's `fonts.ready`, which never
  settles if a web-font stylesheet is blocked. The snapshot therefore has a
  6-second deadline, after which the attempt is abandoned and any leftover
  clone iframe swept up.
- The vendor has no `destroy()`, so the wrapper unhooks it by hand on unmount:
  neutralise its scroll-bound `render`, lose the GL context, remove the
  element, de-register the instance.

**The frosted CSS plate underneath is not a placeholder — it is the design.**
The glass is a bonus when it can be had.

---

## Performance and fallbacks

- **One heavy canvas at a time.** The R3F field and the ShaderGradient panel are
  each code-split (`React.lazy`) and mounted only while their own section is on
  screen; because those two sections are adjacent, they are made mutually
  exclusive in `App.jsx` — the closing panel wins. three.js therefore never
  loads at all for a visitor who does not scroll that far.
- The Liquid Metal wordmark is masthead-sized, stays mounted, and has its
  animation parked when the hero leaves the viewport.
- `prefers-reduced-motion: reduce` — reveals resolve instantly, the R3F loop
  drops to a single static frame, ShaderGradient stops animating, and the glass
  pill is not built at all.
- DPR capped at 1.5 (1.25 on small screens). Every loop stops when the tab is
  hidden.
- **No WebGL2 → no canvases at all**, and the page is the static design: it is
  laid out, coloured and typeset to stand on its own, and every effect sits
  behind or beside content that is already on solid, legible ground.
- Every effect is additionally wrapped in an error boundary (`Safe.jsx`), so a
  shader that throws simply disappears.

Initial JS is ~253 kB (~80 kB gzipped); three.js and R3F are a separate ~884 kB
chunk fetched only on demand.

## Accessibility

Semantic landmarks and one `<h1>`, a skip link, visible focus rings, real alt
text written against each specific photograph, AA contrast throughout (the
smallest amber text is 5.2:1 on paper), and every tap target at least 44px on
coarse pointers. Verified with no horizontal scroll at 360, 390, 768, 1024 and
1440px.

---

## Copy: what is on the page, and what is deliberately missing

Every fact lives in `src/lib/site.js` and came from the supplied brief. The
three review quotes are the real supplied ones, attributed by name **and to
Google**; the 4.6 / 434 rating is labelled as supplied by the shop.

Nothing was invented. In particular the page has **no**:

- **opening-hours table.** Only "closes 5pm" is known, so that is all the page
  says, and it points at the Google listing for the day-by-day hours.
- **email address** — none was supplied. Contact is phone and walk-in.
- **social links** — Facebook, TikTok and Instagram profiles are said to exist
  but no URLs were given, so there are no icons rather than dead ones.
- awards, certifications, years trading, staff names, or menu items beyond the
  ones the brief lists.

### Pending real information

| Needed | Blocks |
|---|---|
| The five photo files | `public/images/` — see its README |
| Full opening hours | The Hours line in the Visit panel currently defers to Google |
| Social profile URLs | No social row exists yet |
| An email address, if they want one | Contact is phone-only |
| A real domain | `index.html` has a placeholder `<link rel="canonical">` |
