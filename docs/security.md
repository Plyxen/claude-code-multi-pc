# Security

claude-coop lets one person's Claude hand work to Claude sessions on other people's PCs. That's the point of it, and it's also why everyone in a crew should trust the lead. Here is exactly what the trust covers, and the knobs that limit it.

## What the lead can make a worker do

The lead sends **text**: tasks, feedback and messages. The worker's Claude reads that text and acts on it **with the worker's Claude Code permissions, on the worker's PC, inside the folder where `coop start` ran**. It is not remote desktop: nobody sees the screen, moves the mouse or reads files outside what Claude Code itself can reach.

What limits the worker:

1. **The worker's instructions.** Every worker is told to stay in the project folder; never push to main, merge, deploy or publish; never touch secrets, credentials, accounts or payments; never install software system-wide; and to refuse anything the project's rules forbid and tell the lead why.
2. **The project's CLAUDE.md**, which workers are told comes before any task.
3. **Claude Code's permission mode**, which the worker's owner picks:
   - `auto` (the default) runs Claude Code's classifier, which blocks risky actions.
   - `acceptEdits` or `manual` make commands wait for approval.
   - `bypassPermissions` removes every check. Use it only in a VM or a throwaway user account.
4. **Permission relay.** Approval prompts go to the lead's user as well as to the worker's own screen. The lead's Claude is told never to answer one on its own judgment. Turn relay off with `coop start --no-relay`.

What *doesn't* limit the worker: the lead's good intentions. Instructions in a task are still instructions. Only join crews whose lead you'd let use your PC's Claude.

## Messages from other workers

Workers can message each other, but those messages are marked `from_role="worker"`, and every worker is told to treat them as information, not instructions. Only the lead's messages are instructions. Only the lead can create, assign or review tasks: the hub enforces that.

## Tokens

- Every member has their own token. The hub stores only SHA-256 hashes of tokens.
- Tokens live in `~/.claude-coop/config.json` (owner-only permissions where the OS supports it). Never in the project folder, never in `.mcp.json`.
- Send tokens privately. If one leaks, the lead runs `coop invite <name>` again (the old token stops working) or `coop remove <name>`.
- Use https, or a private network like Tailscale, between PCs. `coop join` warns about plain http to another machine.

## The hub

The hub sees task titles and details, messages, progress notes and permission prompts (tool name, description and a preview of the command). It never sees code, files or anyone's Claude conversation. If you deploy it to Cloudflare, that data is in your own D1 database. There is no telemetry.

## Reporting a vulnerability

Please open a GitHub security advisory on this repository rather than a public issue.
