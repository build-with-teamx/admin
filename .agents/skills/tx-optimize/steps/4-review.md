<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 4: Review

Review the optimization on disk and PROVE it. Re-run the exact baseline command the Performance step recorded, and report its before and after numbers side by side — if that command is missing or no longer runs, that is needs-fix, because an unmeasured optimization cannot be accepted. Report a clear verdict (pass / needs-fix): needs-fix if the target metric did not move materially, if correctness or existing behaviour regressed, or if the change traded away maintainability without that trade being stated. Run any relevant existing tests. Do not edit files in this review step and do not restate the diff.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
