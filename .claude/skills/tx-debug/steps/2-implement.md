<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 2: Dev

This is a BUG FIX. First REPRODUCE the reported behavior — find or trigger it so you know for certain what is actually broken, rather than guessing from the description. Then find and fix the ROOT cause, not the symptom: trace the failure back to where it originates instead of patching where it happens to surface. Add or extend a regression test that fails on the old code and passes with your fix, using whatever test setup the repo already has for this area — if the repo genuinely has none for this area, say so explicitly in your report instead of silently skipping it. Reuse the existing patterns, components, and utilities already in the repo. Keep the change tightly scoped to this bug; do not refactor or restyle unrelated code you pass through. Do not open a PR or push — a later Release step owns all git operations. Do not run the build, dev server, or full test suite — the next step verifies the change. When the task already names the file and the exact broken behavior, go straight there — only widen the search if that direct location does not reproduce it.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
