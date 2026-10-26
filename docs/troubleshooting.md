# Troubleshooting

Start with `coop doctor` in the project folder. It checks Node, Claude Code, your crew profile, the hub, git and gh.

## The worker doesn't react to new tasks

- **Was it started with `coop start`?** Plain `claude` doesn't load the channel.
- **Did you see the channels notice at startup?** A line like `Channels (experimental) messages from server:coop inject directly in this session` should appear under the banner. If there's a warning instead:
  - *blocked by org policy*: on a Team or Enterprise plan, an admin must [enable channels](https://code.claude.com/docs/en/channels#enterprise-controls).
  - Channels need Claude Code 2.1.80+ and a claude.ai or Console login (not Bedrock, Vertex or Foundry). Update with `claude update`.
- **Is the window still open?** Closing it stops the worker. Tasks wait on the hub until it's back.
- **Is the PC asleep?**
- In the session, `/mcp` should show `coop` as connected. If it failed, run `coop mcp` in a terminal to see the error (it should sit and wait; Ctrl+C to stop).
- Pushes are best effort. A worker also gets a reminder about waiting work every 5 minutes. As a fallback, type in the worker session: *check coop_status and take any task assigned to you*.

If channels can't work on your setup at all, a worker can still poll: start Claude in the project folder and tell it *use coop_inbox with wait_seconds 600 in a loop and do the tasks that arrive*.

## The channel doesn't register on newer Claude Code

Claude Code's v2 MCP runtime doesn't register channel servers that negotiate MCP protocol revision 2026-07-28. claude-coop uses MCP SDK 1.x, which doesn't, so it registers normally. If you still see it fail, set `MCP_PROTOCOL_NEGOTIATION=legacy` before `coop start` and [open an issue](https://github.com/Plyxen/claude-coop/issues).

## "Claude Code (the `claude` command) was not found"

Install Claude Code ([quickstart](https://code.claude.com/docs/en/quickstart)) or point `CLAUDE_BIN` at it, or pass `coop start --claude <path>`.

## "can't reach the hub"

- Open `<hub url>/health` in a browser: it should show `{"ok":true,...}`.
- A self-hosted hub only answers while `coop hub` runs, and only on your own PC unless you opened it up ([self-hosting.md](self-hosting.md)).
- A quick Cloudflare Tunnel URL changes when the tunnel restarts. Everyone has to `coop join` again with the new URL.

## "unknown or revoked token"

The lead re-invited or removed you, or the hub was reset. Ask for a new invite and run `coop join` again.

## The worker keeps asking for permission

Pick a mode that fits (`coop start --permission-mode auto` or `acceptEdits`). Prompts are forwarded to the lead unless you used `--no-relay`. If your plan doesn't have auto mode, Claude Code says so at startup: use `acceptEdits`.

## Two workers edited the same files

Give each task a `scope`, keep overlapping work with one worker, and keep tasks small. See [project-setup.md](project-setup.md).

## Start fresh

`coop profiles` lists your crews. Your settings are in `~/.claude-coop/`: `config.json` holds the profiles and tokens, and `state/` the event cursors. Deleting a file in `state/` just makes that session start from "now".
