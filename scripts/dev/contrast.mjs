// Dev-only: measure the worst-case contrast of hero text against the animated
// canvas behind it, by hiding the text and sampling its exact bounding box.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);

// Read the real computed colour from the DOM rather than hardcoding it, so
// the measurement can never drift from the stylesheet.
// Only text that sits DIRECTLY on the animated canvas belongs here. Controls
// with their own solid fill (the CTA buttons) are ordinary static pairs and are
// checked against the token table instead — hiding them here would measure
// their text against the canvas rather than against their own background.
const targets = [
  'h1',
  'section#top p.eyebrow',
  'section#top p.mt-6.max-w-xl',
  'section#top div.mt-10.flex.flex-wrap',
];

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rl = (r, g, b2) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b2);

for (const sel of targets) {
  const loc = p.locator(sel).first();
  const box = await loc.boundingBox();
  if (!box) { console.log(sel, 'not found'); continue; }
  const color = await loc.evaluate((el) => {
    const m = getComputedStyle(el).color.match(/\d+(\.\d+)?/g);
    return m ? m.slice(0, 3).map(Number) : [255, 255, 255];
  });
  // Hide only the text, keep layout, so the canvas behind is unobstructed.
  await loc.evaluate((el) => { el.style.visibility = 'hidden'; });
  await p.waitForTimeout(400);
  const shot = await p.screenshot({ clip: box });
  await loc.evaluate((el) => { el.style.visibility = ''; });

  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
  let worst = Infinity, brightest = 0;
  const fg = rl(...color);
  for (let i = 0; i < data.length; i += info.channels) {
    const bg = rl(data[i], data[i + 1], data[i + 2]);
    if (bg > brightest) brightest = bg;
    const c = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    if (c < worst) worst = c;
  }
  const verdict = worst >= 4.5 ? 'AA' : worst >= 3 ? 'AA-large only' : 'FAIL';
  console.log(
    `${sel.padEnd(30)} fg rgb(${color.join(',')})  worst-pixel ${worst.toFixed(2)}:1  ${verdict}`,
  );
}
await b.close();
