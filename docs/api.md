# Hub API

JSON over HTTP. Every `/v1/` request needs `Authorization: Bearer <token>`. Requests also count as the member's presence (`online` on the board, and a `member_online` event after 90 seconds away), unless they send `X-Coop-Presence: off`, as the CLI does. Errors come back as `{"error": "..."}` with a fitting status code (400 bad input, 401 bad token, 403 not allowed for your role, 404 not found, 409 conflict or wrong state).

| Method and path | Who | What |
| --- | --- | --- |
| `GET /health` | anyone | `{ok, hub, version}`, no token needed |
| `GET /v1/me` | all | `{name, role, hub, version, lead, latest_event_id}` |
| `GET /v1/board` | all | Members (with `online`, `last_seen`, `working_on`), active tasks, the last 5 done, and the last 15 visible events |
| `GET /v1/events?after=ID&limit=N` | all | Events after `ID` visible to you, not counting your own, plus the `cursor` to pass next time |
| `GET /v1/tasks?status=S&limit=N` | all | Tasks, newest first |
| `GET /v1/tasks/:id` | all | `{task, history}` |
| `POST /v1/tasks` | lead | Create: `{title, details?, to?, scope?, priority?, branch?}` |
| `POST /v1/tasks/:id/:action` | depends | See below. Body: `{note?, to?, branch?, pr_url?}` |
| `POST /v1/messages` | all | `{text, to?, task_id?}`. `to` is a member name, `"lead"`, or empty for everyone |
| `POST /v1/members` | lead | Invite: `{name}` returns `{name, token, rotated}` |
| `DELETE /v1/members/:name` | lead | Remove a worker; their held tasks go back to the pool |
| `POST /v1/permissions` | worker | Relay a permission prompt: `{request_id, tool_name, description, input_preview}` |
| `POST /v1/permissions/verdict` | lead | Answer one: `{worker, request_id, behavior: "allow" or "deny"}` |

## Task actions

| Action | Who | From | To | Note |
| --- | --- | --- | --- | --- |
| `claim` | anyone | open, or assigned to you | in_progress | |
| `progress` | assignee or lead | assigned, in_progress, blocked | in_progress | required |
| `block` | assignee or lead | assigned, in_progress | blocked | required |
| `submit` | assignee or lead | in_progress, blocked | review | required (the summary); `branch`, `pr_url` optional |
| `release` | assignee or lead | assigned, in_progress, blocked | open | |
| `approve` | lead | review | done | |
| `changes` | lead | review, done | in_progress | required (the feedback) |
| `assign` | lead | any active | assigned (with `to`) or open | |
| `cancel` | lead | any active | cancelled | |
| `reopen` | lead | done, cancelled | assigned (with `to`) or open | |
| `comment` | anyone | any | unchanged | required |

## Events

`{id, ts, type, actor, actor_role, target, task_id, text, data}`. `target` is null for events everyone may see, or a member name. Workers see events with no target or targeted at them; the lead sees all. Task events carry the task's `title`, `status`, `assignee`, `priority`, `scope`, `branch` and `pr_url` in `data`, plus `previous_status` and `previous_assignee`.

Types: `member_online`, `member_invited`, `member_token_rotated`, `member_removed`, `task_created`, `task_assigned`, `task_claimed`, `task_progress`, `task_blocked`, `task_submitted`, `task_approved`, `task_changes_requested`, `task_released`, `task_cancelled`, `task_reopened`, `task_comment`, `message`, `permission_request`, `permission_verdict`.
