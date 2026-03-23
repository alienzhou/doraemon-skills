# Trigger Strategy: Agent Autonomous + Stop Hook Fallback

**Decision Time**: #R4
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Need to determine when and how to trigger Git commits as checkpoints during AI Agent coding sessions.

### Constraints
- Cursor only has `stop` hook, no `on-file-edit` hook
- Hook scripts cannot invoke AI to generate content
- Commit messages need semantic richness (intent + change description), not just templates

---

## 🎯 Objective

Ensure every meaningful edit is committed with a semantic commit message, without relying on hook entry points that don't exist.

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| 1. Hook forced | Hook triggers commit after every edit | Guaranteed coverage | No edit hook in Cursor; hook can't call AI for message | ❌ |
| 2. Agent autonomous | Skill instructs Agent to commit at meaningful points | AI generates rich semantic messages; flexible timing | Agent may forget/skip | ✅ |
| 3. Stop hook fallback | Stop hook checks for uncommitted changes | Catches anything Agent missed | Only runs at conversation end | ✅ (complement) |

---

## ✅ Final Decision

### Chosen Solution
**Combination of Solution 2 + Solution 3**

- **Primary**: Skill guides Agent to autonomously commit after meaningful edits
- **Safety net**: Stop hook detects uncommitted changes and reminds Agent to commit

### Decision Rationale
- Only Agent (via Skill) can generate semantically rich commit messages
- Hook scripts are limited to fixed logic (check git status, output reminder text)
- Combining both ensures coverage without sacrificing message quality

### Expected Outcome
- Every meaningful edit gets a semantic Git commit
- No silent data loss from uncommitted changes
- Users see clear, understandable commit history

---

## ❌ Rejected Solutions

### Solution 1: Hook Forced
- **Rejection Reason**: Cursor lacks edit hook; even with Claude Code's PostToolUse, hook scripts cannot call AI to generate meaningful commit messages
- **Reconsideration**: If platforms add AI-capable hooks in the future
