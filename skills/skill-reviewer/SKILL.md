---
name: skill-reviewer
description: Review Skill definition quality. Use when user asks to "review skill", "check skill quality", "validate skill", "lint skill", "review my skill", or wants to check if a Skill follows best practices. For execution trace analysis, use when user explicitly mentions "analyze execution", "review trace", or "evaluate execution process". Do NOT use for runtime debugging (use agent-debug skill), code review (use code-review skill), or general file validation.
version: 0.8.0
metadata:
  author: vibe-x-ai
  category: development-tools
  tags: [skill, review, validation, quality]
---

# Skill Reviewer

Review Skill definition quality against best practices.

## Default Mode: Definition Review

**CRITICAL**: When user says "review skill", ALWAYS default to **Definition Review** mode. Only switch to Execution Review when user **explicitly** mentions execution-related keywords.

**Default behavior**: Check the **Skill definition quality** (SKILL.md, structure, content).

**Execution Review**: Only when user **explicitly** mentions:
- "analyze execution"
- "review trace"
- "evaluate execution process"
- "执行过程评估"

| Mode | When to Use | Input |
|------|-------------|-------|
| **Definition Review** (Default) | "review skill", "check quality", "validate" | Skill folder path |
| **Execution Review** (Explicit) | "analyze execution", "review trace" | Execution trace + goal |

---

## Example

**User**: "Review my skill at ./my-skill/"

**Actions**:
1. Read folder structure: `ls -la ./my-skill/`
2. Check SKILL.md exists and parse YAML frontmatter
3. Run the checklist (S1-S4, F1-F5, C1-C12, T1-T3, plus SC1-SC8 if `scripts/` exists)
4. Generate review report

**Result**:
```
# 🔍 Skill Review: my-skill
| Category | ✅ Pass | ⚠️ Warn | ❌ Fail |
|----------|---------|---------|--------|
| Structure | 4 | 0 | 0 |
| Format | 5 | 0 | 0 |
| Content | 10 | 2 | 0 |
| Trigger | 3 | 0 | 0 |
| Scripts | N/A | N/A | N/A |
| **Total** | **22** | **2** | **0** |
```

---

## Mode A: Definition Review

**Purpose**: Check if a Skill follows best practices and standards.

### When to Use

- Before publishing a new Skill
- After modifying a Skill
- Want to improve Skill quality

### Input

```
Required: Skill folder path (e.g., ./skill/ or ./my-skill/)
```

### Four-Category Checklist

| Category | Focus | Items |
|----------|-------|-------|
| 📁 Structure | File/folder layout | S1-S4 |
| 📋 Format | YAML frontmatter | F1-F5 |
| 📝 Content | Instructions and content hygiene | C1-C12 |
| 🎯 Trigger | Activation design | T1-T3 |
| 🛠️ Scripts | Script hygiene (conditional) | SC1-SC8 |

> See `references/definition-checklist.md` for the complete checklist.
>
> **Scripts is conditional.** If the skill has no `scripts/` directory, report the whole
> category as N/A and exclude it from the total. When present, it counts as 8 more items.

### Workflow

```
Step 1: Read Skill folder structure
        ↓
Step 2: Check Structure (S1-S4)
        ↓
Step 3: Check Format (F1-F5)
        ↓
Step 4: Check Content (C1-C12)
        ↓
Step 5: Check Trigger (T1-T3)
        ↓
Step 6: Check Scripts (SC1-SC8) — skip if no scripts/
        ↓
Step 7: Output report
```

### Output Format

```markdown
# 🔍 Skill Review: {skill-name}

> Path: `{skill-path}`

## 📊 Summary

| Category | ✅ Pass | ⚠️ Warn | ❌ Fail |
|----------|---------|---------|---------|
| Structure | x | x | x |
| Format | x | x | x |
| Content | x | x | x |
| Trigger | x | x | x |
| Scripts | x | x | x |
| **Total** | **x** | **x** | **x** |

> Omit the Scripts row and exclude it from the total when the skill has no `scripts/` directory.

---

## 📁 Structure

- ✅ **S1 SKILL.md exists** — Description
- ⚠️ **S2 Item** — Description
  > 💡 Suggestion

(Continue for all categories...)

---

## 💡 Review Comments

### Strengths
- Point 1
- Point 2

### Improvements
- Point 1
- Point 2

### Best Practice Alignment
- Point 1
```

> See `references/definition-report.md` for complete template

---

## Mode B: Execution Review

**Purpose**: Analyze Skill/Tool/Agent execution through three-layer progressive analysis.

```
L1 Engineering Correctness ──▶ L2 Goal Achievement ──▶ L3 Optimization Space
   Is execution correct?         Is effect good?          Can it be better?
```

### When to Use

- Skill/Tool execution results don't meet expectations
- Agent behavior is abnormal and needs troubleshooting
- Want to systematically improve implementation

### Four Input Dimensions

| Input | Description | Required |
|-------|-------------|----------|
| Execution Trace | Tool calls, output, errors | ✅ Yes |
| Execution Goal | Original prompt | ✅ Yes |
| Implementation Reference | Skill/Tool definition | Optional |
| Agent Implementation | Agent source | Optional |

> See `references/input-guide.md` for details

### Three-Layer Analysis

#### L1: Engineering Correctness

**Question: Is execution correct?**

- Are tool calls successful?
- Do scripts execute without errors?
- Any Linter/syntax errors?
- Any infinite loops?

**Judgment:** If errors found → Report and stop, fix L1 first

#### L2: Goal Achievement

**Question: Is the effect good?**

- Is the goal correctly understood?
- Are key steps executed?
- How is output format/quality?

**Rating:** ✓✓✓ Excellent / ✓✓ Good / ✓ Pass / ✗ Fail

#### L3: Optimization Space

**Question: Can it be better?** (Prerequisite: L1 pass + L2 at least pass)

**[MUST] Check these dimensions:**
- **Efficiency**: Redundant calls? Token waste? Repeated reads?
- **Implementation**: Better tools? Clearer description? Scripts simplifiable?
- **Conciseness**: Redundant content? Over-explanation?

> See `references/analysis-dimensions.md` for details

### Workflow

```
Step 1: Collect inputs
        ↓
Step 2: Read implementation reference (if available)
        ↓
Step 3: L1 scan → Report if issues found
        ↓
Step 4: L2 comparison → Evaluate achievement
        ↓
Step 5: L3 optimization → Generate suggestions
        ↓
Step 6: Output report
        ↓
Step 7: (Optional) Generate execution plan if user adopts suggestions
```

> See `references/execution-guide.md` for execution plan generation

### Output Format

```markdown
## Execution Review Report

### Basic Information
| Item | Content |
|------|---------|
| Analysis Target | {Skill/Tool/Agent} |
| Execution Goal | "{prompt}" |

### L1: Engineering Correctness ✓/✗
[Check result table]

### L2: Goal Achievement ✓✓
[Achievement status + Rating]

### L3: Optimization Space 💡
[Suggestions by dimension]

### Summary
[Core issues + Priority improvements]
```

> See `references/report-templates.md` for complete template

---

## Troubleshooting

### Error: "SKILL.md not found"
**Cause**: File missing or named incorrectly (SKILL.MD, skill.md, etc.)
**Solution**: Create `SKILL.md` (case-sensitive) in skill folder root

### Error: "YAML parse failed"
**Cause**: Invalid YAML syntax in frontmatter
**Solution**: Check for:
- Missing `---` delimiters
- Incorrect indentation
- Unescaped special characters in description

### Error: "name field invalid"
**Cause**: name contains spaces, capitals, or special characters
**Solution**: Use kebab-case (e.g., `my-skill-name`)

### Warning: "SKILL.md too long"
**Cause**: File exceeds 500 lines
**Solution**: Move detailed content to `references/` folder

> The documented threshold is **under 500 lines** for the `SKILL.md` body. Files past ~350 lines
> are worth a heads-up, but only 500+ is a must-fix.

---

## References

| Document | Content |
|----------|---------|
| `references/definition-checklist.md` | Definition review: full checklist (S/F/C/T + conditional SC) |
| `references/definition-report.md` | Definition review: report template |
| `references/input-guide.md` | Execution review: four input dimensions |
| `references/analysis-dimensions.md` | Execution review: three-layer checklist |
| `references/scenarios.md` | Typical scenario guide |
| `references/report-templates.md` | Execution review: report templates |
| `references/execution-guide.md` | Execution plan generation guide |

> Every reference file above is linked directly from this `SKILL.md` — keep it that way.
> A file reachable only through another reference file is likely to be read only partially
> (see `references/definition-checklist.md`, item C11).
