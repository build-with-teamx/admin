<!-- managed by TeamX (workflow-skills v1). TeamX updates this file; local edits are overwritten. -->

# Step 1: Discovery

This step is read-only: you must not edit files.

This is the investigation step, ahead of any design or code change. Your ONLY job is to establish what exists today — do NOT edit any file. Start by locating the target in the repo from the user's own words (the app, package, route, or component they named) and say up front where it lives. Then report: what the current behaviour actually is, which files and functions own it, what would have to change, and what constrains that change (existing patterns, callers, data shape, tests). Be concrete and countable — "step 2 merges into step 1, 4 fields become 2, and 3 call sites read the old shape", not "simplify the wizard". Finish with the risks and the open questions a decision-maker would need answered. The step that runs next continues from your report on a different engine and can see nothing else, so write it for that reader.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
