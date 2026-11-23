<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 1: Performance

This is the BASELINE step of an optimization run, before anything changes. Do not edit any file. Measure the current behaviour for real: run the actual command, record the exact command line and the numbers it produced, and repeat it enough that you can say whether the difference is signal. Then identify the ACTUAL bottleneck from that evidence rather than from reading the code and guessing — name the file and function, and say what fraction of the cost sits there. Write the exact measurement command down verbatim in your report: the Review step re-runs YOUR command to prove the change worked, so an approximate command makes the whole run unfalsifiable. Architect designs the fix from your findings next.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
