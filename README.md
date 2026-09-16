# Malwa Belt Renovations Ltd. — Landing Page

A single, static marketing page for Malwa Belt Renovations Ltd. Built with Vite + React +
TypeScript. No backend, no API keys, no analytics, **no payment functionality of any kind**.

```bash
npm install
npm run dev        # local dev server
npm run build      # -> dist/  (static, host anywhere)
npm run preview    # serve the production build on :4173
```

## ⚠️ Review before launch

`src/site.ts` is the single source of truth for all business copy. Entries marked `[ASSUMED]`
were **not** supplied and are sensible defaults for a general renovation contractor. Confirm or
correct them:

| Field | Current value | Status |
|---|---|---|
| `phoneDisplay` / `phoneHref` | +1 (365) 440-3466 | ✅ supplied |
| `instagram` | @malwabeltrenovations | ✅ supplied |
| `serviceArea` | Greater Toronto & Hamilton Area | ⚠️ **assumed** from the 365 area code |
| `hours` | Mon–Sat, 8am – 7pm | ⚠️ **assumed** |
| `yearsLabel` | 10+ years | ⚠️ **assumed** |
| `services` | 6 common renovation trades | ⚠️ **assumed** |
| Licensed & insured claims | shown in the trust strip | ⚠️ **verify these are accurate** |

There is no testimonials section. Real, attributable reviews can be added; invented ones will not be.

## Images

`src/assets/` — imported through Vite, which hashes them and resolves each URL against the
module's own location (`import.meta.url`). That makes them correct on any host regardless of base
path or trailing slash; hand-written `/assets/...` strings were not, and silently 404'd on a
sub-path deploy. **Replace an image by overwriting the file in `src/assets/` and rebuilding.**

`public/assets/` holds only `logo.jpg` (favicon) and `project-1.jpg` (og:image), which are
referenced from `index.html` and so resolve against the document URL.

| File | Used for | Note |
|---|---|---|
| `owner.jpg` | Hero image | ⚠️ **currently a promotional flyer, not a portrait** — see below |
| `logo.jpg` | Header, footer, favicon, loader | 150×150 JPEG; a transparent PNG or SVG would be sharper |
| `project-1.jpg` | Gallery | 640×1136 |
| `project-2.jpg` | Gallery | 640×1136 |
| `project-3.jpg` | Gallery | 320×568 — **low resolution**, upscaled on desktop; replace if the original exists |

**The hero image should be replaced.** The uploaded `owner.jpg` is an Instagram promo graphic
("TIRED OF CONTRACTORS WHO DELAY PROJECTS…") rather than the clean photo of the owner on the job
site. The layout expects a 4:5 portrait of a person. Drop the real photo in at
`public/assets/owner.jpg` — no code change needed.

## The four required libraries

Each is used once, lazily loaded, and gated so it can never break the page.

| Library | Where | Gate / fallback |
|---|---|---|
| `@paper-design/shaders-react` (`LiquidMetal`) — the *liquid-logo* effect | Logo on the loading screen only | Static logo under reduced-motion, no WebGL, or a missing file |
| `@shadergradient/react` + `@react-three/fiber` + `three` | One slow, desaturated navy gradient behind the contact band | Lazy + viewport-gated; off on mobile / reduced-motion / no WebGL → static CSS gradient |
| `liquid-glass-js` | Refraction lens on the floating desktop Call Now bar | Desktop only; CSS `backdrop-filter` underneath always |

Notes from actually reading these packages:
- `shadergradient`'s current package is **`@shadergradient/react`** (v2).
- `liquid-logo` is a demo app, not a package — the effect ships as the `LiquidMetal` shader.
- `liquid-glass-js`'s README describes a WebGL + html2canvas API; the **published package uses SVG
  displacement filters** and a `new LiquidGlass({...})` constructor instead. Much cheaper.

The WebGL stack is a separate 286 KB gzip chunk that most visitors never download. Initial load is
~63 KB gzip of JS plus 4 KB of CSS.

## Loading screen

Holds for **3 seconds from first paint**, then fades out over 500ms. The navy screen and the
construction line-draw live in `index.html` so they paint on the first frame — nothing flashes
white while the bundle parses. `src/components/Loader.tsx` times the reveal from `window.__bootAt`.

The hold is a *floor*: the page cannot be revealed before React has rendered it, so a very slow
connection will see it slightly longer. Under `prefers-reduced-motion` the 3s hold still runs but
nothing animates.

> Worth considering: a 3s gate on **every** visit costs conversions for a trades business — a
> homeowner who wants the phone number waits for it each time. A one-line `sessionStorage` guard
> would show it once per session instead. Built as specified; say the word to change it.

## Hosting

`vite.config.ts` sets `base: './'` and all asset URLs are relative, so `dist/` works both at a
domain root and under a sub-path (a preview host, a project subfolder, GitHub Pages).

`scripts/escape-fffd.mjs` is a publish-time helper, not part of `npm run build`. ShaderGradient
bundles a URI-decoding helper containing five literal U+FFFD characters; some static hosts reject
raw ones. The script rewrites each to a `\uFFFD` escape — identical at runtime, and it leaves the
bundle pure ASCII. Run it after `npm run build` only if your host complains.

## Deploying

`npm run build` produces a fully static `dist/`. Drag its contents (or a zip of them) onto
https://app.netlify.com/drop, or point any static host at it — no server, no env vars, no secrets.

`public/_headers` caches the hashed `/assets/*` files for a year (their names change whenever the
content does) while forcing `index.html` to revalidate, so a deploy takes effect immediately.
`public/_redirects` serves `index.html` for unknown paths instead of a bare 404. Both live in
`public/` rather than `dist/`, which is wiped on every build.

## Verification

```bash
npm run build && npm run preview     # then, in another shell:
node scripts/verify.mjs              # Playwright: loader, responsive, a11y, fallbacks
node scripts/contrast.mjs            # WCAG AA contrast on every token pair
```

`scripts/verify.mjs` checks: loader hold ≥3s + scroll lock + focus lands on `<h1>`; zero horizontal
overflow at 375/768/1024/1440; the `tel:` link resolves to `tel:+13654403466` with every visible
target ≥44px; all images load; no canvas mounts under reduced motion; no page errors with WebGL
disabled; the desktop call bar appears on scroll. Screenshots land in `screenshots/`.

## Accessibility

Skip link, sequential `h1→h2→h3`, alt text on every image, visible focus rings, 44px minimum touch
targets, `prefers-reduced-motion` honoured throughout, and every contrast pair at WCAG AA or better
(lowest is 5.17:1).
