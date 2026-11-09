// Captures phone-frame screens from a local checkout of the BLING prototype
// (https://github.com/shiyaitsme/BLING) so the portfolio can show the real
// system rather than a single hero image.
//   BLING_DIR=/path/to/BLING node scripts/capture-bling.mjs
// Output: raw PNGs in ./.cache/bling (convert with scripts/optimise-images.py).
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const DIR = process.env.BLING_DIR
if (!DIR) throw new Error('Set BLING_DIR to a checkout of the BLING repo')
const OUT = new URL('../.cache/bling/', import.meta.url).pathname
await mkdir(OUT, { recursive: true })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' }
const server = createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(req.url.split('?')[0]))
  if (p === '/') p = '/index.html'
  try {
    res.setHeader('content-type', types[extname(p)] || 'application/octet-stream')
    res.end(await readFile(join(DIR, p)))
  } catch { res.statusCode = 404; res.end() }
}).listen(0)
const port = server.address().port

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 520, height: 960 }, deviceScaleFactor: 2 })
await page.goto(`http://localhost:${port}/`)
await page.waitForTimeout(800)

const phone = page.locator('.phone')
async function shot(name) {
  await page.waitForTimeout(500)
  const b = await phone.boundingBox()
  await page.screenshot({ path: OUT + name + '.png', clip: { x: b.x + 7, y: b.y + 7, width: b.width - 14, height: b.height - 14 } })
}
const run = (code) => page.evaluate(code)

await shot('home')
await run(`goPage('p-community')`); await shot('community')
await run(`goPage('p-discover')`); await shot('discover')
await run(`goPage('p-shop')`); await shot('shop')
await run(`goPage('p-yuzuru')`); await shot('athlete')
await run(`goPage('p-music')`); await shot('music')

await run(`goPage('p-muse')`); await shot('muse-intro')
await run(`museAsk(MUSE_PRESETS[0].q)`); await page.waitForTimeout(1400); await shot('muse-answer')

await run(`openPrintCustom()`); await shot('print-1-program')
await run(`ppSelectProgram('seimei')`); await run(`ppNext()`); await shot('print-2-mood')
await run(`ppNext()`); await page.waitForTimeout(3500); await shot('print-3-pattern')
await run(`ppNext()`); await page.waitForTimeout(800); await run(`ppSelectProduct('hoodie')`); await shot('print-4-product')
await run(`ppNext()`); await page.waitForTimeout(1500); await shot('print-5-preview')

await run(`openArc()`); await shot('arc-1')
for (let i = 2; i <= 4; i++) { await run(`arcNext()`); await shot('arc-' + i) }

await browser.close(); server.close()
