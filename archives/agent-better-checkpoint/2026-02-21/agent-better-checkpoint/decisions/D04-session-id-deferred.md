# Session ID: Deferred from MVP

**Decision Time**: #R11
**Status**: ⏸️ Deferred
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Session ID would link all checkpoints from the same conversation, enabling queries like "show me all commits from this coding session".

### Constraints
- Cursor exposes `conversation_id` in hook stdin, but only accessible to hook scripts (not to AI-invoked commit scripts)
- Claude Code does not explicitly expose `session_id` in hook stdin
- Self-generated UUID approach adds complexity for uncertain value in MVP

---

## 🎯 Objective

Determine whether Session ID should be in MVP trailer fields.

---

## ✅ Final Decision

### Chosen Solution
**Defer Session ID from MVP. Revisit after core flow is validated.**

### Decision Rationale
1. Core value (transparent Git checkpoints) does not depend on Session ID
2. Platform support is inconsistent (Cursor has it, Claude Code unclear)
3. Checkpoint commits are naturally sequential in git log — Session ID filtering is a nice-to-have, not essential
4. Reduces MVP complexity

### Reconsideration Conditions
- When multi-session workflows become a real user need
- When platform hook APIs stabilize and consistently expose session IDs
- When Cursor's `afterFileEdit` hook exits beta

---

## 🔗 Related Links

- [Platform Hook Research](../notes/platform-hook-research.md)
- [D03 - Commit Message Format](./D03-commit-message-format.md)
