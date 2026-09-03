# SoupChick — landing page

A single-page site for **SoupChick**, the fresh soup, toastie and juice bar
stall in Unit 5 and 6 of The Shambles Market Hall, Devizes SN10 1JG.

The menu is the centrepiece: every item and price is set as real, selectable,
screen-reader-navigable text, transcribed verbatim from
`assets/business-5/BRIEF.md`. **Nothing is for sale on this page** — there is
no basket, no quantity picker, no checkout and no payment code anywhere in the
project. Orders are taken at the counter.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

Stack: Vite 7 + React 19, plain CSS, no UI kit, no router, no state library, no
backend. Fonts (Fraunces and Inter, both SIL OFL) are self-hosted from
`public/fonts/` with their licences alongside.

## Images

None of the four photographs are on disk yet. See
[`public/images/README.md`](public/images/README.md) for the exact filenames,
where each one appears and what it should be. Every slot has a fixed aspect
ratio and a warm fallback gradient, so the layout does not move when the files
arrive and there is no layout shift either way.

## Where the four libraries are used

| Library | Where | Why there |
|---|---|---|
| **React Three Fiber** (`@react-three/fiber` + `three`) | `src/effects/Steam.jsx` — a plume of steam drawn over the soup photograph in the "What's in the pot" band | Its own scene with its own hand-written GLSL: two fbm layers scrolling upward through a soft column mask, screen-blended over the photo. Not a passenger of ShaderGradient. Steam over soup is the one moving thing this business actually has |
| **ShaderGradient** (`@shadergradient/react`) | `src/effects/MarketWash.jsx` — behind the "Come and find us" band at the foot of the page | A slow warm wash: cream → oat → the stall's green, and nothing else. It sits under a heavy cream veil (`.visit__veil`) so the address stays on legible ground, and it is deliberately nowhere near the prices |
| **Liquid Metal** (`@paper-design/shaders-react`) | `src/effects/MetalWordmark.jsx` — the green nameplate that opens the menu | Warm brass moving across the SoupChick wordmark. The mask is built at runtime by drawing the name to a canvas in Fraunces, white on transparent — the high-contrast mask the shader needs. The plain text stays in the DOM underneath and only fades out once the shader is up |
| **Liquid Glass JS** (vendored, MIT) | `src/components/GlassCta.jsx` + `public/vendor/liquid-glass-js/` | One bounded job: the sticky "Find us in the Shambles" / "Call" tray that appears once you scroll past the hero. The glass plate is a decorative, `pointer-events: none` layer *behind* two real `<a>` elements, so the tray works untouched if WebGL, html2canvas or the vendored scripts fail. It never sits over the menu type |

`bridge.js` in the vendor folder is ours, not part of the library: `container.js`
and `button.js` declare `Container` and `Button` as top-level classes, which are
not reachable as `window.*` from an ES module, so the bridge hands them over.
The upstream MIT `LICENSE` is kept next to them.

### Logo, and the Liquid Metal mask

**No clean logo file was supplied.** The green-and-white chick roundel is only
visible as a thumbnail on the photographed menu, so it has not been traced,
redrawn or approximated anywhere in this project. The Liquid Metal mask is the
*wordmark* — the business name set in type.

When the real artwork arrives: export it white-on-transparent PNG at ~1280px
wide, drop it in `public/images/`, and in `src/effects/MetalWordmark.jsx`
replace the `buildMask()` call with that file's URL. Nothing else changes.

## Performance and accessibility

- **One canvas doing work at a time.** `useCanvasSlot()` in `src/lib/env.js`
  mounts each canvas only when its section first comes near the viewport, then
  drives an `animate` flag from live in-view state, tab visibility and
  `prefers-reduced-motion`. Off-screen canvases hold a static frame
  (`frameloop="demand"`, `animate="off"`, `speed={0}`).
- **DPR capped** at 1.25 on phones and 1.5 elsewhere; the steam canvas is
  capped harder still.
- **No WebGL2 → no canvases and no glass.** The page is designed to read as
  finished with every effect dead: the nameplate is plain type on green, the
  visit band is flat cream, the soup photo is just a soup photo.
- The html2canvas pass behind the glass tray runs once on idle and again only
  on a debounced, meaningful width change — never per scroll frame. This is
  also why the stylesheet uses plain hex and `rgba()` throughout: html2canvas
  cannot parse `oklch()` or `color-mix()`.
- Semantic landmarks, one `h1`, a skip link straight to the menu, `aria-labelledby`
  on every section, visible 3px focus rings, and ≥44px tap targets throughout.
- The menu is a `<dl>` per course group inside its own labelled `<section>`, so
  a screen reader reads "Ham & Cheese — five pounds fifty" as a pair. The dotted
  leaders are drawn in CSS and never reach the accessibility tree.
- Checked at 360, 390, 768, 1024 and 1440px. No horizontal scroll; the group
  headings stop being `white-space: nowrap` below 560px so a long title like
  "Delicious Oozing Toasties" wraps instead of pushing the page sideways.

## What is stated, and what is deliberately not

Only supplied facts appear on the page: the address, the phone number, the
5.0-from-15 Google rating (stated with its count, not dressed up), the 5/5 from
31 Facebook votes, the £1–10 price range, the four words off the signage, and
the menu.

Not on the page, because nobody supplied them: **opening hours** (only "opens
9:15am on Fridays" is known, and the page says exactly that and suggests ringing
ahead), an email address, awards, certifications, staff names, dietary or
allergen information, delivery, and any menu item or price not in the
transcription.

## Pending real information

- The four photographs and the logo file (above).
- **Full opening hours** — the market hall's hours presumably govern the stall.
- A **Facebook URL** — a 5/5-from-31-votes profile exists but no link was given.
- Whether the **daily soup specials** are posted anywhere online. That is the
  single most useful recurring thing this business has, and there is a natural
  slot for it in the "What's in the pot" band.
- Note: the printed menu shows `soupchick.co.uk`, so a site already exists. This
  page makes no claim to be their only web presence.
