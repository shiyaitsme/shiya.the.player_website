// Renders the portfolio to a PDF with headless Chrome (Playwright).
//   npm install            (in /portfolio)
//   npm run pdf            -> ../public/portfolio/Shiya-Li-Portfolio.pdf
// Env: CHROME_PATH=/path/to/chrome   (defaults to /usr/local/bin/google-chrome; any Chromium works)
// Also prints every [TO CONFIRM: …] placeholder found on each page.
import { chromium } from 'playwright-core'
import { writeFile } from 'node:fs/promises'
import { serve, PUBLIC, CHROME } from './serve.mjs'

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const out = args[0] || `${PUBLIC}/portfolio/Shiya-Li-Portfolio.pdf`
const { server, origin } = await serve()
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${origin}/portfolio/?print`)
await page.waitForSelector('html[data-ready]')
await page.emulateMedia({ media: 'print' })
await page.evaluate(async () => {
  document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'))
  await document.fonts.ready
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r }))))
})

const placeholders = await page.$$eval('.sheet', (sheets) =>
  sheets.flatMap((s, n) => [...s.querySelectorAll('.todo')].map((el) => ({ page: n + 1, id: s.id, text: el.textContent })))
)

await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true })
await browser.close(); server.close()

const sheets = placeholders.reduce((m, p) => ((m[p.page] = (m[p.page] || 0) + 1), m), {})
console.log(`PDF written: ${out}`)
console.log(`${placeholders.length} placeholders on ${Object.keys(sheets).length} pages`)
if (process.argv.includes('--list')) placeholders.forEach((p) => console.log(`p${p.page} (${p.id}): ${p.text}`))
await writeFile(new URL('../.cache/placeholders.json', import.meta.url), JSON.stringify(placeholders, null, 2)).catch(() => {})
