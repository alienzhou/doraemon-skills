# Response Depth Enhancement

**Decision Time**: #R10, #R11  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

User feedback indicated that responses in discussion mode were too simple, lacking:
- Solution analysis when presenting options
- Trade-off explanations
- Relevant experience and case references

### Constraints

- Should not make the Skill too verbose
- Need practical, actionable guidance
- Must be teachable through prompt engineering

---

## 🎯 Objective

Improve discussion depth by adding structured guidance for:
1. Role-based approaches to discussion
2. Problem type differentiation
3. Discussion-first behavior

---

## 📊 Gap Analysis

Comparison between reference template and original Skill:

| Depth Element | Reference Template | Original Skill | Gap |
|---------------|-------------------|----------------|-----|
| Three Roles | Socratic, Devil's Advocate, Connector | ❌ Missing | Critical |
| Problem Types | Factual/Design/Open strategies | ❌ Missing | Critical |
| Discussion-First | Ask before outputting | ❌ Missing | Critical |
| Discussion Process | 4-phase approach | ❌ Missing | Nice-to-have |
| Best Practices | Examples and patterns | ⚠️ Brief | Enhanced |

---

## ✅ Final Decision

### Chosen Solution

Add three key elements to the merged Skill:

### 1. Three Roles Definition

| Role | Function | Example |
|------|----------|---------|
| **Socratic Questioner** | Clarify ideas through questioning | "You mentioned X, could you elaborate?" |
| **Devil's Advocate** | Challenge assumptions | "Are you sure this is the only solution?" |
| **Knowledge Connector** | Link related concepts | "This reminds me of the X pattern..." |

**Key insight**: The Devil's Advocate role is essential for depth - it prevents the agent from simply agreeing with everything.

### 2. Problem Type Differentiation

| Problem Type | Strategy |
|--------------|----------|
| Factual | Answer directly |
| Design/Decision | Guide thinking, analyze tradeoffs |
| Open-ended | Challenge assumptions, explore alternatives |

### 3. Discussion-First Principle

When user says "Help me write..." or "Generate...":
- ❌ Don't output multiple versions immediately
- ✅ Ask clarifying questions first
- ✅ Understand intent before producing output

### Decision Rationale

1. Role-based thinking provides clear behavioral guidance
2. Problem type differentiation prevents one-size-fits-all responses
3. Discussion-first prevents wasted rounds of guessing

### Implementation

Created new merged Skill at `skills/discuss-mode/SKILL.md` containing:
- Three Roles section with examples
- Problem Types table with strategies
- Discussion-First Principle with ❌/✅ patterns

### Expected Outcome

- More thoughtful, analytical responses
- Better challenge of assumptions
- Fewer wasted rounds from guessing

---

## 🔗 Related Links

- [D01-skill-architecture.md](./D01-skill-architecture.md) - New merged Skill structure
