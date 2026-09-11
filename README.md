# Aura Advisory & Estates — landing site

A single-page luxury real estate landing site: two full-height sections, each
over a looping background video, sharing one liquid-glass design system.

## Running it

The components are `<script type="text/babel">` files compiled in the browser by
Babel standalone, so the page must be served over HTTP — opening `index.html`
straight off the filesystem trips CORS.

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html                  design system (<style>), Tailwind config, CDN pins, script order
js/Icons.js                 inline lucide-style SVGs (currentColor stroke)
js/FadingVideo.js           looping video with a rAF-driven crossfade
js/BlurText.js              word-by-word blur-in, triggered by IntersectionObserver
js/Navbar.js                fixed liquid-glass navigation
js/ProfileCard.js           Eliza Reed lead-advisor card
js/Hero.js                  section 1
js/AdvisoryCapabilities.js  section 2
js/App.js                   composition + mount
assets/                     lead advisor portrait (see assets/README.md)
```

Every component publishes itself on `window` (`window.Hero = Hero`) and is loaded
in dependency order by `index.html`.

## Notes on the implementation

- **Video crossfade.** `FadingVideo` carries no CSS transition. `fadeTo()` steps
  opacity per animation frame, reading the current value back off
  `video.style.opacity` so an interrupted fade resumes from where it stopped, and
  cancelling the previous frame request before starting a new one. The `loop`
  attribute is deliberately off: the fade-out starts 0.55s before the end, and
  `ended` restarts playback after a 100ms beat and fades back in.
- **`window.Motion`.** The framer-motion 11 UMD build publishes its global as
  `Motion`, not `FramerMotion`, so the bootstrap line is
  `window.Motion = window.FramerMotion || window.Motion;` — assigning
  `window.FramerMotion` unconditionally would blank the namespace the components
  read from.
- **Border radius.** The Tailwind config overrides only `borderRadius.DEFAULT`
  (to `9999px`, so a bare `rounded` is a pill) and leaves the rest of the scale
  intact, which the `rounded-[1.25rem]` cards and `rounded-full` chips rely on.
- **No overlays.** Both videos are full-bleed with nothing dimming them;
  legibility comes from the liquid-glass chrome alone.
