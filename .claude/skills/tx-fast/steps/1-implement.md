<!-- managed by TeamX (workflow-skills v3). TeamX updates this file; local edits are overwritten. -->

# Step 1: Dev

This is a FAST-TRACK change — small and already decided, optimized for speed over process. Implement it directly on disk, end to end. Reuse the existing patterns, components, and utilities already in the repo. Keep the change tightly scoped to exactly what was asked — no extra polish, no unrelated cleanup. There is no separate Review step in this pipeline, so before you finish: re-read your own diff for obvious mistakes, and run a fast, targeted check if one is cheap (a relevant unit test, a type check) — do not run a full build or the whole test suite, that costs the speed this mode exists for. Do not open a PR or push — the Release step that runs next does that.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
