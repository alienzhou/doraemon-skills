# meta.yaml Programmatic Design

**Decision Time**: #R6, #R7  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

The original design required the AI agent to manually maintain `meta.yaml`, including:
- Topic name
- Decision tracking (id, title, status, confirmed_at, doc_path)
- Current round counting
- File status tracking

This created unnecessary burden on the agent and was error-prone.

### Constraints

- Agent should focus on discussion, not bookkeeping
- Round counting must be accurate
- Need to detect when user is in "discussion mode" vs not
- One conversation may edit outline multiple times, but should only increment round once

---

## 🎯 Objective

Make `meta.yaml` fully automated through Hooks, with zero agent responsibility.

---

## 📊 Solution Comparison

| Solution | Agent Responsibility | Hook Responsibility | Advantages | Disadvantages | Decision |
|----------|---------------------|---------------------|------------|---------------|----------|
| A: Agent-Driven | All fields | None | Simple hooks | Agent burden, error-prone | ❌ |
| B: Hybrid | topic, decisions | rounds, file_status | Balanced | Still requires agent attention | ❌ |
| C: Fully Automated | None | All fields | Zero agent burden | More complex hooks | ✅ |

---

## ✅ Final Decision

### Chosen Solution

**Fully automated meta.yaml through Hooks**

### Final Data Structure

```yaml
# meta.yaml - Fully maintained by Hooks

# Basic info (auto-derived from directory structure)
topic: "discuss-mode-optimization"  # From directory name
created: 2026-01-28                  # Auto-set on first creation

# Round management
current_round: 6                     # Current round number
# Rule: +1 per conversation where outline is updated (multiple edits = +1)

# Configuration
config:
  stale_threshold: 3                 # Remind if N rounds without update

# Decisions file tracking (auto-scanned from decisions/ directory)
decisions:
  - path: "decisions/D01-skill-merge.md"
    name: "D01-skill-merge.md"
    last_modified: "2026-01-28T01:30:00Z"
    last_updated_round: 5            # Which round updated this file

# Notes file tracking (auto-scanned from notes/ directory)
notes:
  - path: "notes/template-analysis.md"
    name: "template-analysis.md"
    last_modified: "2026-01-28T00:45:00Z"
    last_updated_round: 3
```

### Session Management

**Problem**: Hooks are stateless. How to know "same conversation" for round counting?

**Solution**: Temporary session files stored in global directory

```
~/.discuss-for-specs/sessions/
├── claude-code/
│   └── {sessionID}.json
└── cursor/
    └── {sessionID}.json
```

> **Note**: Sessions are stored globally (not per-project) because they are temporary and get deleted when conversation ends.

**Session file content**:
```json
{
  "session_id": "abc123",
  "started_at": "2026-01-28T01:30:00Z",
  "outline_updated": true,
  "outline_paths": [".discuss/2026-01-28/discuss-mode-optimization/outline.md"]
}
```

**Lifecycle**:
1. **Created**: When outline edit is first detected in a conversation
2. **Updated**: Records which outlines were updated
3. **Deleted**: When stop hook completes

### Trigger Mechanism

| Trigger | Hook | Action |
|---------|------|--------|
| Outline edited | file-edit | 1. Find corresponding meta.yaml<br>2. Record in session file<br>3. If first update in this conversation, current_round +1 |
| Decision edited | file-edit | Update decisions[] entry with last_updated_round |
| Notes edited | file-edit | Update notes[] entry with last_updated_round |
| Conversation ends | stop | 1. Check if session has outline updates<br>2. If yes, check round difference for decisions/notes<br>3. If exceeds threshold, emit reminder<br>4. Clean up session file |

### Discussion Mode Detection

The key insight: **Only check for stale files if outline was updated in current conversation**

- Outline updated → User is in discussion mode → Check decisions/notes staleness
- Outline not updated → User is not discussing → Skip all checks

### Decision Rationale

1. Agent should focus purely on thinking and content creation
2. All "accounting" work (counting, tracking, scanning) is mechanical
3. Session files solve the "same conversation" identification problem
4. Fully automated reduces errors and inconsistencies

### Expected Outcome

- Agent has zero meta.yaml maintenance burden
- Accurate round counting via session files
- Proper discussion mode detection
- Reliable stale file reminders

---

## ❌ Rejected Solutions

### Solution A: Agent-Driven
- **Rejection Reason**: Unnecessary burden, prone to forgetting or errors
- **Reconsideration**: If hooks become too complex to maintain

### Solution B: Hybrid
- **Rejection Reason**: Still requires agent attention for decisions tracking
- **Reconsideration**: If auto-scanning proves unreliable

---

## 🔗 Related Links

- [D02-directory-structure.md](./D02-directory-structure.md)
- [D04-hook-refactoring.md](./D04-hook-refactoring.md)
