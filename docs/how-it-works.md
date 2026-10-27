# How it works

claude-code-multi-pc has three parts:

| Part | Runs on | Job |
| --- | --- | --- |
| **Hub** | A Cloudflare Worker, or any PC with Node | The crew list, the task board and an event log, behind a small JSON API. It holds no code. |
| **coop MCP server** | Every crew member's PC, started by Claude Code | Gives Claude the `coop_*` tools, polls the hub, and pushes relevant events into the session as a Claude Code [channel](https://code.claude.com/docs/en/channels-reference). |
| **coop CLI** | Every crew member's PC | `coop join` saves your hub URL and token in `~/.claude-coop`, and `coop start` launches Claude Code with the server loaded as a channel. |

Code never goes through the hub. It moves through your git remote: every task has its own branch, and workers push it and open a pull request.

## Why channels

A normal MCP server only answers when Claude calls it, so an idle worker would never notice a new task. A **channel** is an MCP server that can push messages into a running session. The message shows up in Claude's context as

```
<channel source="coop" event="task_created" from="lead-name" from_role="lead" task_id="12">
[lead lead-name] New task for you: #12 "Add CSV export" ...
</channel>
```

and Claude starts working on it, the same way the official Telegram and Discord channels work. The session sits idle and uses nothing until something arrives.

During the research preview, Claude Code only loads channels from Anthropic's allowlist without asking. That's why `coop start` passes `--dangerously-load-development-channels server:coop` and Claude Code shows a confirmation at startup.

## Events

Everything that happens is an event in the hub's log: task created, assigned, claimed, progress, blocked, submitted, approved, changes requested, released, cancelled, reopened, comments, messages, members coming online, and permission requests and answers.

Each MCP server polls `GET /v1/events?after=<cursor>` every 8 seconds (20 when nothing has happened for 5 minutes, 2 while a permission request is open). It keeps its cursor in `~/.claude-coop/state/`, so a restart doesn't replay old events. Then it decides what to push:

| Who | Gets pushed |
| --- | --- |
| Lead | Everything the workers do: online, claims, progress, blocks, submissions, releases, messages, permission requests |
| Worker | Tasks assigned to it, open tasks anyone may claim, feedback, approvals and cancellations of its own tasks, approvals of others' work (so it pulls before the next change), messages to it or to everyone |

Events that arrive together go out as one batched push, so an idle Claude wakes up once rather than once per event.

## Task states

```
            assign                claim               submit
  open ──────────────► assigned ─────────► in_progress ─────────► review ──approve──► done
   ▲  ◄──── release ──────┘                  │   ▲  ▲               │
   │                                   block │   │  └── changes ────┘
   │                                         ▼   │ progress
   │                                       blocked
   └──── release / remove member ─────────────┘
  cancel: any active state ─► cancelled        reopen: done or cancelled ─► open / assigned
```

- Only the lead creates, assigns, reviews, cancels and reopens tasks.
- A worker can claim an open task or one assigned to it. Two workers claiming the same open task is safe: the hub updates atomically, so one wins and the other gets a clear error.
- Every change is checked against the state it was read in, so two people acting at once can't overwrite each other.

## Reliability

Channel pushes are best effort: Claude Code doesn't acknowledge them. claude-code-multi-pc doesn't depend on any one push arriving:

- The hub is the source of truth. `coop_status` always shows the real board.
- A worker started with `coop start` begins by checking the board for work assigned to it.
- Every 5 minutes, an idle worker that has unclaimed work assigned to it, or open tasks waiting, gets a reminder (at most 3 per task).
- When the lead's session starts, it hears what's waiting for review or blocked.
- Sessions without channels can still work through `coop_inbox` (with `wait_seconds`).

## Presence

The MCP server's requests count as a heartbeat, and it polls all the time. One-off CLI commands (`coop join`, `status`, `doctor` and so on) don't count, so they don't make anyone look online. A member counts as online if their Claude session reached the hub in the last 90 seconds. Someone coming back after being away creates a `member_online` event, which the lead hears about.

## Permission relay

A worker's channel declares Claude Code's `claude/channel/permission` capability. When Claude Code would show a permission prompt on the worker's PC, it also sends it to the coop server, which forwards it to the hub. The lead's Claude shows it to the lead's user, and their answer (`coop_permission`) travels back the same way. The prompt stays open on the worker's PC the whole time, and whichever answer arrives first wins. Turn it off with `coop start --no-relay`.
