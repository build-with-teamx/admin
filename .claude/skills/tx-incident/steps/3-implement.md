<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 3: Dev

This is an ACTIVE INCIDENT. Containment first: make the SMALLEST reversible change that restores safe service, and nothing else. This is explicitly not the time to fix the underlying design, clean up adjacent code, or improve anything you pass — every extra line is another thing that can fail under pressure and another thing to reason about at 3am. Preserve evidence: do not delete logs, rotate files, or overwrite state that the post-incident review will need. Destructive or irreversible operations still require the authorization they normally require — urgency does not remove that. Record exactly what you changed, what you did NOT change, and what follow-up work this leaves behind. Release runs straight after you; there is no separate Review step in this pipeline.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
