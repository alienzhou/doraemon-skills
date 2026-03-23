# Definition Review Checklist

20-item checklist for reviewing Skill definition quality, organized into 4 categories.

## Status Symbols

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✅ | Pass | No action needed |
| ⚠️ | Warning | Consider improving |
| ❌ | Fail | Must fix |

---

## 📁 Structure (S1-S4)

### S1: SKILL.md Exists

**Check:** Entry file exists with correct naming.

| Status | Condition |
|--------|-----------|
| ✅ Pass | File exists and named exactly `SKILL.md` (case-sensitive) |
| ❌ Fail | File missing or named incorrectly (SKILL.MD, skill.md, etc.) |

**Detection:** Programmatic (file system check)

### S2: Folder Naming

**Check:** Skill folder uses kebab-case naming.

| Status | Condition |
|--------|-----------|
| ✅ Pass | kebab-case (e.g., `my-skill`, `skill-reviewer`) |
| ⚠️ Warn | Contains underscore (e.g., `my_skill`) - works but non-standard |
| ❌ Fail | Contains spaces or capitals (e.g., `My Skill`, `MySkill`) |

**Detection:** Programmatic (regex: `^[a-z0-9]+(-[a-z0-9]+)*$`)

### S3: Directory Structure

**Check:** Optional directories used correctly.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Uses standard optional directories: `scripts/`, `references/`, `assets/` |
| ⚠️ Warn | Missing optional directories (acceptable if not needed) |
| ❌ Fail | Contains forbidden `README.md` in skill folder |

**Detection:** Programmatic (directory listing)

**Standard Structure:**
```
your-skill/
├── SKILL.md              # Required
├── scripts/              # Optional - executable code
├── references/           # Optional - documentation
└── assets/               # Optional - templates, resources
```

### S4: Name Consistency

**Check:** Folder name matches `name` field in frontmatter.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Folder name and `name` field are identical |
| ⚠️ Warn | Different but both valid kebab-case (works but confusing) |

**Detection:** Programmatic (string comparison)

---

## 📋 Format (F1-F5)

### F1: YAML Frontmatter Delimiters

**Check:** Frontmatter properly delimited.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Starts with `---` and has closing `---` |
| ❌ Fail | Missing delimiters or malformed |

**Detection:** Programmatic (regex: `^---\n[\s\S]*?\n---`)

### F2: name Field

**Check:** Required `name` field is valid.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Exists, kebab-case, no spaces, no capitals |
| ⚠️ Warn | Exists but has minor format issues |
| ❌ Fail | Missing or completely invalid |

**Detection:** Programmatic (YAML parse + regex)

**Valid Examples:**
```yaml
name: skill-reviewer      # ✅
name: my-cool-skill       # ✅
```

**Invalid Examples:**
```yaml
name: Skill Reviewer      # ❌ spaces and capitals
name: skill_reviewer      # ⚠️ underscore
```

### F3: description Field

**Check:** Required `description` field exists and within limits.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Exists and < 1024 characters |
| ⚠️ Warn | Exists but close to limit (> 900 characters) |
| ❌ Fail | Missing or exceeds 1024 characters |

**Detection:** Programmatic (YAML parse + length check)

### F4: No Forbidden Content

**Check:** No security-restricted content in frontmatter.

| Status | Condition |
|--------|-----------|
| ✅ Pass | No XML angle brackets `< >`, no reserved prefixes |
| ❌ Fail | Contains `<` or `>` or uses reserved name prefixes |

**Detection:** Programmatic (regex scan)

**Forbidden:**
- XML angle brackets: `<` `>`
- Reserved name prefixes: `claude-*`, `anthropic-*`

### F5: Optional Fields Format

**Check:** Optional fields (if present) are correctly formatted.

| Status | Condition |
|--------|-----------|
| ✅ Pass | `license`, `metadata`, `compatibility` formatted correctly |
| ⚠️ Warn | Present but minor format issues |
| N/A | Optional fields not used |

**Detection:** Programmatic (YAML validation)

**Valid Optional Fields:**
```yaml
license: MIT
compatibility: "Requires Node.js 18+"
metadata:
  author: your-name
  version: 1.0.0
  category: development-tools
  tags: [review, validation]
```

---

## 📝 Content (C1-C8)

### C1: Description Contains WHAT

**Check:** Description clearly states what the Skill does.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Clear statement of purpose/function |
| ⚠️ Warn | Vague (e.g., "Helps with projects") |
| ❌ Fail | No purpose statement |

**Detection:** Model-based (semantic analysis)

**Good Examples:**
```yaml
description: "Analyzes Figma design files and generates developer handoff documentation."
description: "Review and validate Skill definitions against best practices."
```

**Bad Examples:**
```yaml
description: "Helps with projects."        # Too vague
description: "Use when needed."            # No WHAT
```

### C2: Description Contains WHEN

**Check:** Description includes trigger conditions.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Clear trigger phrases (e.g., "Use when user asks to...") |
| ⚠️ Warn | Has trigger intent but not specific |
| ❌ Fail | No trigger description |

**Detection:** Model-based (pattern matching + semantic analysis)

**Good Examples:**
```yaml
description: "... Use when user asks to 'review skill', 'check skill quality', or 'validate skill'."
description: "... Triggers on: 'design specs', 'component documentation', 'design-to-code handoff'."
```

**Bad Examples:**
```yaml
description: "Creates documentation."       # No WHEN
description: "For projects."               # No trigger phrases
```

### C3: Instructions Are Actionable

**Check:** Instructions in SKILL.md are specific and executable.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Specific steps, clear parameters, expected outputs |
| ⚠️ Warn | Basically usable but could be more specific |
| ❌ Fail | Vague (e.g., "validate properly", "handle errors") |

**Detection:** Model-based (instruction quality analysis)

**Good:**
```markdown
### Step 1: Read Skill folder
Run: `ls -la ${SKILL_PATH}/`
Expected: List of files including SKILL.md
```

**Bad:**
```markdown
### Step 1
Validate the data before proceeding.
```

### C4: Error Handling Included

**Check:** Skill includes troubleshooting or error handling guidance.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Has Troubleshooting section or error handling instructions |
| ⚠️ Warn | Brief mention of errors |
| ❌ Fail | No error handling |

**Detection:** Model-based (section/keyword scan + semantic analysis)

**Good:**
```markdown
## Troubleshooting

### Error: "SKILL.md not found"
Cause: File not named exactly SKILL.md
Solution: Rename to SKILL.md (case-sensitive)
```

### C5: Examples Provided

**Check:** Skill includes concrete usage examples.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Has complete examples (input → action → result) |
| ⚠️ Warn | Has examples but incomplete |
| ❌ Fail | No examples |

**Detection:** Model-based (section scan + completeness check)

**Good:**
```markdown
## Example

User says: "Review my skill at ./my-skill/"

Actions:
1. Read folder structure
2. Check SKILL.md format
3. Validate content

Result: Review report with pass/warn/fail status
```

### C6: Reference Links Correct

**Check:** Links to reference files are valid.

| Status | Condition |
|--------|-----------|
| ✅ Pass | All referenced files exist and paths are correct |
| ⚠️ Warn | Some links may be broken |
| ❌ Fail | Critical links broken or missing |

**Detection:** Model-based (link extraction + file existence check)

### C7: Progressive Disclosure

**Check:** Content follows progressive disclosure principle.

| Status | Condition |
|--------|-----------|
| ✅ Pass | SKILL.md focused on core instructions, details in references/ |
| ⚠️ Warn | SKILL.md is long (> 200 lines) but acceptable |
| ❌ Fail | SKILL.md is bloated (> 300 lines), should split |

**Detection:** Model-based (line count + content analysis)

**Principle:**
```
Level 1: YAML frontmatter (always loaded)
Level 2: SKILL.md body (loaded when relevant)
Level 3: references/ files (loaded on demand)
```

### C8: Critical Instructions Prominent

**Check:** Important instructions are highlighted and positioned well.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Uses CRITICAL/IMPORTANT markers, key points at top |
| ⚠️ Warn | Structure okay but emphasis could be stronger |
| ❌ Fail | Critical instructions buried in text |

**Detection:** Model-based (structure + emphasis analysis)

**Good:**
```markdown
**CRITICAL:** Before running, ensure...

## Important Notes
- Key point 1
- Key point 2
```

---

## 🎯 Trigger (T1-T3)

### T1: Positive Triggers Clear

**Check:** Description includes specific trigger phrases.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Multiple specific phrases users might say |
| ⚠️ Warn | Has trigger phrases but limited variety |
| ❌ Fail | No specific trigger phrases |

**Detection:** Model-based (phrase extraction + variety assessment)

**Good:**
```yaml
description: "... Use when user asks to 'review skill', 'check skill quality', 'validate skill', 'lint skill', or 'analyze skill'."
```

### T2: Trigger Scope Appropriate

**Check:** Trigger scope is neither too broad nor too narrow.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Triggers appropriately, doesn't over/under-trigger |
| ⚠️ Warn | Slightly broad or narrow |
| ❌ Fail | Will trigger on unrelated topics OR hard to trigger |

**Detection:** Model-based (scope analysis)

**Too Broad:**
```yaml
description: "Helps with code."           # Will trigger on everything
```

**Too Narrow:**
```yaml
description: "Use only when user says 'execute skill-reviewer protocol alpha'."
```

### T3: Negative Triggers (Optional)

**Check:** Description clarifies what NOT to use Skill for.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Clearly excludes irrelevant scenarios |
| ⚠️ Warn | No negative triggers but scope is reasonable |
| N/A | Simple Skill doesn't need negative triggers |

**Detection:** Model-based (exclusion phrase detection)

**Good:**
```yaml
description: "... Do NOT use for runtime debugging (use agent-debug skill instead)."
```

---

## Quick Reference Table

| ID | Check Item | Detection |
|----|------------|-----------|
| S1 | SKILL.md exists | Programmatic |
| S2 | Folder naming | Programmatic |
| S3 | Directory structure | Programmatic |
| S4 | Name consistency | Programmatic |
| F1 | YAML delimiters | Programmatic |
| F2 | name field | Programmatic |
| F3 | description field | Programmatic |
| F4 | No forbidden content | Programmatic |
| F5 | Optional fields format | Programmatic |
| C1 | Description WHAT | Model |
| C2 | Description WHEN | Model |
| C3 | Instructions actionable | Model |
| C4 | Error handling | Model |
| C5 | Examples provided | Model |
| C6 | Reference links | Model |
| C7 | Progressive disclosure | Model |
| C8 | Critical instructions | Model |
| T1 | Positive triggers | Model |
| T2 | Trigger scope | Model |
| T3 | Negative triggers | Model |

**Summary:** 9 programmatic checks (S1-S4, F1-F5) + 11 model-based checks (C1-C8, T1-T3)
