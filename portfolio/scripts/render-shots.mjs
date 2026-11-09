// Screenshots of individual pages (for review / PR artifacts).
//   node scripts/render-shots.mjs [outDir] [pageId ...]
// Default: every page, to ./.cache/shots
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { serve, CHROME } from './serve.mjs'

const out = process.argv[2] || new URL('../.cache/shots/', import.meta.url).pathname
const only = process.argv.slice(3)
await mkdir(out, { recursive: true })
const { server, origin } = await serve()
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto(`${origin}/portfolio/?print`)
await page.waitForSelector('html[data-ready]')
await page.evaluate(() => document.fonts.ready)
await page.waitForFunction(() => [...document.images].every((i) => i.complete))
const ids = await page.$$eval('.sheet', (s) => s.map((x) => x.id))
for (const id of ids) {
  if (only.length && !only.includes(id)) continue
  await page.locator('#' + id).screenshot({ path: `${out}/${String(ids.indexOf(id) + 1).padStart(2, '0')}-${id}.png` })
}
await browser.close(); server.close()
console.log('wrote', out)
