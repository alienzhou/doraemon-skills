# Branch Strategy: Deferred from MVP

**Decision Time**: #R13
**Status**: ⏸️ Deferred
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
When running parallel Agent conversations, multiple Agents may write files and create commits in the same Git repository simultaneously, causing interference.

### Possible Approach
Each parallel Agent conversation runs on an isolated Git branch (e.g., `checkpoint/session-xxx`), merged back to main when done.

### Why Deferred
1. MVP focuses on single-conversation scenario — already a major improvement over current black-box checkpoints
2. Parallel task usage is an advanced scenario, not the common case
3. Branch management introduces significant complexity (creation, merging, conflict resolution, naming conventions)
4. Better to validate core flow first, then layer on branch isolation

### Reconsideration Conditions
- Users report parallel session conflicts as a real pain point
- Core MVP flow is stable and validated

---

## 🔗 Related Links

- [D04 - Session ID Deferred](./D04-session-id-deferred.md) (branch strategy and session ID are related — both needed for full parallel support)
