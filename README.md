# Daisy Nails — landing page

A single-page marketing site for **Daisy Nail Salon**, a family-run nail salon
at 409 Windchime Pl, Colorado Springs, CO.

The visual signature is **Ink Garden**: a from-scratch Canvas2D reimplementation
of the ASCII effect at <https://21st.dev/community/ascii>, running live behind
the hero.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run gen:images     # re-render the placeholder imagery
npm run build:preview  # single-file shareable preview
```

---

## Design notes

### Why not pink

The obvious move for a nail salon is soft pink and lavender, and it is the first
thing a palette search returns for this category. It was rejected: it is the
single most template-looking choice available, and it does not match the
business. The reviews consistently praise *kindness, cleanliness, careful work
and fair prices* — a warm, unpretentious, family-run salon, not a luxury spa.

The palette instead comes from the salon's own name. A daisy is **white petals,
a golden-ochre heart, deep garden shadow**:

| Token | Hex | Role |
| --- | --- | --- |
| `--color-ink` | `#17150f` | Warm near-black — headings, body, primary buttons |
| `--color-bone` | `#f5f1e8` | Warm paper — page ground |
| `--color-paper` | `#fffdf8` | Cards, elevated surfaces |
| `--color-muted` | `#6e6659` | Secondary text |
| `--color-ochre` | `#c08a2e` | Daisy heart — **decorative only on light grounds** |
| `--color-ochre-ink` | `#8a6220` | Accessible ochre for *text* on light grounds |
| `--color-ochre-glow` | `#efc87f` | Accent on dark grounds and over the hero canvas |
| `--color-moss` | `#38432f` | Deep garden green — the testimonials ground |

Contrast is verified, not assumed:

```
ink       on bone  16.19:1  AAA      bone      on moss   9.26:1  AAA
muted     on bone   5.02:1  AA       ochreGlow on moss   6.58:1  AA
ochre-ink on bone   4.84:1  AA       ochreGlow on ink   11.51:1  AAA
```

`--color-ochre` fails against `bone` at 2.69:1, which is exactly why the token
set splits it into three: one ochre for decoration, one for text on light, one
for dark grounds. Text over the *animated* canvas is measured against the live
pixels rather than a swatch — see `scripts/dev/contrast.mjs`.

### Type

**Newsreader** (display) · **Public Sans** (body) · **JetBrains Mono** (labels)

Newsreader over the usual Playfair Display: it is a warmer, lower-contrast
editorial serif that holds up at the 6.5rem hero size without the brittle
hairlines Playfair gets, and it reads as *considered* rather than *formal* —
which is the brand.

The mono is doing real work rather than decoration: the small uppercase eyebrow
labels are set in JetBrains Mono so the type system quotes the monospaced glyph
grid of the ASCII hero. The page and its centrepiece share a vocabulary.

### Layout

One scrolling page with anchor navigation, spacious rhythm (96px section
padding, 144px at desktop). Most visitors arrive from a phone searching "nail
salon near me", so the phone number is tap-to-call in the header, hero, services
footer, location block and site footer, and the address links straight into
directions everywhere it appears.

---

## The Ink Garden effect

Written from scratch against the Canvas2D raster API. No WebGL, no shaders, no
third-party library. Three files:

| File | Role |
| --- | --- |
| `lib/ascii/types.ts` | Config surface + the hero's default config |
| `lib/ascii/renderers.ts` | The 25 per-cell drawing primitives |
| `lib/ascii/pipeline.ts` | The renderer: sampling, tone, blur, post-effects, lights, mask |
| `components/AsciiEffect.tsx` | React wrapper: sizing, motion, visibility, pacing |

### Pipeline

1. **Background** — `bgMode`: `none`, a `bgBlur`-blurred photo, a solid colour,
   or the raw photo, at `bgOpacity`.
2. **Grid sampling** — mean colour and luminance per `cellSize` cell, plus
   top/bottom half luminances for sub-cell detail.
3. **Per-cell rendering** — all 25 modes: `characters`, `dither`, `mosaic`,
   `pixel`, `dots`, `cross`, `diamond`, `voxel`, `lego`, `mixed`, `lines`,
   `diagonal`, `braille`, `disco`, `hexdump`, `matrix`, `rings`, `hearts`,
   `stars`, `hexagons`, `triangles`, `bubbles`, `hatch`, `contour`,
   `halfblocks`. Every mode honours `coverage`, `density`, `invert` and
   `edgeEmphasis`.
4. **Colour adjustments** — brightness → contrast → saturation → grayscale →
   tint via `overlayBlend` → tone curve → blur, in that order. Blur covers
   `off`, `gaussian`, `directional` (+`blurAngle`, `directionalBothSides`),
   `tilt`, `lens`, `radial` and `progressive`.
5. **Post-effects** — `scanLines`, `vignette`, `bloom`, `chromatic`,
   `filmGrain`, `glitch`, `halftone`, `pixelate`, `filmDust`.
6. **Lights** — additive radial glows at normalised positions.
7. **Mask reveal** — reveals the plain photo through a mask image.
8. **Animation** — `requestAnimationFrame`, driven by `animSpeed`, `animStyle`
   (`wave`/`pulse`/`shimmer`/`ripple`/`flicker`) and `animIntensity`.

**Where stage 4 actually runs.** The colour adjustments are applied to the
*source* before the grid samples it, not to the finished cell drawing. That is
the only ordering under which they mean anything: `contrast: 158` is supposed to
change *which glyph a cell picks*, and it can only do that if the contrast is
baked in when the cell's luminance is measured.

### Performance

Stages 2 and 4 are the expensive ones and are cached — they re-run only on
resize, image change, or a tone/colour/blur config change. A frame costs stages
1, 3, 5, 6 and 7, where stage 3 reads cached per-cell values and only perturbs
them with the animation term. No per-frame re-sampling.

On top of that: `devicePixelRatio` capped at 1.5, 30fps cap below 768px, the rAF
loop suspended by `IntersectionObserver` when the canvas scrolls out of view and
by `visibilitychange` when the tab is backgrounded, and a debounced
`ResizeObserver` so a drag-resize rebuilds the grid once rather than every frame.

`prefers-reduced-motion: reduce` renders exactly one static frame and never
starts a loop — verified by `scripts/dev/reduced-motion.mjs`.

### Reuse

```tsx
import AsciiEffect from '@/components/AsciiEffect';
import { makeConfig } from '@/lib/ascii/types';

<AsciiEffect
  src="/img/daisy-hero.webp"
  alt="Description of the source photograph."
  config={makeConfig({ renderMode: 'dots', cellSize: 14, coverage: 70 })}
  className="absolute inset-0"
/>
```

`makeConfig()` shallow-merges onto the hero defaults. The hero's own config is
the parameter object from the brief, with one change: `tint` is the brand ochre
rather than the stock `#3ca6ff`, which fought the warm palette. `tintOpacity`
stays at `0`, so the tint is inert until someone wants it.

---

## Replacing the placeholder imagery

**Every image in `public/img/` is a placeholder.** The brief's source photo
(`/ascii-editor/demos/generated/ref-029.webp`) is not present in this project
and outbound image CDNs are blocked in the build environment, so
`scripts/generate-images.mjs` renders all of it procedurally instead — a
software rasteriser working in linear light, no image libraries involved.

The hero source is a macro daisy. That was the deliberate choice rather than a
generic salon interior: the salon is called Daisy Nails and the effect is called
Ink Garden, so the flower is both the brand motif and — more practically — a
bright, centre-weighted subject against a dark ground, which is exactly the
luminance structure the dither grid needs to resolve into a recognisable shape.

To swap in real photography, drop files at the same paths and aspect ratios:

| Path | Ratio | Should become |
| --- | --- | --- |
| `daisy-hero.webp` | 4:3 | The hero source. A high-contrast, centre-weighted close-up — hands and nail art, or a single strong subject on a dark ground. Busy, evenly-lit photos turn to mush at `cellSize: 9`. |
| `work-01…08.webp` | 4:5 | Real photographs of the salon's work. |
| `og.jpg` | 1200×630 | Share card. Regenerate from the new hero, or replace. |

Then update the `alt` text in `lib/content.ts` (`GALLERY`) to describe what each
photo actually shows — the current alt text describes the placeholders and says
so.

---

## Content

All business facts live in `lib/content.ts` — NAP, hours, the full service menu,
ratings and review quotes. The visible page and the `LocalBusiness` JSON-LD are
generated from the same constants, so they cannot drift apart.

Nothing there is invented. Ratings are reported exactly as published (4.5★ / 197
Google reviews, 4.8★ / 25 Facebook votes) and review quotes are verbatim, trimmed
for length only. The JSON-LD deliberately carries **no `geo` block**: exact
storefront coordinates could not be confirmed, and a guessed lat/long can send
people to the wrong end of a strip mall. The postal address is authoritative and
search engines geocode it themselves.

Set `NEXT_PUBLIC_SITE_URL` at deploy time so canonical and Open Graph URLs are
absolute.

---

## Single-file preview

`npm run build:preview` folds a static export into one self-contained HTML file
at `preview/daisy-nails-preview.html` — stylesheet, scripts, webfonts and images
all inlined, no external requests at all. It exists so the page can be shared as
a single link for review without standing up a host. It is **not** the
deployment target; deploy the Next.js app itself.

Two things the builder has to get right, both of which fail silently otherwise:

- Asset paths are substituted **before** the bundles are inlined. Doing it
  afterwards splices base64 through the webpack runtime and blanks the page.
- Replacements go through a **function**, never a string. `$&` and `$'` in a
  string replacement are interpreted as patterns, and minified React is full of
  `$` — the result is corrupted output with no error.

The preview swaps the Google Maps iframe for a labelled address panel, because
shared previews block cross-origin frames and an empty grey box reads as a
broken site. That swap happens after hydration (editing the server HTML would
trip a React hydration mismatch and get the iframe restored) and applies to the
preview only — the app still ships the real embed.

`scripts/dev/preview-check.mjs` verifies the output renders, hydrates, animates
and makes zero network requests.

## Stack

Next.js 15 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4.

Chosen for the SEO surface a local-service business actually needs — static
prerendering, the metadata API, and first-class `next/font` and `next/image` —
at 121 kB first-load JS for the whole page.

## Accessibility

Semantic landmarks and headings, a skip link, visible focus rings everywhere,
44px minimum touch targets, keyboard-navigable tabs with arrow-key roving focus,
`prefers-reduced-motion` respected by both the CSS and the canvas, and no
information carried by colour alone.

The scroll-reveal animation defaults to **visible** and is opted into by a script
that runs before first paint. If that script never runs — JS disabled, a script
error, or a section scrolled past before React hydrates — the content simply
stays visible. Animation can only add polish here, never remove content.

### Dev verification tools

`scripts/dev/` holds the Playwright harnesses used to check this, against a
running dev server:

```bash
npm run dev                              # in one shell, then:
node scripts/dev/contrast.mjs            # hero text vs. the live animated canvas
node scripts/dev/mobile.mjs              # overflow + 44px tap-target audit
node scripts/dev/reduced-motion.mjs      # static-frame check
node scripts/dev/reveal-check.mjs           # every reveal fires at normal scroll speed
node scripts/dev/menu.mjs                  # mobile menu open/close + Escape
node scripts/dev/audit.mjs http://localhost:3000/   # landmarks, headings, ARIA, SEO tags
```

`scripts/dev/viewports.mjs` runs against the built preview file rather than the
dev server, and sweeps 320 / 375 / 390 / 430 / 767 / 768 / 1024 / 1440px —
checking each for horizontal overflow, sub-44px touch targets, text under 12px,
and a live canvas. The two widths either side of the `md` boundary are in the
list on purpose: 767 and 768px are where the service menu switches between
accordion and tabs, and breakpoint edges are where responsive layouts break.

```bash
npm run build:preview && node scripts/dev/viewports.mjs
```
