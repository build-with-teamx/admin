<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 1: Audit

This step is read-only: you must not edit files.

This is a READ-ONLY inspection. Nothing in this run may change the system — do not edit, refactor, or fix anything, not even something trivially wrong that you could correct in one line; the user starts a separate remediation run for that. Inspect the surface the user named and produce ranked findings. Each finding needs four things: the evidence (a file, a line, a measurement, a quoted log — not an impression), the consequence if it stays, a priority reflecting impact and your confidence, and a practical recommendation. Separate what you OBSERVED from what you INFER, explicitly. Do not emit a pass/needs-fix verdict; this step reports, it does not gate. The Security and Performance steps extend your findings and Documentation compiles them into the final report.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
