/* Ours, not vendor code. Bridges the vendor's global class declarations
   (which live in the global lexical scope, not on `window`) into a plain
   window property that ES modules can read. Loaded after container.js
   and button.js. */
window.LiquidGlass = { Container: Container, Button: Button }
