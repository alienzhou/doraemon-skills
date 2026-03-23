<!-- [ABC:agent-better-checkpoint:start] -->
## Checkpoint Commit Rule

After completing any file edit (write_to_file, replace_in_file, multi_replace_in_file, or similar),
you MUST:

1. Load the "agent-better-checkpoint" skill (if not already loaded)
2. Follow its instructions to create a checkpoint commit
3. Do NOT proceed to the next task until the commit is done

This ensures every meaningful code change is tracked with a semantic Git commit.

## Release Checklist (maintainers)

Before publishing a new version, you MUST run:

- `npm run release:check`

And ensure:

- `platform/unix/checkpoint.sh` and `.vibe-x/agent-better-checkpoint/checkpoint.sh` are in sync
- `CHANGELOG.md` has an entry for the target version
- Git working tree is clean

(These are enforced by `release:check` to reduce missed updates.)
<!-- [ABC:agent-better-checkpoint:end] -->
