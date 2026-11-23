<!-- managed by TeamX (workflow-skills v1). TeamX updates this file; local edits are overwritten. -->

# Step 1: Debugger

This step is read-only: you must not edit files.

This is the triage step of an ACTIVE INCIDENT. Your ONLY job is to find out what is failing right now and how far it reaches — do NOT edit any file. Speed matters more than completeness: establish the blast radius (what is broken, for whom, since when), find the most recent change that could plausibly have caused it, and identify the smallest reversible action that would restore service. Preserve evidence as you go — quote the logs, errors, and timestamps you relied on, because they will be gone by the time anyone writes the post-incident record. Finish with a clear recommendation: revert, patch forward, or disable. The Security step reads your findings next, then Dev acts on them.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
