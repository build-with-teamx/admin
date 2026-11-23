---
name: tx-deep
description: "Deep work. Plan, build, check security and performance, review, then open a pull request. For large or risky work. TeamX workflow: Discovery → Architect → Dev → Security → Performance → Review → Release. Run only when the user invokes tx-deep."
argument-hint: <task>
disable-model-invocation: true
metadata:
  teamx-workflow: builtin:deep
  teamx-hash: 4dd5abb993ab0c45
  teamx-generator: 2
---
<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# TeamX deep

Deep work. Plan, build, check security and performance, review, then open a pull request. For large or risky work.

The request is the text the user typed with this command (in Claude Code: $ARGUMENTS). If it is empty, ask what to do and stop.

You are the orchestrator. You never do a step's work yourself, however small: each step below runs as its own fresh agent, in order, the way TeamX runs this workflow.

1. **Discovery** — `steps/1-discovery.md` (read-only: must not edit files)
2. **Architect** — `steps/2-architect.md` (read-only: must not edit files)
3. **Dev** — `steps/3-implement.md`
4. **Security** — `steps/4-security.md`
5. **Performance** — `steps/5-performance.md`
6. **Review** — `steps/6-review.md`
7. **Release** — `steps/7-release.md`

## How to run a step

Start a new agent for every step. Its prompt is the step file, then the request, then the earlier steps' reports. Run it in the foreground, wait for it to finish, and read only its final report before the next step.

- **Claude Code:** the Agent tool (subagent_type general-purpose), one call per step.
- **OpenCode:** the task tool, one call per step.
- **Antigravity:** your subagent tool. Without one, write the prompt to a temp file and run `agy -p --dangerously-skip-permissions < <prompt-file>` (read-only steps: `agy -p --mode plan < <prompt-file>`).
- **Codex:** write the prompt to a temp file and run a new `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -o <out-file> - < <prompt-file>` (read-only steps: `-s read-only` instead of the bypass flag; PowerShell: `Get-Content <prompt-file> -Raw | codex exec ...`). Read `<out-file>` for its report.

Your own job is only to coordinate: pass the request and the reports along, stop at approval gates, handle needs-fix and blocked, and write the final reply. A review step judges the changes on their own merits, not the earlier report.

## When a step says needs-fix or blocked

If a Review or Test step returns `needs-fix`, run the implement step once more with the findings, then that review step once more. Do this at most once.
If any step returns `blocked`, stop and tell the user exactly what they need to do.

## Finish

Reply to the user in a few plain sentences: what was done, the verdict, any blocker, and the pull request link if the release step ran.
