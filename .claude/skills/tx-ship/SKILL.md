---
name: tx-ship
description: "Release. Review what is already built on this branch and open its pull request. TeamX workflow: Review → Release. Run only when the user invokes tx-ship."
argument-hint: <task>
disable-model-invocation: true
metadata:
  teamx-workflow: builtin:ship
  teamx-hash: ec8ada2d3f26a7c1
  teamx-generator: 1
---
<!-- managed by TeamX (workflow-skills v1). TeamX updates this file; local edits are overwritten. -->

# TeamX ship

Release. Review what is already built on this branch and open its pull request.

The request is the text the user typed with this command (in Claude Code: $ARGUMENTS). If it is empty, ask what to do and stop.

You are the orchestrator. Run the steps below in order.

1. **Review** — `steps/1-review.md`
2. **Release** — `steps/2-release.md`

## How to run a step

If your tool can start a subagent (Claude Code: the Agent tool with general-purpose; OpenCode: the task tool; Antigravity: its subagent tool), run each step as its own fresh subagent. Its prompt is the step file plus the request plus the previous steps' reports.
Otherwise do the step yourself, following the step file, and keep the steps separate.
A review step must judge the changes on their own merits, not trust the earlier report.

## When a step says needs-fix or blocked

If a Review or Test step returns `needs-fix`, run the implement step once more with the findings, then that review step once more. Do this at most once.
If any step returns `blocked`, stop and tell the user exactly what they need to do.

## Finish

Reply to the user in a few plain sentences: what was done, the verdict, any blocker, and the pull request link if the release step ran.
