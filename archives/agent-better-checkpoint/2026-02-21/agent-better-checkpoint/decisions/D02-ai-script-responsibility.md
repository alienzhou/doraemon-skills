# AI / Script Responsibility Split

**Decision Time**: #R5
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Commit messages need both semantic descriptions (human-readable) and structured metadata (machine-readable). Need to decide which component generates what.

### Constraints
- AI token usage should be minimized for non-creative content
- Structured metadata must be accurate (timestamps, session IDs, file lists)
- AI-generated structured data is unreliable compared to programmatic generation

---

## 🎯 Objective

Clear separation of concerns: AI handles what it's good at (understanding and describing), scripts handle what they're good at (accurate structured data).

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| AI generates everything | AI produces full commit message including metadata | Simple pipeline | Wastes tokens; metadata may be inaccurate | ❌ |
| Script generates everything | Script uses templates for all content | Accurate metadata; no AI cost | No semantic understanding; back to "black box" messages | ❌ |
| AI describes + Script appends metadata | AI writes title & body; Script appends trailers | Best of both worlds | Slightly more complex pipeline | ✅ |

---

## ✅ Final Decision

### Chosen Solution
**AI generates descriptive content; Script appends structured metadata**

- **AI responsibility**: Subject line (intent) + Body (change description, context)
- **Script responsibility**: Git trailers (Session-Id, Agent, Checkpoint-Type, Files-Changed, timestamp, etc.)

### Decision Rationale
1. Saves tokens — AI doesn't waste output on predictable structured fields
2. Accuracy — Programmatic metadata is always correct (file lists from git status, timestamps from system clock)
3. Plays to strengths — AI excels at summarization; scripts excel at precision

### Expected Outcome
- Commit messages that are both human-readable and machine-parseable
- Minimal token waste
- Reliable metadata for filtering and querying
