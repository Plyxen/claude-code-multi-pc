# Contributing

Thanks for helping. claude-coop is small on purpose: plain JavaScript (ES modules, no build step), Node 22.13+, and two dependencies (the MCP SDK and zod).

```bash
npm install
npm test
```

`npm test` runs the hub tests and an end-to-end test that starts a hub, uses the CLI, and drives a lead and two workers through real stdio MCP connections.

## Layout

| Path | What |
| --- | --- |
| `src/hub/app.js` | The hub API. Web APIs only, so it runs on Cloudflare and Node alike |
| `src/hub/cloudflare.js`, `node.js` | The two entry points; `d1.js` and `sqlite.js` are the storage adapters |
| `src/mcp/` | The MCP and channel server: tools, push policy, messages, instructions |
| `src/launch.js` | `coop start`: the Claude Code command line |
| `bin/coop.js` | The CLI |
| `docs/` | User docs |

## Guidelines

- Keep the hub free of Node-only APIs, since it has to run on Workers.
- The MCP server must never write to stdout: that's the protocol channel. Log to stderr.
- Anything that changes what Claude is told (`src/mcp/instructions.js`, `messages.js`) changes behaviour on other people's PCs. Explain why in the pull request.
- Add or update a test with every behaviour change.
