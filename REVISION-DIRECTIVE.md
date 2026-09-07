# REVISION DIRECTIVE — applies to ALL agent sites, current and future

Client verdict on v1: not premium enough. Reads as a flat generic template.
Target: a show-stopping, ultra-premium experience that lands a "wow" inside
half a second.

This directive SUPERSEDES the earlier art-direction bans on metallic gold,
glass effects, glow, and 3D. The client has explicitly reversed those. What
still stands, absolutely: no invented facts, no payment functionality.

## 1. All four reference technologies must be meaningfully integrated

- **ShaderGradient** — dynamic, ultra-smooth organic gradient behind the hero
  or a key showcase section. No flat static grounds.
- **Liquid Logo** — fluid interactive treatment on the wordmark/primary mark;
  alive on hover and scroll.
- **Liquid Glass JS** — true optical refraction, realistic blur, glossy light
  borders on float cards, navbar, showcase overlays.
- **React Three Fiber** — interactive 3D / mesh distortion / fluid geometric
  depth in the hero or a visual-storytelling section.

### Implementation rule — read this before installing anything
ShaderGradient and React Three Fiber are React libraries and pulling React +
a build step into a one-page static site contradicts the standing "keep it
lean" requirement. **Port the effect, not the framework.** Use vanilla
three.js (UMD build, pinned version) and hand-written GLSL/WebGL for the
shader gradient and the 3D layer; hand-written CSS/SVG filters plus canvas for
the liquid-glass refraction and the liquid logo. Credit each source repo in a
comment at the top of app.js and state what you ported.

Performance floor, non-negotiable:
- WebGL canvases must pause via IntersectionObserver when off-screen.
- Cap devicePixelRatio at 2. Cap the render loop; no runaway rAF.
- On `prefers-reduced-motion`, render a static first frame — no animation.
- On coarse/low-power pointers and narrow viewports, degrade to a CSS-only
  gradient fallback rather than shipping a hot GPU loop to a phone.
- The page must stay responsive while scrolling. A beautiful site that stutters
  is not premium.

## 2. Palette — one per agent, do not share

| Agent | Palette | Values |
|---|---|---|
| 1 — Lara Issa | Obsidian & Champagne | `#0A0A0C` onyx · `#E5C158` champagne · `#F2EBD9` warm sand · soft cream |
| 2 — Katerina Telesh | Midnight Slate & Liquid Platinum | `#0F172A` slate · `#E2E8F0` platinum · `#94A3B8` ice silver · gloss cyan accent |
| 3 — Muhammed Ashmid | Deep Emerald & Warm Bronze | `#062319` emerald night · `#C89D66` bronze · muted gold · soft off-white |

Champagne/bronze/gold are now sanctioned — but as *metal*, rendered with real
light behaviour (specular sweeps, refraction, thin bright edges), never as a
lazy linear-gradient fill on flat text.

## 3. Craft requirements

- **Typography**: ultra-clean modern display (Cinzel, Syne, Clash Display,
  Cabinet Grotesek or equivalent) paired with a high-readability body face.
  Self-host woff2 — Google Fonts is blocked in this sandbox and remote fonts
  will not render in screenshots.
- **Micro-interactions**: buttons glow smoothly on hover; images tilt/expand on
  cursor movement; sections scroll-reveal with weighted, physical easing.
- **Imagery**: present supplied photos inside high-end glass frames, layered
  depth cards, or interactive masked showcases. Source images are LOW
  RESOLUTION — glass, depth and grain now work in your favour: they mask
  softness. Still never upscale a photo past ~1.3x native.
- **Fit**: test at 360, 390, 414, 768, 1024, 1280, 1440, 1920. Zero horizontal
  overflow, zero awkward wrapping, zero console errors, at every width.

## 4. Unchanged and still absolute
- No payment anything: Stripe, PayPal, Apple/Google Pay, card fields, checkout,
  cart, pricing tables, subscriptions, crypto.
- No backend, database, auth.
- No invented testimonials, reviews, awards, metrics, deal counts, AED figures,
  ROI or yield numbers, certifications, or guarantees.
- Each site stays visually distinct from the other two.
