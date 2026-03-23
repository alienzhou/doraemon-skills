# Precipitation Detection Mechanism

**Decision Time**: #R6-R7  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
A critical question: **Scripts cannot understand semantics, so how can they mechanically detect "confirmed but no document"?**

The issue is that problem titles and document content don't have a 1:1 correspondence. Scripts can't understand whether content has actually been precipitated.

### Constraints
- Scripts lack semantic understanding
- Must be mechanically verifiable
- Agent should not be burdened with complex tracking

---

## 🎯 Objective

Design a structured annotation mechanism that allows scripts to mechanically detect which decisions lack documentation.

---

## 📊 Solution Design

### Core Approach: Structured Annotation + Script Checking

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Agent's Responsibility (Lightweight)                    │
│  ───────────────────                                     │
│  When confirming a decision, add a record to meta.yaml: │
│  - decision_id                                           │
│  - title                                                 │
│  - doc_path (can be null)                               │
│                                                          │
│                    ▼                                     │
│                                                          │
│  Hook/Script Responsibility (Mechanical)                 │
│  ─────────────────────────                               │
│  Check meta.yaml:                                        │
│  1. Which decisions have null doc_path                   │
│  2. Which doc_path files actually exist                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Final Decision

### Data Structure

**meta.yaml decision list**:

```yaml
# Discussion metadata
topic: skill-discuss-architecture
created: 2026-01-17
current_round: 6

# Decision sync status
decisions:
  - id: D1
    title: "Skill Granularity"
    status: confirmed          # confirmed | rejected
    confirmed_at: 3            # Round when confirmed
    doc_path: null             # ← null = not precipitated
    
  - id: D2
    title: "Recording Mechanism"
    status: confirmed
    confirmed_at: 5
    doc_path: "decisions/02-recording-mechanism.md"  # ← Has path = precipitated
```

### Detection Process

```
Hook Triggers (after each round)
        │
        ▼
┌───────────────────────┐
│  Read meta.yaml        │
│  Iterate decisions list│
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Check each decision:  │
│  1. doc_path is null?  │
│     → Mark "unprecipitated" │
│  2. doc_path not null? │
│     → Check file exists │
│     → Mark anomaly if missing │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Generate detection result │
│  - Unprecipitated: [D1, D3] │
│  - File missing: []     │
│  - Synced: [D2]        │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  If unprecipitated +   │
│  exceeds N rounds,     │
│  remind Agent          │
└───────────────────────┘
```

### Agent's Simple Operation

When confirming a decision:

```yaml
# Add record to meta.yaml
decisions:
  - id: D1
    title: "Skill Granularity"
    status: confirmed
    confirmed_at: 3
    doc_path: null    # ← Write null first
```

After creating document, update `doc_path`:

```yaml
    doc_path: "decisions/01-skill-granularity.md"
```

**This operation is simple and won't distract Agent's discussion focus.**

---

## 📊 Update Timing

**Q: When does Agent update doc_path?**

**Decision**: Update when creating document (one-step)

**Alternatives considered**:
- Option A: Update simultaneously with document creation ✅ **Chosen**
- Option B: Hook detects new document and auto-updates ❌ More complex

---

## 🔄 Outline Display (Optional)

In outline's "Confirmed" section, reflect this status:

```markdown
### ✅ Confirmed (2)

**📌 Skill Granularity** `#R3` → ⚠️ Pending Precipitation
- Adjusted to 2 Skills (Coordinator + Output)

**📌 Recording Mechanism** `#R5` → [See Details](./decisions/02-recording-mechanism.md)
- Hook-based, Agent focuses on discussion
```

The `⚠️ Pending Precipitation` marker can be auto-generated by Agent when rendering outline based on meta.yaml.

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agent forgets to update doc_path | Low | Medium | Hook reminder after threshold |
| meta.yaml corruption | Low | High | Backup before each update |
| File system sync issues | Low | Medium | Verify file existence in Hook |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R6 | 2026-01-17 | Established structured annotation approach | Script cannot understand semantics |
| #R7 | 2026-01-17 | Decided on simultaneous doc_path update | Simplicity |

---

## 🔗 Related Links

- [Decision 03: Intelligence vs Process Separation](./03-intelligence-vs-process-separation.md)
- [Decision 05: Reminder Mechanism](./05-reminder-mechanism.md)
