# Changelog

## 0.1.2

- Renamed from claude-coop to claude-code-multi-pc, so people looking for Claude Code across several PCs and accounts can find it. The command is still `coop`, settings stay in `~/.claude-coop`, and the old GitHub address redirects. To switch an existing install: `npm uninstall -g claude-coop`, then `npm install -g github:Plyxen/claude-code-multi-pc`.
- A new hub's default crew name is now `coop`, and the Cloudflare example names the Worker and database `coop-hub`. Hubs you already run keep their names.

## 0.1.1

- CLI commands (`coop join`, `status`, `doctor`, ...) no longer make you look online or tell the lead "your Claude is online". Only a running Claude session counts. The hub skips presence for requests with `X-Coop-Presence: off`; update the hub too.
- Suggested branch names keep whole words and don't end on words like "for" or "the" when a long title is shortened.

## 0.1.0

First release.

- Hub with crew, task board, event log and permission relay. Runs as a Cloudflare Worker (D1) or self-hosted on Node (built-in SQLite).
- `coop` CLI: `hub`, `join`, `invite`, `remove`, `start`, `status`, `doctor`, `profiles`, `use`, `token`, `mcp`.
- MCP server that is also a Claude Code channel: lead and worker tools, pushes crew events into the session, reminders for waiting work, and `coop_inbox` for sessions without channels.
- Docs for leads, workers, project setup, deployment, security and troubleshooting.
