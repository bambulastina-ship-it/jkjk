/*
 * Site-local shim for the vendored liquid-glass-js (MIT, © 2025 Armagan Amcalar).
 * container.js and button.js are classic scripts that declare `Container` and
 * `Button` as top-level class bindings. This exposes them on `window` so the
 * React wrapper can pick them up without touching the vendored files.
 */
;(function () {
  try { window.Container = Container } catch (e) {}
  try { window.Button = Button } catch (e) {}
})()
