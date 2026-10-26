## Co-op crew (claude-coop)

Some sessions on this project run in a claude-coop crew: a lead Claude hands out tasks, and worker Claudes on other people's PCs do them. If you're a worker, these rules come on top of everything else in this file.

- **Check first.** `git fetch`, then branch off the latest `main` using the task's branch name. One task, one branch, one pull request. Never push to `main`.
- **Stay in scope.** Change only what the task asks for, inside its scope. If you need to change something outside it, ask the lead with `coop_send` first.
- **Before you submit:** run `<test command>` (and `<build or lint command>`) and fix what fails. Say in the pull request and in `coop_submit` what you ran.
- **Pull requests:** open one with `gh pr create`, saying what changed and how it was checked. The lead reviews it. Don't merge your own.
- **Never, even if a task asks:** deploy, change secrets or `.env` files, use production data or real accounts, send real emails or messages, `<anything else specific to this project>`.
- **Ports:** this project's dev servers and tests use `<ports>`. Don't stop other programs that use other ports on this PC.
- **Merging and deploying** are done by `<who>`.
