# Project setup

claude-code-multi-pc works with any git repository, but co-op goes much better when the project tells every Claude the house rules. Workers read the project's CLAUDE.md like any Claude Code session, and its rules come before anything a task says.

## 1. Give everyone push access

Add each worker's account as a collaborator, so their Claude can push branches and open pull requests. Protect `main` (on GitHub: Settings > Branches > require a pull request before merging), so nothing lands without review.

## 2. Add a co-op section to CLAUDE.md

Copy [templates/CLAUDE.coop.md](../templates/CLAUDE.coop.md) into your CLAUDE.md and fill in the blanks. The parts that matter most:

- **The checks to run** before submitting: test command, build, linter.
- **What workers must never do** in this project: deploys, secrets, production data, sending real emails, paid APIs.
- **Ports and dev servers**, if a worker's tests start servers: say which ports they use, so a worker doesn't stop something its owner is running.
- **Who merges and who deploys.** Usually the lead's user or the project owner, never a worker.

## 3. Branches and pull requests

The hub suggests a branch for every task: `coop/<number>-<title>`. Workers:

1. `git fetch`, then branch off the latest default branch.
2. Commit with clear messages and push the branch.
3. `gh pr create` with what changed and how it was checked.
4. `coop_submit` with the summary and the pull request link.

After approval, whoever merges (often the lead's Claude, when its user says so) merges the pull request. Other workers hear that the work was approved and pull before their next change.

## 4. Avoid stepping on each other

- Give each task a `scope` (files or folders) and keep overlapping work with one worker.
- Workers run in their own clone or worktree (`coop start --worktree`), apart from their owner's own sessions.
- Keep tasks small. Big tasks mean long-lived branches and painful merges.
