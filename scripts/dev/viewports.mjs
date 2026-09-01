// Dev-only: responsive sweep across common widths, including the breakpoint
// boundaries where layouts switch. Runs against the standalone preview file, so
// it tests exactly what a client would open.
import { chromium } from 'playwright';
import path from 'node:path';

const SIZES = [
  [320, 568, 'small phone'],
  [375, 667, 'iPhone SE'],
  [390, 844, 'iPhone 14'],
  [430, 932, 'iPhone Pro Max'],
  [767, 1024, 'just below md'],
  [768, 1024, 'md boundary / tablet'],
  [1024, 768, 'landscape tablet'],
  [1440, 900, 'desktop'],
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const file = 'file://' + path.resolve('preview/daisy-nails-preview.html');

for (const [w, h, label] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 });
  const p = await ctx.newPage();
  await p.goto(file);
  await p.waitForTimeout(2200);
  await p.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 130));
    }
  });
  await p.waitForTimeout(700);

  const r = await p.evaluate(() => {
    const overflow = [...document.querySelectorAll('*')]
      .filter(e => e.getBoundingClientRect().right > window.innerWidth + 1)
      .map(e => e.tagName + '.' + String(e.className).slice(0, 40));
    const smallTaps = [...document.querySelectorAll('a,button')]
      .map(e => ({ t: (e.textContent || '').trim().slice(0, 22), r: e.getBoundingClientRect() }))
      .filter(o => o.r.width > 0 && o.r.height > 0 && Math.min(o.r.width, o.r.height) < 44)
      // The skip link is intentionally 1x1 until focused.
      .filter(o => o.t !== 'Skip to content')
      .map(o => `${o.t}(${Math.round(o.r.width)}x${Math.round(o.r.height)})`);
    // Body text must never drop below 12px.
    const tiny = [...document.querySelectorAll('p,li,dd,dt,td,th,span')]
      .filter(e => e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 12).length;
    return {
      hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
      overflow: [...new Set(overflow)].slice(0, 3),
      smallTaps: [...new Set(smallTaps)].slice(0, 3),
      tinyText: tiny,
      // Which service-menu affordance is active at this width?
      menu: document.querySelector('[role=tablist]')?.offsetParent ? 'tabs' : 'accordion',
      canvasOk: (() => { const c = document.querySelector('canvas'); return !!c && c.width > 0; })(),
    };
  });

  const ok = !r.hScroll && r.overflow.length === 0 && r.smallTaps.length === 0 && r.tinyText === 0 && r.canvasOk;
  console.log(
    `${String(w).padStart(4)}px ${label.padEnd(22)} ${ok ? 'PASS' : 'FAIL'}  menu:${r.menu}` +
    (r.hScroll ? '  H-SCROLL' : '') +
    (r.overflow.length ? `  overflow:${r.overflow}` : '') +
    (r.smallTaps.length ? `  taps:${r.smallTaps}` : '') +
    (r.tinyText ? `  tinyText:${r.tinyText}` : '') +
    (r.canvasOk ? '' : '  CANVAS DEAD'),
  );
  await ctx.close();
}
await b.close();
