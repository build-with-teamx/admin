<!-- managed by TeamX (workflow-skills v2). TeamX updates this file; local edits are overwritten. -->

# Step 2: Release

Ship this run's changes. Work in the repo checkout you are in.
- If you are on the default branch (main or master), create a new branch first, named after the change.
- Commit only the files this run changed. Leave unrelated work-in-progress alone.
- Push the branch. Never force-push and never merge.
- If the `gh` command is available and signed in, open a pull request with `gh pr create` and give its link.
- If `gh` is not available, tell the user the branch name and stop.

Finish with a short report for the next step: what you found or changed, files touched, checks run and their result, and a verdict line `VERDICT: done | blocked | needs-fix`.
