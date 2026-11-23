<!-- managed by TeamX (workflow-skills v3). TeamX updates this file; local edits are overwritten. -->

# Step 3: Dev

This is an OPTIMIZATION. The Performance step measured a baseline and named the actual bottleneck; the Architect step designed the fix. Implement exactly that — do not optimize anything else you notice along the way, however tempting, because an unmeasured change cannot be shown to have helped. Do not trade away correctness, clarity, or maintainability for speed without saying so explicitly in your report and explaining the trade. Preserve existing behaviour exactly: an optimization that changes results is a regression. Reuse the repo's existing patterns. The Review step re-runs the Performance step's exact baseline command to prove the improvement, so leave the working tree holding only this change. Do not open a PR or push — the Release step owns git.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
