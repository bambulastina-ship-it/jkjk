// Dev-only: viewport screenshot helper.
// usage: node scripts/dev/shot.mjs <url> <out.png> [w] [h] [waitMs]
import { chromium } from 'playwright';
const [url, out, w, h, wait] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: +(w||1280), height: +(h||900) }, deviceScaleFactor: 1 });
const errs = [];
p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(+(wait||2500));
await p.screenshot({ path: out, fullPage: false });
if (errs.length) console.log('CONSOLE ERRORS:\n' + errs.slice(0,10).join('\n'));
else console.log('no console errors');
await b.close();
