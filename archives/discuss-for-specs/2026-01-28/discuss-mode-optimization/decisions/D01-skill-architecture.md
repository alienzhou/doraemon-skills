# Skill Architecture: Merge and Template Separation

**Decision Time**: #R4, #R5  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

The current implementation splits discussion mode into two separate Skills:
- `discuss-coordinator/` - handles discussion facilitation and problem tracking
- `discuss-output/` - handles outline rendering and file management

This separation causes several issues:
1. Key modules (e.g., constraints, discussion-first principle) don't fit neatly into either
2. Content duplication between the two Skills
3. Information fragmentation reduces coherence

### Constraints

- Skills should be self-contained and coherent
- Templates should be maintainable and potentially reusable
- Main SKILL.md should not be excessively long

---

## 🎯 Objective

Create a unified, well-organized Skill structure that:
1. Contains all necessary principles and logic in one place
2. Separates templates for independent maintenance
3. Follows the reference template's module structure

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| A: Keep Separate | Maintain coordinator + output split | Each skill is smaller | Key modules hard to place, duplication | ❌ |
| B: Merge All Inline | Single SKILL.md with everything | Complete, no fragmentation | File too long (~15KB) | ❌ |
| C: Merge + Template Split | Single SKILL.md for logic, references/ for templates | Clean separation, maintainable | Requires extra reads for templates | ✅ |

---

## ✅ Final Decision

### Chosen Solution

**Merge into single Skill with template separation (Solution C)**

### New Structure

```
skills/
└── discuss-mode/
    ├── SKILL.md              # Main file (~8KB): principles + logic
    ├── headers/
    │   ├── claude-code.yaml
    │   └── cursor.yaml
    └── references/
        ├── outline-template.md
        ├── decision-template.md
        └── meta-schema.yaml
```

### Main SKILL.md Content

1. **Role Definition** - Three roles (Socratic Questioner, Devil's Advocate, Knowledge Connector)
2. **Problem Types** - Strategy table for different question types
3. **Discussion-First Principle** - Core philosophy (previously missing)
4. **Constraints** - Prohibited/Allowed actions (previously missing)
5. **Output Strategy** - No Duplication principle + response template
6. **Problem Tracking** - State definitions + consensus rules
7. **File Formats** - Directory structure (link to references for templates)
8. **Reminders** - 9 key points (previously missing)

### References Content

- `outline-template.md` - Complete outline.md template
- `decision-template.md` - Complete decision document template
- `meta-schema.yaml` - meta.yaml structure reference

### Decision Rationale

1. Reference template is a unified whole; splitting breaks coherence
2. Key principles (discussion-first) need to permeate the entire Skill
3. Templates are only needed at specific moments (creating files)
4. Separation allows templates to be updated independently

### Expected Outcome

- Coherent Skill that covers all necessary modules
- Reduced template loading overhead in normal conversations
- Easier maintenance and potential template reuse

---

## ❌ Rejected Solutions

### Solution A: Keep Separate
- **Rejection Reason**: Cross-cutting concerns (constraints, principles) don't belong to either skill
- **Reconsideration**: If Skills become too complex and need specialization

### Solution B: Merge All Inline
- **Rejection Reason**: 15KB+ file is unwieldy; templates rarely needed every turn
- **Reconsideration**: If template separation causes too many missed reads

---

## 🔗 Related Links

- [D02-directory-structure.md](./D02-directory-structure.md)
