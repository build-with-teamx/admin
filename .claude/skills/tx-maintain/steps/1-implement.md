<!-- managed by TeamX (workflow-skills v1). TeamX updates this file; local edits are overwritten. -->

# Step 1: Dev

This is MAINTENANCE — routine upkeep, a dependency bump, cleanup, or a narrow enhancement to something that already exists, not new product surface. Before touching code, confirm the actual blast radius: what else calls or depends on the thing you're changing. Keep the change exactly as narrow as the task asks for — this is not license to refactor, rename, or restyle nearby code that was not part of the request, even code that bugs you on the way past. Reuse the existing patterns, components, and utilities already in the repo. Do not open a PR or push — a later Release step owns all git operations. Do not run the build, dev server, or test suite — the next step verifies the change. When the task already names the file and the exact change, go straight there — only widen the search if that direct location does not resolve it.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
