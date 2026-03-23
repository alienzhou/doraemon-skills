# Design Principle: Intelligence vs Process Separation

**Decision Time**: #R5  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
A critical concern was raised: **If we add too many procedural instructions to the Agent, will it reduce its intelligence?**

The Agent's primary role is to facilitate discussion, which requires cognitive resources for:
- Understanding user problems
- Analyzing solutions
- Guiding conversation
- Making decisions

If the Skill instructions are filled with procedural requirements (update meta.yaml, check rounds, trigger reminders, etc.), the Agent's attention may be diverted from its core thinking tasks.

### Constraints
- Agent's cognitive resources are finite (context window, attention)
- Need reliable automation for procedural tasks
- Must maintain discussion quality

---

## 🎯 Objective

Design a clear separation between "intelligence work" and "process work" to ensure the Agent focuses on high-value discussion facilitation while automating mechanical tasks.

---

## 📊 Cognitive Load Analysis

```
┌─────────────────────────────────────────────────────────┐
│  Model's Context Window                                  │
│  ═══════════════════════════════════════════════════     │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │  Skill Instructions│  │  Conversation History        │ │
│  │  ──────────────   │  │  ────────────────────────    │ │
│  │  Process reqs ████│  │  User questions              │ │
│  │  Process reqs ████│  │  Discussion context          │ │
│  │  Process reqs ████│  │  Decision background         │ │
│  │  Discussion ░░░░░░│  │  Solution analysis           │ │
│  └──────────────────┘  └──────────────────────────────┘ │
│                                                          │
│  Too much process → Attention diverted → Lower quality  │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Final Decision

### Design Principle

**Agent handles intelligence work, Hooks handle process work.**

| Type | Handler | Examples |
|------|---------|----------|
| **Intelligence Work** | Agent | Understanding problems, analyzing solutions, guiding discussion, judging consensus |
| **Process Work** | Hook | Round counting, state checking, timeout reminders, meta.yaml updates |

### Rationale

1. **Focus cognitive resources**: Agent Skill instructions become concise, focusing on discussion strategy
2. **Reliable automation**: Procedural tasks handled by scripts that won't forget
3. **Clear responsibilities**: Easy to debug and maintain

### Skill Instruction Comparison

**❌ Without Separation** (Agent burdened):
```
"Your task is to facilitate deep discussion.
 At the end of each round you MUST:
 1. Update meta.yaml round count
 2. Check for new confirmed decisions
 3. Create decision documents if any
 4. Update problem list status
 5. Calculate trends...
 ..."  ← Agent becomes an "accountant"
```

**✅ With Separation** (Agent focused):
```
"Your task is to facilitate deep discussion.
 When you believe a point has reached consensus,
 mark it as 'Confirmed'. Focus on understanding
 the problem and guiding toward clear decisions."
```

Hooks handle the rest automatically.

---

## 📊 Responsibility Matrix

| Responsibility | Assigned To | Reason |
|----------------|-------------|--------|
| Round counting | ✅ Hook | Pure mechanical, +1 every round |
| meta.yaml updates | ✅ Hook | Structured data maintenance |
| Precipitation checks | ✅ Hook | Can detect "confirmed but no doc" via script |
| Timeout reminders | ✅ Hook | Can calculate round difference |
| Trend calculation | ✅ Hook | Statistical problem count changes |
| Judge "consensus reached" | ❌ Agent | Requires semantic understanding |
| Decide "when to converge" | ❌ Agent | Requires judgment |
| Outline structure design | ❌ Agent | Requires organizational ability |

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hooks miss edge cases | Medium | Medium | Comprehensive testing, fallback prompts |
| Agent ignores Hook prompts | Low | High | Design clear, actionable Hook messages |
| Over-automation reduces flexibility | Low | Medium | Keep Agent judgment for critical decisions |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R5 | 2026-01-17 | Established intelligence vs process separation | User concern about cognitive load |

---

## 🔗 Related Links

- [Decision 04: Precipitation Detection Mechanism](./04-precipitation-detection-mechanism.md)
- [Decision 05: Reminder Mechanism](./05-reminder-mechanism.md)
- [Decision 06: Global Configuration Mechanism](./06-global-configuration-mechanism.md)
