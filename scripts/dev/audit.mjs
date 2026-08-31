// Dev-only: structural accessibility + SEO sweep against a running server.
import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:3000/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

console.log(JSON.stringify(await p.evaluate(() => {
  const q = (s) => [...document.querySelectorAll(s)];
  return {
    title: document.title,
    metaDescription: document.querySelector('meta[name=description]')?.content?.slice(0, 70) + '…',
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    lang: document.documentElement.lang,
    h1Count: q('h1').length,
    h1Text: q('h1').map(h => h.textContent.trim()),
    headingOrder: q('h1,h2,h3').map(h => h.tagName),
    landmarks: { main: q('main').length, header: q('header').length, footer: q('footer').length, nav: q('nav').length },
    imgsMissingAlt: q('img').filter(i => !i.hasAttribute('alt')).length,
    imgTotal: q('img').length,
    iframesMissingTitle: q('iframe').filter(i => !i.title).length,
    telLinks: q('a[href^="tel:"]').length,
    ariaExpandedControls: q('[aria-expanded]').length,
    tablist: q('[role=tablist]').length,
    tabs: q('[role=tab]').length,
    tabpanels: q('[role=tabpanel]').length,
    // Every aria-controls must point at a real element.
    danglingAriaControls: q('[aria-controls]')
      .filter(e => !document.getElementById(e.getAttribute('aria-controls'))).length,
    skipLink: !!document.querySelector('a[href="#main"]'),
    // Anchor targets must all exist.
    brokenAnchors: q('a[href^="#"]')
      .map(a => a.getAttribute('href').slice(1))
      .filter(id => id && !document.getElementById(id)),
  };
}, null), null, 2));
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join('\n') : 'no page errors');
await b.close();
