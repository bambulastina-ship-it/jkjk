/*
 * Not part of the vendored library — added by this site.
 *
 * container.js and button.js are classic scripts that declare `Container` and
 * `Button` as top-level classes. Class declarations land in the global lexical
 * scope, which is not reachable as `window.Container` from an ES module, so
 * this tiny bridge hands them over explicitly.
 */
window.LiquidGlassJS = { Container, Button }
