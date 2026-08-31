import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
await p.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await p.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 300));
  }
});
await p.waitForTimeout(1500);
await p.screenshot({ path: '/tmp/m-full.png', fullPage: true });
// Horizontal overflow is the classic mobile failure — check for it explicitly.
const overflow = await p.evaluate(() => ({
  docW: document.documentElement.scrollWidth,
  winW: window.innerWidth,
  offenders: [...document.querySelectorAll('*')]
    .filter(e => e.getBoundingClientRect().right > window.innerWidth + 1)
    .slice(0, 5)
    .map(e => e.tagName + '.' + String(e.className).slice(0, 50)),
}));
console.log(JSON.stringify(overflow, null, 2));
// Tap-target audit: interactive elements must be >= 44px in the smaller axis.
const small = await p.evaluate(() => [...document.querySelectorAll('a,button')]
  .map(e => ({ t: (e.textContent||'').trim().slice(0,28), r: e.getBoundingClientRect() }))
  .filter(o => o.r.width > 0 && o.r.height > 0 && Math.min(o.r.width, o.r.height) < 44)
  .map(o => `${o.t} :: ${Math.round(o.r.width)}x${Math.round(o.r.height)}`));
console.log('tap targets under 44px:', small.length ? small : 'none');
console.log(errs.length ? 'ERRORS: '+errs.join('\n') : 'no page errors');
await b.close();
