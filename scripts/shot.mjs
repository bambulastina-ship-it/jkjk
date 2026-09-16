import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-certificate-errors'] })
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true })
await p.goto('http://localhost:4173/', { waitUntil: 'load' })
await p.waitForTimeout(4500)
await p.evaluate(() => document.querySelector('#before-after')?.scrollIntoView())
await p.waitForTimeout(1200)
await p.screenshot({ path: 'screenshots/ba.png' })
await p.evaluate(() => document.querySelector('#work')?.scrollIntoView())
await p.waitForTimeout(1200)
await p.screenshot({ path: 'screenshots/work.png' })
await b.close()
