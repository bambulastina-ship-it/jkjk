// Dev-only: assert every scroll-reveal element becomes visible at normal
// scroll speed. Guards the fail-safe reveal behaviour described in the README.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
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
await p.waitForTimeout(2000);
console.log(await p.evaluate(() => {
  const all = [...document.querySelectorAll('.reveal')];
  const hidden = all.filter(e => !e.classList.contains('is-visible'));
  return {
    total: all.length,
    visible: all.length - hidden.length,
    hiddenSamples: hidden.slice(0, 6).map(e => ({
      tag: e.tagName,
      cls: e.className.slice(0, 70),
      text: (e.textContent || '').trim().slice(0, 40),
      h: Math.round(e.getBoundingClientRect().height),
      top: Math.round(e.getBoundingClientRect().top + window.scrollY),
    })),
  };
}));
await b.close();
