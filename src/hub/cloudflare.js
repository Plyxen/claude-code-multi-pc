// Cloudflare Workers entry. Bindings and settings come from wrangler.toml:
//   DB                 D1 database (required)
//   COOP_LEAD_TOKEN    the lead's token, set with `wrangler secret put` (required)
//   COOP_LEAD_NAME     the lead's crew name (default "lead")
//   COOP_HUB_NAME      a name for this crew, shown on the board
//   COOP_MAX_WORKERS   how many workers can join (default 8)
import { createHub } from './app.js'
import { d1Database } from './d1.js'

let hub
let hubKey

export default {
  async fetch(request, env) {
    const key = [env.COOP_LEAD_TOKEN, env.COOP_LEAD_NAME, env.COOP_HUB_NAME, env.COOP_MAX_WORKERS].join('|')
    if (!hub || hubKey !== key) {
      try {
        hub = createHub({
          db: d1Database(env.DB),
          leadToken: env.COOP_LEAD_TOKEN,
          leadName: env.COOP_LEAD_NAME || 'lead',
          hubName: env.COOP_HUB_NAME || 'claude-coop',
          maxWorkers: Number(env.COOP_MAX_WORKERS) || 8,
        })
        hubKey = key
      } catch (error) {
        return Response.json({ error: `hub is not configured: ${error.message}` }, { status: 500 })
      }
    }
    return hub.fetch(request)
  },
}
