// Dev-only: mobile menu open/close, Escape handling and body-scroll release.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await p.goto('http://localhost:3114/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const sheet = p.locator('#mobile-nav');
console.log('closed -> visible?', await sheet.isVisible());
await p.locator('button[aria-controls="mobile-nav"]').click();
await p.waitForTimeout(500);
console.log('opened -> visible?', await sheet.isVisible());
await p.screenshot({ path: '/tmp/menu-open.png' });
await p.keyboard.press('Escape');
await p.waitForTimeout(500);
console.log('after Escape -> visible?', await sheet.isVisible());
// Body scroll must be released again.
console.log('body overflow after close:', JSON.stringify(await p.evaluate(() => document.body.style.overflow)));
await b.close();
