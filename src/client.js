// A thin client for the hub's API, used by the MCP server and the CLI.
import { VERSION } from './hub/app.js'

export class HubError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export class HubClient {
  // presence: false for one-off commands, so they don't make you look online.
  constructor({ hub, token, timeoutMs = 15_000, presence = true }) {
    if (!hub) throw new Error('no hub URL')
    if (!token) throw new Error('no token')
    this.base = hub.replace(/\/+$/, '')
    this.token = token
    this.timeoutMs = timeoutMs
    this.presence = presence
  }

  async request(method, path, body) {
    let response
    try {
      response = await fetch(this.base + path, {
        method,
        headers: {
          authorization: `Bearer ${this.token}`,
          'content-type': 'application/json',
          'user-agent': `claude-code-multi-pc/${VERSION}`,
          ...(this.presence ? {} : { 'x-coop-presence': 'off' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch (error) {
      throw new HubError(`can't reach the hub at ${this.base} (${error.cause?.code ?? error.name})`, 0)
    }
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new HubError(data.error ?? `hub answered HTTP ${response.status}`, response.status)
    return data
  }

  me() {
    return this.request('GET', '/v1/me')
  }
  board() {
    return this.request('GET', '/v1/board')
  }
  events(after, limit = 100) {
    return this.request('GET', `/v1/events?after=${after}&limit=${limit}`)
  }
  tasks(status) {
    return this.request('GET', `/v1/tasks${status ? `?status=${encodeURIComponent(status)}` : ''}`)
  }
  task(id) {
    return this.request('GET', `/v1/tasks/${id}`)
  }
  createTask(task) {
    return this.request('POST', '/v1/tasks', task)
  }
  taskAction(id, action, body = {}) {
    return this.request('POST', `/v1/tasks/${id}/${action}`, body)
  }
  send(message) {
    return this.request('POST', '/v1/messages', message)
  }
  invite(name) {
    return this.request('POST', '/v1/members', { name })
  }
  remove(name) {
    return this.request('DELETE', `/v1/members/${encodeURIComponent(name)}`)
  }
  permissionRequest(request) {
    return this.request('POST', '/v1/permissions', request)
  }
  permissionVerdict(verdict) {
    return this.request('POST', '/v1/permissions/verdict', verdict)
  }
}
