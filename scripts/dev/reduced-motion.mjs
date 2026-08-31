// Dev-only: verify the hero renders a single static frame under
// prefers-reduced-motion, and that no rAF loop is left running.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

for (const motion of ['reduce', 'no-preference']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: motion });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);

  // Count rAF callbacks over one second.
  const frames = await p.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const tick = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(tick); else res(n); };
    requestAnimationFrame(tick);
  }));

  // Hash the canvas twice, a second apart: identical means a static frame.
  const hash = () => p.evaluate(() => {
    const c = document.querySelector('canvas');
    return c ? c.toDataURL().length + ':' + c.toDataURL().slice(-64) : 'no-canvas';
  });
  const a = await hash();
  await p.waitForTimeout(1200);
  const c2 = await hash();

  console.log(`reducedMotion=${motion.padEnd(14)} canvasChanged=${a !== c2}  rafPerSec≈${frames}`);
  await ctx.close();
}
await b.close();
