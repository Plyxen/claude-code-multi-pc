// The self-hosted hub: the same app as on Cloudflare, served by node:http
// with Node's built-in SQLite as storage.
import { createServer } from 'node:http'
import { createHub } from './app.js'
import { sqliteDatabase } from './sqlite.js'

const MAX_REQUEST = 128 * 1024

export async function startNodeHub({ port = 8765, host = '127.0.0.1', dbPath = ':memory:', leadToken, leadName, hubName, maxWorkers, log = console.error }) {
  const db = await sqliteDatabase(dbPath)
  const hub = createHub({ db, leadToken, leadName, hubName, maxWorkers })

  const server = createServer(async (req, res) => {
    try {
      const chunks = []
      let size = 0
      for await (const chunk of req) {
        size += chunk.length
        if (size > MAX_REQUEST) {
          res.writeHead(413, { 'content-type': 'application/json' }).end('{"error":"request body too large"}')
          return
        }
        chunks.push(chunk)
      }
      const request = new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
      })
      const response = await hub.fetch(request)
      res.writeHead(response.status, Object.fromEntries(response.headers))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      log(error)
      if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' })
      res.end('{"error":"internal error"}')
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, resolve)
  })
  const actualPort = server.address().port
  const shownHost = host === '0.0.0.0' || host === '::' ? 'localhost' : host

  return {
    url: `http://${shownHost}:${actualPort}`,
    port: actualPort,
    async close() {
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}
