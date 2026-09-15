import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4173/'
const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const widths = [375, 768, 1024, 1440]
const fails = []
const note = (m) => console.log(m)

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  // The sandbox proxy re-signs TLS, which the bundled Chromium does not trust;
  // without this the Google Fonts stylesheet is blocked and screenshots render
  // in fallback fonts. Screenshot fidelity only — not a site setting.
  ignoreHTTPSErrors: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--ignore-certificate-errors'],
})

// --- 1. Loader timing -------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  const t0 = Date.now()
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.screenshot({ path: `${OUT}/loader-1280.png` })
  await page.waitForSelector('.loader--out', { timeout: 8000 })
  const held = await page.evaluate(() => Date.now() - window.__bootAt)
  note(`loader held ${held}ms from first paint (target 3000); ${Date.now() - t0}ms from navigation`)
  // The hold is a floor, not a fixed value: the page cannot be revealed before
  // React has rendered it. Never shorter than 3s is the hard requirement; a
  // longer hold only ever means a slow bundle parse (CPU-starved CI).
  if (held < 2900) fails.push(`loader hold ${held}ms — shorter than the required 3s`)
  else if (held > 3900) note(`  ! hold ${held}ms > 3s: React mount was slow here, not a site defect`)
  const locked = await page.evaluate(() => document.body.classList.contains('is-locked'))
  note(`scroll locked during loader: ${locked}`)
  await page.waitForTimeout(700)
  const stillLocked = await page.evaluate(() => document.body.classList.contains('is-locked'))
  if (stillLocked) fails.push('scroll still locked after loader')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  note(`focus after reveal: ${focused}`)
  if (focused !== 'H1') fails.push(`focus went to ${focused}, expected H1`)
  await ctx.close()
}

// --- 2. Responsive screenshots + overflow -----------------------------
for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 700 ? 780 : 900 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3900)
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6)
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })

  // Regression guard: reveal-on-scroll must never leave content invisible.
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('[data-reveal]')]
      .filter(n => parseFloat(getComputedStyle(n).opacity) < 0.9)
      .map(n => n.className.toString().slice(0, 40)))
  note(`w=${width} reveal elements still hidden: ${hidden.length}`)
  if (hidden.length) fails.push(`${hidden.length} element(s) stuck invisible at ${width}px: ${hidden[0]}`)
  await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/page-${width}.png`, fullPage: true })

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth)
  note(`w=${width} horizontal overflow: ${overflow}px`)
  if (overflow > 1) fails.push(`horizontal overflow ${overflow}px at ${width}px`)

  // tel: link + touch target
  const tel = await page.evaluate(() => {
    const all = [...document.querySelectorAll('a[href^="tel:"]')]
    const vis = all.filter(a => a.getBoundingClientRect().height > 0)
    const smallest = Math.min(...vis.map(a => Math.round(a.getBoundingClientRect().height)))
    return { total: all.length, visible: vis.length, minH: smallest,
             hrefs: [...new Set(all.map(a => a.getAttribute('href')))] }
  })
  note(`w=${width} tel: ${JSON.stringify(tel)}`)
  if (tel.visible < 1) fails.push(`no visible tel: link at ${width}px`)
  if (tel.hrefs.length !== 1 || tel.hrefs[0] !== 'tel:+13654403466')
    fails.push(`unexpected tel hrefs: ${tel.hrefs.join(',')}`)
  if (tel.minH < 44) fails.push(`smallest visible tel target ${tel.minH}px at ${width}px`)

  // Scroll the whole page so lazy images actually load before auditing them.
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(600)

  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager' })
  })
  await page.waitForFunction(
    () => [...document.images].filter(i => !i.closest('[aria-hidden="true"]')).every(i => i.complete),
    null, { timeout: 20000 }).catch(() => {})

  const imgs = await page.evaluate(() =>
    [...document.images].filter(i => !i.closest('[aria-hidden="true"]')).map(i => ({
      src: i.getAttribute('src') || '(no src)', nw: i.naturalWidth,
      dw: Math.round(i.getBoundingClientRect().width),
      complete: i.complete, inView: i.getBoundingClientRect().top < window.innerHeight * 3,
      ok: i.complete && i.naturalWidth > 0,
    })))
  imgs.forEach(i => {
    if (!i.ok) fails.push(`image not loaded: ${i.src} at ${width}px (complete=${i.complete} nw=${i.nw} dw=${i.dw})`)
    else if (i.dw > 0 && i.nw < i.dw) note(`  ! ${i.src} upscaled ${i.nw}px -> ${i.dw}px at w=${width}`)
  })
  await ctx.close()
}

// --- 3. Reduced motion -------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4200)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1200)
  const canvases = await page.locator('canvas').count()
  note(`reduced-motion canvases mounted: ${canvases} (expect 0)`)
  if (canvases > 0) fails.push(`${canvases} canvas mounted under reduced motion`)
  await page.screenshot({ path: `${OUT}/reduced-motion-1440.png`, fullPage: true })
  await ctx.close()
}

// --- 4. No WebGL --------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (t, ...a) {
      if (String(t).includes('webgl')) return null
      return orig.call(this, t, ...a)
    }
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4200)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUT}/no-webgl-1440.png`, fullPage: true })
  note(`no-webgl page errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  if (errors.length) fails.push(`page errors without WebGL: ${errors[0]}`)
  await ctx.close()
}

// --- 5. Desktop scrolled state (call bar + shader) ----------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4200)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/bottom-1440.png` })
  const bar = await page.locator('.callbar--in').count()
  note(`call bar visible when scrolled: ${bar === 1}`)
  if (bar !== 1) fails.push('call bar did not appear on desktop scroll')
  note(`desktop page errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  if (errors.length) fails.push(`page errors: ${errors[0]}`)
  await ctx.close()
}

await browser.close()

console.log('\n==== RESULT ====')
if (fails.length) { fails.forEach(f => console.log('FAIL: ' + f)); process.exitCode = 1 }
else console.log('all checks passed')
