import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PUBLIC = resolve(fileURLToPath(new URL('../../public/', import.meta.url)))
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webp': 'image/webp',
}

/** Minimal static server over /public so the page can be rendered exactly as deployed (root-relative paths work). */
export async function serve() {
  const server = createServer(async (req, res) => {
    let p = normalize(decodeURIComponent(req.url.split('?')[0]))
    if (p.endsWith('/')) p += 'index.html'
    const file = join(PUBLIC, p)
    if (!file.startsWith(PUBLIC)) { res.statusCode = 403; return res.end() }
    try {
      if ((await stat(file)).isDirectory()) { res.statusCode = 301; res.setHeader('location', p + '/'); return res.end() }
      res.setHeader('content-type', types[extname(file)] || 'application/octet-stream')
      res.end(await readFile(file))
    } catch { res.statusCode = 404; res.end('not found') }
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  return { server, origin: `http://127.0.0.1:${server.address().port}` }
}

export const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome'
