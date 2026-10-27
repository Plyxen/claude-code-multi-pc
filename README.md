# claude-code-multi-pc

**Run Claude Code across multiple PCs and multiple Claude accounts, as one team.** Your Claude is the lead. Your friends' Claudes, each on their own PC and their own Claude account, are the crew: they take tasks from your Claude, do them, and report back, while your friends get on with something else. Co-op mode for Claude Code, run with the `coop` command.

It isn't an account switcher. Every Claude stays on its own computer, signed in to its own person's account, and they work on one project together: from two PCs up to nine.

```
        YOUR PC                                                FRIENDS' PCs
 ┌────────────────────┐        ┌───────────────────┐       ┌────────────────────┐
 │  Claude Code       │        │       hub         │       │  Claude Code       │
 │  (lead)            │◄──────►│  task board,      │◄─────►│  (worker: anna)    │
 │  assigns, reviews, │        │  crew, messages   │       │  claims, codes,    │
 │  answers questions │        │  Cloudflare Worker│       │  pushes, submits   │
 └────────────────────┘        │  or your own PC   │       └────────────────────┘
                               └───────────────────┘       ┌────────────────────┐
              code moves through git: one branch           │  (worker: bob) ... │
              and pull request per task                    └────────────────────┘
```

- **One lead, up to 8 workers.** Built for 2 to 5 friends: one lead Claude and one to four workers.
- **Hands-free workers.** New tasks are pushed straight into the worker's running Claude Code session ([channels](https://code.claude.com/docs/en/channels)), so it starts on its own. Your friend can minimize the window and game, browse or work on something else. It doesn't take over the mouse or the screen.
- **Everyone sees what's happening.** The lead hears every claim, progress note, question and submission as it happens. Workers hear about tasks for them, open tasks they could take, and finished work they should pull. `coop status` shows the whole board.
- **Git does the code.** Each task gets its own branch (`coop/12-add-csv-export`). Workers push it and open a pull request, and the lead reviews it before anything is merged.
- **Your friend stays in charge of their PC.** Workers keep to the project folder and the project's rules, and can't deploy or touch secrets. Anything Claude Code would ask permission for can be forwarded to the lead's user to answer.

> claude-code-multi-pc is a community project. It is not made or endorsed by Anthropic.

## How a task flows

1. You tell your Claude what you want. It splits the work into tasks with `coop_assign`, either for a named worker or open for whoever is free.
2. The task is pushed into the worker's session. Their Claude claims it, branches off the latest `main`, does the work, runs the checks, pushes and opens a pull request.
3. The worker's Claude calls `coop_submit`. Your Claude is told, reads the diff and runs the tests, then approves it or sends it back with feedback.
4. Questions go both ways with `coop_send`. If a worker is stuck, it marks the task blocked and your Claude (or you) answers.

## Requirements

- [Claude Code](https://code.claude.com/docs/en/quickstart) 2.1.80 or newer on every PC. Each person signs in with their own claude.ai account (Pro or Max) or a Console API key. On Team and Enterprise plans an admin has to [enable channels](https://code.claude.com/docs/en/channels#enterprise-controls).
- [Node.js](https://nodejs.org) 22.13 or newer.
- A git repository everyone can push branches to (GitHub, GitLab or anything else), plus the [GitHub CLI](https://cli.github.com) if you want pull requests.
- A hub everyone can reach: a free Cloudflare Worker (recommended), or the lead's own PC.

## Quick start

### The lead (you)

```bash
npm install -g github:Plyxen/claude-code-multi-pc
```

Set up a hub. The quickest test is one on your own PC:

```bash
coop hub --lead-name yourname --crew my-crew
```

It prints a lead token and the `coop join` line to run next. For friends on other networks, deploy the hub to Cloudflare instead ([docs/deploy-cloudflare.md](docs/deploy-cloudflare.md), about 5 minutes and free), or open your PC's hub through a tunnel ([docs/self-hosting.md](docs/self-hosting.md)).

```bash
coop join --hub <hub url> --token <lead token>
coop invite anna        # prints the steps to send anna; the token in them is a password, so DM it
cd path/to/your/project
coop start              # your lead Claude, connected to the crew
```

Then just talk to your Claude: *"Split the export feature into tasks for anna and bob."*

### Each friend

```bash
npm install -g github:Plyxen/claude-code-multi-pc
coop join --hub <hub url> --token <their token>
cd path/to/their/clone/of/the/project
coop start
```

Claude Code starts and shows two prompts the first time: trust the folder, and confirm the development channel (claude-code-multi-pc isn't on Anthropic's channel allowlist during the research preview). Press Enter on both, then minimize the window. Full guide: [docs/worker-setup.md](docs/worker-setup.md).

Everyone updates later with `coop update`.

## What each Claude gets

| Lead tools | Worker tools | Both |
| --- | --- | --- |
| `coop_assign`: create a task | `coop_claim`: take a task | `coop_status`: the board |
| `coop_review`: approve or send back | `coop_progress`: note a milestone, or blocked | `coop_task`: one task in full |
| `coop_manage_task`: reassign, cancel, reopen, comment | `coop_submit`: hand in for review | `coop_send`: message someone or everyone |
| `coop_invite`, `coop_remove`: the crew | `coop_release`: give a task back | `coop_inbox`: updates, for sessions without channels |
| `coop_permission`: answer a worker's permission prompt | | |

## Docs

- [How it works](docs/how-it-works.md): hub, channels, events, task states, reliability
- [Lead guide](docs/lead-guide.md): running a crew, writing good tasks, reviewing
- [Worker setup](docs/worker-setup.md): the page to send your friends
- [Project setup](docs/project-setup.md): the CLAUDE.md section and git workflow that make co-op smooth
- [Deploy the hub to Cloudflare](docs/deploy-cloudflare.md) · [Self-host the hub](docs/self-hosting.md)
- [Security](docs/security.md): what a worker can and can't be asked to do, and the knobs
- [Troubleshooting](docs/troubleshooting.md)
- [Hub API](docs/api.md)

## Status

Version 0.1, early but tested: the hub, CLI and channel server have an end-to-end test suite (`npm test`). Channels are a Claude Code research preview, so the launch flags may change as Anthropic updates them. Issues and pull requests are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
