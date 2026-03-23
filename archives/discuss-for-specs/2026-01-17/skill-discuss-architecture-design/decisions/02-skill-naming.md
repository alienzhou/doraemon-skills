# Skill Naming

**Decision Time**: #R8  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
After deciding on 2-Skill architecture, we need to determine naming conventions for both Skills.

### Constraints
- Should be consistent with existing Claude Skills naming
- Should clearly indicate responsibility
- Should be concise and memorable

---

## 🎯 Objective

Choose names that clearly communicate each Skill's role and responsibility.

---

## 📊 Solution Comparison

| Layer | Candidates | Rationale | Decision |
|-------|-----------|-----------|----------|
| **Coordinator Layer** | `discuss-coordinator` | Continues existing naming, semantically clear | ✅ |
| | `disc-core` | Generic, doesn't convey coordination aspect | ❌ |
| | `disc-discuss` | Too narrow, missing tracking/coordination | ❌ |
| **Output Layer** | `discuss-output` | More accurate (includes rendering + file management) | ✅ |
| | `disc-renderer` | Too narrow, missing file/doc management | ❌ |
| | `disc-writer` | Implies only writing, missing rendering | ❌ |

---

## ✅ Final Decision

### Chosen Solution
- **Coordinator Layer**: `discuss-coordinator`
- **Output Layer**: `discuss-output`

### Decision Rationale
1. **Coordinator**: 
   - Continues existing naming convention
   - "Coordinator" clearly indicates orchestration role
   - Recognizable from existing Claude Skills

2. **Output**:
   - Encompasses all output operations (render + write + manage)
   - More accurate than "writer" or "renderer" alone
   - Clear and concise

### Expected Outcome
- Clear role identification
- Easy for users to understand each Skill's purpose
- Consistent with existing ecosystem

---

## ❌ Rejected Solutions

### `disc-core` for Coordinator
- **Rejection Reason**: Too generic, doesn't convey coordination aspect
- **Reconsideration**: N/A

### `disc-renderer` for Output
- **Rejection Reason**: Too narrow, misses file management and doc generation
- **Reconsideration**: If responsibilities are later split

---

## 🔗 Related Links

- [Decision 01: Skill Architecture](./01-skill-architecture.md)
- [Decision 07: Project Directory Structure](./07-project-directory-structure.md)
