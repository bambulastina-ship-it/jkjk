// Dev-only: verify the single-file preview works with NO network access at all.
import { chromium } from 'playwright';
import path from 'node:path';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
const errs = [], external = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 140)); });
// Block every non-file request: the preview must be fully self-contained.
await p.route('**/*', (route) => {
  const u = route.request().url();
  if (u.startsWith('file://') || u.startsWith('data:')) return route.continue();
  external.push(u.slice(0, 90));
  return route.abort();
});
await p.goto('file://' + path.resolve('preview/daisy-nails-preview.html'));
await p.waitForTimeout(3000);
// Scroll the whole page so lazy-loaded images and scroll-reveals actually fire.
await p.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 260));
  }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(2000);

const state = await p.evaluate(() => {
  const c = document.querySelector('canvas');
  return {
    canvas: !!c, canvasW: c?.width ?? 0,
    // Is the canvas actually painted, or an empty box?
    canvasPainted: c ? c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some(v => v !== 0) : false,
    h1: document.querySelector('h1')?.textContent,
    imgs: [...document.querySelectorAll('img')].length,
    imgsLoaded: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth > 0).length,
    tabs: document.querySelectorAll('[role=tab]').length,
    hydrated: !!document.querySelector('[aria-expanded]'),
    revealsHidden: [...document.querySelectorAll('.reveal')].filter(e => !e.classList.contains('is-visible')).length,
  };
});
console.log(JSON.stringify(state, null, 2));

// Does the canvas animate?
const snap = () => p.evaluate(() => document.querySelector('canvas').toDataURL().slice(-80));
const a = await snap(); await p.waitForTimeout(1200); const c2 = await snap();
console.log('canvas animating:', a !== c2);

// Interactivity: switch a service tab.
await p.locator('[role=tab]').nth(2).click();
await p.waitForTimeout(400);
console.log('tab switch works:', await p.locator('[role=tabpanel]:not([hidden])').first().textContent().then(t => t.slice(0, 40)));

await p.screenshot({ path: '/tmp/prev.png' });
console.log(external.length ? 'EXTERNAL REQUESTS (should be none): ' + [...new Set(external)].join('\n  ') : 'fully self-contained — no external requests');
console.log(errs.length ? errs.slice(0, 6).join('\n') : 'no errors');
await b.close();
