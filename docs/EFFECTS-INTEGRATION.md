# The four mandatory libraries — verified integration notes

All five sites must use all four. Verified by cloning each repo and probing npm
on 2026-09-03; versions and licences below are what was actually found, not
assumed. Read this before wiring anything up.

Because ShaderGradient, Liquid Metal and R3F are all React, every site is a
standalone **Vite + React 19** project.

---

## 1. React Three Fiber — MIT

`@react-three/fiber` **9.7.0** (React 19). Peer: `three` (0.185.x).
Optional but usually worth it: `@react-three/drei` 10.7.8.

```bash
npm i three @react-three/fiber
```

It is also ShaderGradient's own renderer, so it is in the tree regardless —
but each site should use it for something of its own, not just as a transitive
dependency.

---

## 2. ShaderGradient — `@shadergradient/react`

npm latest **2.4.20** (repo HEAD is 2.4.24). Peer deps are NOT bundled:

```bash
npm i @shadergradient/react @react-three/fiber three three-stdlib camera-controls
npm i -D @types/three
```

React 18 or 19 both fine on Vite (the React-19-only constraint in the README is
specific to the Next.js App Router, which does not apply here).

```jsx
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

<ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }} pixelDensity={1.5} fov={45}>
  <ShaderGradient cDistance={32} cPolarAngle={125} />
</ShaderGradientCanvas>
```

Driveable by props or by `control='query'` + `urlString` from
shadergradient.co/customize. Mesh props include `type` (`plane` | `sphere` |
`waterPlane`), `animate`, `uSpeed`, `uStrength`, `uDensity`, `uFrequency`,
`uAmplitude`, `color1/2/3`, `positionX/Y/Z`, `loop`, `loopDuration`.

---

## 3. Liquid Logo — ⚠️ use the Apache-2.0 package, not the repo

**Trap.** `paper-design/liquid-logo` is a Next.js *demo app*, marked
`"private": true`, and licensed **PolyForm Shield 1.0.0** — source-available
with a non-compete restriction. It is not installable and not the right thing
to copy into client work.

The same team publishes the effect properly:

```bash
npm i @paper-design/shaders-react     # 0.0.80, Apache-2.0
```

```jsx
import { LiquidMetal, liquidMetalPresets } from '@paper-design/shaders-react'
```

Also exports `MeshGradient`, `Metaballs`, `Water`, `Swirl`, `Dithering`,
`PaperTexture`, `ShaderMount` and more, plus a `*Presets` export per shader.

Shader parameters (from the original repo, useful for tuning): `patternScale`,
`refraction` (0–0.06, default 0.015), `edge` (0–1, default 0.4), `patternBlur`
(0–0.05, default 0.005), `liquid` (0–1, default 0.07), `speed` (0–1, default 0.3).

The effect takes a **high-contrast mask** — a logo or wordmark on transparent
background works; a photograph does not. Each site needs a mark prepared for it.

---

## 4. Liquid Glass JS — ⚠️ vendor it, do not npm install it

**Trap.** The npm package named `liquid-glass-js` is by a *different author*
(eamonliu) and is not the repo we were given. `dashersw/liquid-glass-js` has no
package.json and is not published.

It is **MIT** (Copyright 2025 Armagan Amcalar), so vendor the files into each
project with the licence header retained. Needed: `container.js`, `button.js`,
`glass.css`. It defines globals `Container` and `Button` (Button extends
Container) and depends on **html2canvas** to sample the page behind the glass.

```js
const container = new Container({ borderRadius: 24, type: 'pill', tintOpacity: 0.3 })
const button = new Button({ text: 'Action', size: 24, type: 'pill', warp: true, onClick: t => {} })
container.addChild(button)
document.body.appendChild(container.element)
```

`type`: `'rounded' | 'circle' | 'pill'`. Also `container.updateSizeFromDOM()`,
`addChild`, `removeChild`.

Being imperative + canvas-sampling, it needs a small React wrapper that
constructs on mount, appends into a ref'd node, and tears down on unmount. Its
html2canvas pass is expensive — sample once after load, re-sample on resize
(debounced), and never per-scroll-frame. Give it a bounded, deliberate role
(one sticky action, one nav pill), not glass everywhere.

---

## Performance and mobile rules (all sites)

These effects are WebGL and stack up fast. Non-negotiable per site:

- One WebGL context doing heavy work at a time; never two full-viewport canvases.
- Respect `prefers-reduced-motion` — pause animation, keep a static frame.
- Drop `pixelDensity` on mobile; cap DPR around 1.5.
- Pause rendering when offscreen or when the tab is hidden.
- Ship a static fallback if WebGL2 is unavailable — the page must still read
  as premium with every canvas dead.
- The effects sit behind or beside the content; text stays on solid, legible
  ground with real contrast.
