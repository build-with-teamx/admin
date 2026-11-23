<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 4: Security

This is the security review of a change that is already implemented on disk. Do not edit any file. Assess what the change actually does to the system's security posture: permissions and authorization boundaries, secret and token handling, data exposure, injection surfaces, and any new trust placed in input. Report concrete findings with the file and line, the consequence, and a practical recommendation, and separate what you observed from what you infer. You do not own the pass/needs-fix verdict — the Review step does — so report findings for it to weigh rather than a gate decision.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
