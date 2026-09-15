import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-certificate-errors'] })
for (const [w, h, name] of [[1440, 900, 'hero-1440'], [375, 780, 'hero-375']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, ignoreHTTPSErrors: true, deviceScaleFactor: 1 })
  await p.goto('http://localhost:4173/', { waitUntil: 'load' })
  await p.waitForTimeout(4500)
  await p.screenshot({ path: `screenshots/${name}.png` })
  await p.close()
}
await b.close()
