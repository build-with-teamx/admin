---
name: tx-ship
description: "Release. Review what is already built on this branch and open its pull request. TeamX workflow: Review → Release. Run only when the user invokes tx-ship."
argument-hint: <task>
disable-model-invocation: true
metadata:
  teamx-workflow: builtin:ship
  teamx-hash: 64a14102d500ddd2
  teamx-generator: 3
---
<!-- managed by TeamX (workflow-skills v3). TeamX updates this file; local edits are overwritten. -->

# TeamX ship

Release. Review what is already built on this branch and open its pull request.

The request is the text the user typed with this command (in Claude Code: $ARGUMENTS). If it is empty, ask what to do and stop.

You are the orchestrator. You never do a step's work yourself, however small: each step below runs as its own fresh agent, in order, the way TeamX runs this workflow.

1. **Review** — `steps/1-review.md`
2. **Release** — `steps/2-release.md`

## How to run a step

Start a new agent for every step. Its prompt is the step file, then the request, then the earlier steps' reports. Run it in the foreground, wait for it to finish, and read only its final report before the next step.

- **Claude Code:** the Agent tool (subagent_type general-purpose), one call per step.
- **OpenCode:** the task tool, one call per step.
- **Antigravity:** your subagent tool. Without one, write the prompt to a temp file and run `agy -p --dangerously-skip-permissions < <prompt-file>` (read-only steps: `agy -p --mode plan < <prompt-file>`).
- **Codex:** write the prompt to a temp file and run a new `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -o <out-file> - < <prompt-file>` (read-only steps: `-s read-only` instead of the bypass flag; PowerShell: `Get-Content <prompt-file> -Raw | codex exec ...`). Read `<out-file>` for its report.

Your own job is only to coordinate: pass the request and the reports along, stop at approval gates, handle needs-fix and blocked, and write the final reply. A review step judges the changes on their own merits, not the earlier report.

## Tell TeamX (when its tools are there)

If you have the TeamX tools (workflow_run_start, workflow_run_step, workflow_run_finish), report this run so the team can follow it. If you don't have them, skip this section and run the workflow anyway; never stop or ask because of it.

- Before step 1: workflow_run_start with workflow `tx-ship`, the request exactly as the person typed it, the repo (owner/name from `git remote get-url origin`), the branch, the repo folder, and the step labels in order ("Review", "Release"). Keep the run_id it returns.
- When each step starts (status running) and when it ends: workflow_run_step with its number, role, label, status (done, needs-fix, blocked or failed), a one or two sentence summary for a person (no code), files changed and the check it ran.
- At the end: workflow_run_finish with the outcome, a few plain sentences on what was done, and the pull request link if one was opened.

## When a step says needs-fix or blocked

If a Review or Test step returns `needs-fix`, run the implement step once more with the findings, then that review step once more. Do this at most once.
If any step returns `blocked`, stop and tell the user exactly what they need to do.

## Finish

Reply to the user in a few plain sentences: what was done, the verdict, any blocker, and the pull request link if the release step ran.
