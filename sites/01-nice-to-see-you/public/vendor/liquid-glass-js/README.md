# Vendored: dashersw/liquid-glass-js (MIT)

`container.js`, `button.js`, `glass.css` and `LICENSE` are copied verbatim from
https://github.com/dashersw/liquid-glass-js — MIT, (c) 2025 Armagan Amcalar.
Do not edit them. The npm package called `liquid-glass-js` is a different
author's project and is deliberately not used.

They are classic scripts that declare the globals `Container` and `Button`, and
they expect `window.html2canvas` to exist before a `Container` is constructed.

`expose.js` is OURS, not vendor code. It is a three-line shim that copies the
two global class bindings onto `window.LiquidGlass` so ES modules can reach them
without relying on bare global-lexical lookups surviving bundling.

Loaded lazily at runtime by `src/components/GlassVisitPill.jsx`.
