// Dev-only: full-page screenshot after scrolling the page at human speed so
// every scroll-reveal has fired.
// usage: node scripts/dev/fullshot.mjs <url> <prefix> [width]
import { chromium } from 'playwright';
const [url, prefix, w] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: +(w||1440), height: 950 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { if (m.type()==='error' && !m.text().includes('404')) errs.push(m.text()); });
await p.goto(url, { waitUntil: 'networkidle' });
// Scroll the whole page so every IntersectionObserver reveal has fired.
// Scroll at roughly human speed and DO NOT return to the top: scroll-reveal is
// one-shot, so anything still below the fold has legitimately not revealed yet.
// Racing back to the top would just re-hide it and measure nothing useful.
await p.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 320));
  }
});
await p.waitForTimeout(2500);
await p.screenshot({ path: `${prefix}-full.png`, fullPage: true });
console.log('height', await p.evaluate(() => document.body.scrollHeight));
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
await b.close();
