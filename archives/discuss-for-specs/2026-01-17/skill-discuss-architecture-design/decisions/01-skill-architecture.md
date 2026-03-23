# Skill Architecture

**Decision Time**: #R3-R4  
**Status**: ⚠️ SUPERSEDED  
**Superseded By**: [D07: Skill Architecture Merge](./../../../2026-01-28/discuss-mode-optimization/decisions/D01-skill-architecture.md) (2026-01-28)  
**Related Outline**: [Back to Outline](../outline.md)

> **⚠️ UPDATE (2026-01-28)**: This decision has been superseded. The 2-Skill architecture 
> (`discuss-coordinator` + `discuss-output`) has been merged into a single `discuss-mode` Skill.
> See the updated decision for details.

---

## 📋 Background

### Problem/Requirement
The existing Claude Skills implementation has 6 separate disc-* Skills (coordinator, doc-writer, file-manager, outline-renderer, problem-tracker, trend-tracker). We need to determine whether to maintain this granular split or merge them for the Cursor implementation.

### Constraints
- Must balance between:
  - Single Skill: Simpler, centralized context, but potentially bloated
  - Multiple Skills: Clear responsibilities, independently iterable, but increased invocation complexity
- Need to avoid going from one extreme to another

---

## 🎯 Objective

Design a Skill architecture that:
- Maintains clear separation of concerns
- Reduces unnecessary complexity
- Facilitates future iteration and maintenance

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| Single Skill | Merge all 6 Skills into one | Simple, centralized | Potentially bloated | ❌ |
| Keep 6 Skills | Maintain current structure | Fine-grained | Too complex | ❌ |
| **2-Skill Split** | Coordinator + Output | **Balanced, clear** | - | ✅ |
| 3-Skill Split | Coordinator + Tracker + Output | Very clear | Trend-tracker too narrow | ❌ |

---

## ✅ Final Decision

### Chosen Solution
**2-Skill Architecture**: Split into Coordinator Layer + Output Layer

**Layer 1: Coordinator (`discuss-coordinator`)**
- Process coordination
- Problem tracking
- Trend tracking
- Decision precipitation rules

**Layer 2: Output (`discuss-output`)**
- Outline rendering
- File management
- Document generation

### Decision Rationale
1. **Moderate merging**: Avoids extremes (1 vs 6 Skills)
2. **Clear boundaries**: "Brain" (thinking/tracking) vs "Hands" (output/files)
3. **Trend-tracker integration**: Too narrow for standalone Skill, better merged into coordinator
4. **Future maintainability**: Clear responsibilities facilitate iteration

### Expected Outcome
- Simpler invocation (2 Skills instead of 6)
- Maintained separation of concerns
- Easier to understand and extend

---

## ❌ Rejected Solutions

### Single Mega-Skill
- **Rejection Reason**: Would be too bloated (~1500+ lines), cognitive overload
- **Reconsideration**: If complexity proves overwhelming even with 2 Skills

### Keep 6 Skills
- **Rejection Reason**: Unnecessary complexity, file-manager and doc-writer overlap
- **Reconsideration**: If future features require finer granularity

### Trend-tracker as Standalone
- **Rejection Reason**: Scope too narrow, functionality too lightweight
- **Reconsideration**: If trend analysis becomes significantly more complex

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Coordinator becomes too heavy | Medium | Medium | Monitor complexity, split if needed in V2 |
| Skills lack clear boundaries | Low | High | Document clear responsibilities |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R3 | 2026-01-17 | Initial decision: 2-Skill architecture | Moderate merging approach |
| #R4 | 2026-01-17 | Rejected 3-Skill split | Trend-tracker too narrow |

---

## 🔗 Related Links

- [Decision 02: Skill Naming](./02-skill-naming.md)
- [Decision 03: Design Principle - Intelligence vs Process Separation](./03-intelligence-vs-process-separation.md)
