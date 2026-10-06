# Definition Review Report Template

## Contents

- **Report Structure** — the four blocks every report contains
- **Complete Template** — full markdown template with all check rows
- **Brief Template** — condensed table for quick reviews
- **Status Formatting Rules** — how ✅ / ⚠️ / ❌ are written
- **Review Comments Guidelines** — what goes in Strengths / Improvements / Alignment
- **Checklist for Report Generation** — pre-output self-check

---

## Report Structure

```
1. Header (skill name + path)
2. Summary (quick overview table)
3. Detailed Checks (4 categories)
4. Review Comments (strengths + improvements + alignment)
```

---

## Complete Template

```markdown
# 🔍 Skill Review: {skill-name}

> Path: `{skill-path}`

## 📊 Summary

| Category | ✅ Pass | ⚠️ Warn | ❌ Fail |
|----------|---------|---------|---------|
| Structure | {n} | {n} | {n} |
| Format | {n} | {n} | {n} |
| Content | {n} | {n} | {n} |
| Trigger | {n} | {n} | {n} |
| Scripts | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** |

> If the skill has no `scripts/` directory, write `N/A` in the Scripts row and exclude it
> from the Total.

---

## 📁 Structure

- ✅ **S1 SKILL.md exists** — Entry file found with correct naming
- ✅ **S2 Folder naming** — Uses kebab-case: `{folder-name}`
- ⚠️ **S3 Directory structure** — Missing `references/` directory
  > 💡 Consider adding references/ for detailed documentation
- ✅ **S4 Name consistency** — Folder name matches `name` field

## 📋 Format

- ✅ **F1 YAML delimiters** — Frontmatter properly delimited
- ✅ **F2 name field** — Valid kebab-case: `{name}`
- ⚠️ **F3 description field** — Present but long ({n} chars, limit 1024)
  > 💡 Consider shortening while keeping WHAT + WHEN + triggers
- ✅ **F4 No forbidden content** — No XML tags or reserved prefixes
- ✅ **F5 Optional fields** — metadata formatted correctly

## 📝 Content

- ✅ **C1 Description WHAT** — Clear purpose: "{purpose summary}"
- ⚠️ **C2 Description WHEN** — Trigger phrases could be more specific
  > 💡 Add phrases like "Use when user says '...'"
- ✅ **C3 Instructions actionable** — Steps are specific and executable
- ❌ **C4 Error handling** — No troubleshooting section
  > 💡 Add ## Troubleshooting with common errors and solutions
- ✅ **C5 Examples** — Complete examples with input/action/result
- ✅ **C6 Reference links** — All referenced files exist
- ⚠️ **C7 Progressive disclosure** — SKILL.md is {n} lines, consider splitting
  > 💡 Move detailed content to references/ to reduce context load
- ✅ **C8 Critical instructions** — Key points highlighted with CRITICAL marker
- ✅ **C9 No time-sensitive info** — No expiring dates, versions, or "latest" claims
- ✅ **C10 Consistent terminology** — One name per concept across SKILL.md and references/
- ✅ **C11 References one level deep** — All reference files linked directly from SKILL.md
- ✅ **C12 Workflows have clear steps** — Multi-step work is ordered and trackable

## 🎯 Trigger

- ✅ **T1 Positive triggers** — Multiple specific trigger phrases
- ⚠️ **T2 Trigger scope** — May trigger on related but different tasks
  > 💡 Consider narrowing scope or adding negative triggers
- ✅ **T3 Negative triggers** — Clearly excludes unrelated scenarios

## 🛠️ Scripts

> Only include this section when the skill ships a `scripts/` directory. Otherwise write a single
> line: `> N/A — skill has no scripts/ directory.` and omit it from the total.

- ✅ **SC1 Solve, don't defer** — Scripts perform the work rather than returning instructions
- ✅ **SC2 No voodoo constants** — Hard-coded values carry justifying comments
- ✅ **SC3 Dependencies declared** — Install line present and listed in SKILL.md
- ⚠️ **SC4 Script documentation** — Purpose clear, usage under-documented
  > 💡 Add a usage/docstring header naming inputs and outputs
- ✅ **SC5 Forward slash paths** — No Windows-style backslashes
- ✅ **SC6 Explicit error handling** — Failures name the cause and next action
- ✅ **SC7 Validation for critical ops** — Preconditions checked before destructive actions
- ✅ **SC8 Feedback loops** — Validator → fix → repeat present for quality-critical tasks

---

## 💡 Review Comments

### Strengths
- Well-organized file structure with clear separation of concerns
- Comprehensive examples demonstrating expected usage
- Good use of markdown formatting for readability

### Improvements
- Add troubleshooting section for common errors (C4)
- Expand trigger phrases in description (C2)
- Consider splitting long SKILL.md content (C7)

### Best Practice Alignment
- ✅ Follows progressive disclosure principle
- ✅ Uses standard directory structure
- ⚠️ Description could better follow WHAT + WHEN + triggers pattern
```

---

## Brief Template

For quick reviews, use this condensed format:

```markdown
## 🔍 Skill Review: {skill-name}

| Check | Status | Notes |
|-------|--------|-------|
| Structure (S1-S4) | ✅ 4/4 | All pass |
| Format (F1-F5) | ⚠️ 4/5 | F3: description long |
| Content (C1-C12) | ⚠️ 10/12 | C4: no troubleshooting, C7: long |
| Trigger (T1-T3) | ✅ 3/3 | All pass |
| Scripts (SC1-SC8) | N/A | No scripts/ directory |

**Overall:** 21/24 pass, 3 warnings, 0 failures

**Priority Fixes:**
1. Add troubleshooting section
2. Consider splitting SKILL.md
```

---

## Status Formatting Rules

### Pass (✅)

```markdown
- ✅ **{ID} {Name}** — {Brief positive statement}
```

Example:
```markdown
- ✅ **S1 SKILL.md exists** — Entry file found with correct naming
```

### Warning (⚠️)

```markdown
- ⚠️ **{ID} {Name}** — {Issue description}
  > 💡 {Suggestion}
```

Example:
```markdown
- ⚠️ **C7 Progressive disclosure** — SKILL.md is 380 lines
  > 💡 Consider moving detailed content to references/ before it passes 500
```

### Fail (❌)

```markdown
- ❌ **{ID} {Name}** — {Issue description}
  > 💡 {Required action}
```

Example:
```markdown
- ❌ **S1 SKILL.md exists** — File not found or incorrectly named
  > 💡 Create SKILL.md (case-sensitive) in skill folder root
```

---

## Review Comments Guidelines

### Strengths

Focus on:
- What the skill does well
- Good practices followed
- Notable design decisions

Keep each point to 1-2 sentences.

### Improvements

Focus on:
- Items marked ⚠️ or ❌
- Prioritize by impact
- Provide actionable suggestions

Keep each point to 1-2 sentences with clear action.

### Best Practice Alignment

Compare against these principles:
- Progressive disclosure (metadata → SKILL.md → references/)
- Composability (works with other skills)
- Portability (works across environments and models)
- Description pattern (WHAT + WHEN + triggers)
- Standard structure (SKILL.md + scripts/ + references/ + assets/)
- Reference depth (one level deep from SKILL.md)
- Degrees of freedom matched to task fragility

Use ✅/⚠️/❌ markers for quick visual scan.

---

## Checklist for Report Generation

Before outputting report:

- [ ] Summary table counts are accurate
- [ ] All applicable checks are listed (Scripts row omitted or N/A when no `scripts/`)
- [ ] Each status has appropriate symbol (✅/⚠️/❌)
- [ ] Warnings and failures include 💡 suggestions
- [ ] Review Comments has all 3 sections
- [ ] Each comment is 1-2 sentences (concise)
