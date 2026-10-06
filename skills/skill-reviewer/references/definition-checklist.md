# Definition Review Checklist

## Contents

- **Status Symbols** — ✅ / ⚠️ / ❌ meanings
- **📁 Structure (S1-S4)** — SKILL.md existence, folder naming, directory layout, name consistency
- **📋 Format (F1-F5)** — YAML delimiters, `name`, `description`, forbidden content, optional fields
- **📝 Content (C1-C8)** — description WHAT/WHEN, actionable instructions, errors, examples,
  links, progressive disclosure, prominence of critical instructions
- **🔗 Content (C9-C12)** — time-sensitivity, terminology consistency, reference depth, workflows
- **🛠️ Scripts (SC1-SC8)** — conditional block for skills shipping a `scripts/` directory
- **🎯 Trigger (T1-T3)** — positive triggers, scope, negative triggers
- **Quick Reference Table** — all IDs with their detection method
- **Category Totals** — how many items per category

---

Checklist for reviewing Skill definition quality. Structure (S1-S4), Format (F1-F5) and Trigger
(T1-T3) are the original four-category set; Content now runs C1-C12, and the Scripts block
(SC1-SC8) is conditional on the skill shipping a `scripts/` directory.

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
| ⚠️ Warn | Contains `README.md` in skill folder (not forbidden, but SKILL.md should carry the load) |
| N/A | No optional directories needed |

**Detection:** Programmatic (directory listing)

> **Note:** Anthropic's docs do not forbid `README.md` in a skill folder, but they do require all
> essential instructions to live in `SKILL.md` (only `name` + `description` are pre-loaded; `SKILL.md`
> is read on demand). A `README.md` will not be read unless something points at it, so treat it as a
> maintainability warning rather than a failure.

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
| ✅ Pass | Exists, kebab-case, no spaces, no capitals, ≤ 64 characters |
| ⚠️ Warn | Exists but has minor format issues (e.g. underscore) |
| ⚠️ Warn | Exceeds 64 characters (near or over the documented limit) |
| ❌ Fail | Missing or completely invalid |

**Detection:** Programmatic (YAML parse + regex + length check)

> **Limit:** Anthropic documents `name` as **maximum 64 characters**, lowercase letters/numbers/hyphens
> only, no XML tags, no reserved words.

**Valid Examples:**
```yaml
name: skill-reviewer      # ✅
name: my-cool-skill       # ✅
```

**Invalid Examples:**
```yaml
name: Skill Reviewer      # ❌ spaces and capitals
name: skill_reviewer      # ⚠️ underscore
name: <a-70-character-name-that-exceeds-the-documented-limit>   # ⚠️ too long
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

> Instruction quality: is the writing specific, complete, and well-organized?

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
| ⚠️ Warn | SKILL.md is long (> 350 lines) but still workable |
| ❌ Fail | SKILL.md is bloated (> 500 lines), must split |

**Detection:** Model-based (line count + content analysis)

> **Threshold:** Anthropic's documented limit is **under 500 lines** for the `SKILL.md` body
> (`Token budgets`: "Keep SKILL.md body under 500 lines for optimal performance"). The 350-line
> warning is a local early-warning band, not an official number.

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

## 🔗 Content (C9-C12)

> Content hygiene: rules that keep the skill from rotting or being misread — these extend the
> Content category beyond instruction quality. All four come from Anthropic's
> `Checklist for effective Skills`.

### C9: No Time-Sensitive Information

**Check:** Content avoids facts that will expire.

| Status | Condition |
|--------|-----------|
| ✅ Pass | No dates, versions, or "currently/latest" claims that will rot |
| ⚠️ Warn | Some time-bound info, but isolated and clearly marked |
| ❌ Fail | Core instructions depend on "current" state that will change |

**Detection:** Model-based (date/version/"latest" phrase scan)

> **Official guidance:** `Avoid time-sensitive information`. Historical context belongs in an
> explicitly labelled "old patterns" section, not in the main instructions.

**Bad:**
```markdown
Use the current model (Opus 4), released in 2025, which is the latest.
```

**Good:**
```markdown
## Old patterns
<!-- Historical context, kept for older setups. Not current guidance. -->
...previous approach...
```

### C10: Consistent Terminology

**Check:** One concept keeps one name throughout the skill.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Same term used consistently across SKILL.md and references/ |
| ⚠️ Warn | Minor synonym drift (e.g. "check" vs "checklist item") |
| ❌ Fail | Same concept named differently, causing ambiguity |

**Detection:** Model-based (term frequency + synonym drift analysis)

> **Official guidance:** `Use consistent terminology`. Aliases for the same concept make
> instructions ambiguous — pick one name and use it everywhere.

### C11: References Are One Level Deep

**Check:** Every reference file links directly from SKILL.md.

| Status | Condition |
|--------|-----------|
| ✅ Pass | All reference files reachable directly from SKILL.md |
| ⚠️ Warn | Shallow nesting that is documented and intentional |
| ❌ Fail | Files reachable only through another reference file |

**Detection:** Programmatic (parse all `references/*` links, build reachability graph)

> **Official guidance:** `Avoid deeply nested references` — "Claude may partially read files when
> they're referenced from other referenced files… Keep references one level deep from SKILL.md."
>
> **How to check:** list every file SKILL.md links to, then parse those files for links of their
> own. Anything only reachable through a second hop is a ❌. Links inside an **example or template**
> (e.g. a fictional `my-skill/` tree) are not real references and must not be flagged.

### C12: Workflows Have Clear Steps

**Check:** Complex multi-step processes are broken into explicit steps.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Multi-step work has ordered steps, and a checklist when order matters |
| ⚠️ Warn | Steps present but ordering or completion criteria unclear |
| ❌ Fail | Complex workflow described only in prose |

**Detection:** Model-based (workflow extraction + step completeness check)

> **Official guidance:** `Use workflows for complex tasks` — break complex operations into clear
> sequential steps; for particularly complex workflows provide a checklist Claude can copy and tick
> off. Add the checklist **only when order matters** — otherwise it contradicts the guidance to give
> Claude the goal rather than prescriptive steps.

---

## 🛠️ Scripts (SC1-SC8)

> **Conditional category.** Only applies when the skill ships a `scripts/` directory.
> If there are no scripts, mark the whole category **N/A** and exclude it from the total —
> do not report passes or failures for a category that does not exist.

### SC1: Scripts Solve Problems, Don't Defer

**Check:** Scripts implement the logic rather than telling Claude to figure it out.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Script does the work and returns a result |
| ❌ Fail | Script only prints instructions for Claude to follow |

**Detection:** Model-based (script body inspection)

> **Official guidance:** `Solve, don't defer`. A script that outputs "now step through these files
> yourself" has moved the work back into the model instead of doing it.

### SC2: No Voodoo Constants

**Check:** Every hard-coded value is justified.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Magic numbers/thresholds carry a comment explaining their origin |
| ⚠️ Warn | Values present with partial justification |
| ❌ Fail | Unexplained constants that readers cannot safely change |

**Detection:** Model-based (constant + comment scan)

### SC3: Dependencies Explicitly Declared

**Check:** Required packages are named, with an install line.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Install line next to the script (e.g. `pip install pypdf`) and listed in SKILL.md |
| ⚠️ Warn | Dependencies named but no install command |
| ❌ Fail | Script imports packages that are never declared |
| N/A | No third-party dependencies |

**Detection:** Programmatic (import/require scan cross-checked against SKILL.md)

> **Official guidance:** `Avoid assuming tools are installed` — "Don't assume packages are
> available." Bad: "Use the pdf library to process the file." Good: "Install required package:
> `pip install pypdf`". If it's already installed, Claude skips the step; if not, the skill still
> works on a teammate's machine on day one.

### SC4: Scripts Have Clear Documentation

**Check:** Each script has a header or docstring explaining its purpose and usage.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Purpose, inputs, and outputs documented |
| ⚠️ Warn | Purpose clear but usage/arguments undocumented |
| ❌ Fail | No documentation at all |

**Detection:** Model-based (header/docstring scan)

### SC5: Forward Slash Paths Only

**Check:** No Windows-style backslash paths.

| Status | Condition |
|--------|-----------|
| ✅ Pass | All paths use forward slashes |
| ❌ Fail | Any backslash path (`reference\guide.md`) |

**Detection:** Programmatic (regex scan for `\\` in path-like strings)

> **Official guidance:** `Avoid Windows-style paths`. Skills are navigated like a filesystem with
> forward slashes regardless of the host OS.

### SC6: Error Handling Is Explicit and Helpful

**Check:** Scripts surface actionable errors rather than failing silently.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Failures raise with a message naming the cause and next action |
| ⚠️ Warn | Errors raised but messages are terse |
| ❌ Fail | Silent failure or bare traceback with no context |

**Detection:** Model-based (error-path inspection)

> Note this is the **script-level** counterpart to C4, which covers the SKILL.md instructions.

### SC7: Validation for Critical Operations

**Check:** Destructive or consequential operations verify preconditions.

| Status | Condition |
|--------|-----------|
| ✅ Pass | Checks target existence/state before acting; verifies after writing |
| ⚠️ Warn | Partial validation |
| ❌ Fail | Destructive action with no precondition check |
| N/A | No destructive or critical operations |

**Detection:** Model-based (destructive-operation scan)

> **Official guidance:** `Validation/verification steps for critical operations` and
> `Create verifiable intermediate outputs`.

### SC8: Feedback Loops for Quality-Critical Tasks

**Check:** Quality-critical paths run validator → fix → re-check.

| Status | Condition |
|--------|-----------|
| ✅ Pass | A check-and-retry loop exists (script or documented procedure) |
| ⚠️ Warn | Validation exists but does not loop |
| ❌ Fail | No validation step for quality-critical output |
| N/A | Task is not quality-critical |

**Detection:** Model-based (loop/retry pattern scan)

> **Official guidance:** `Implement feedback loops` — "Common pattern: Run validator → fix errors →
> repeat. This pattern greatly improves output quality." The validator does not have to be code.

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
| C9 | No time-sensitive info | Model |
| C10 | Consistent terminology | Model |
| C11 | References one level deep | Programmatic |
| C12 | Workflows have clear steps | Model |
| SC1-SC8 | Scripts hygiene (conditional) | Mixed |
| T1 | Positive triggers | Model |
| T2 | Trigger scope | Model |
| T3 | Negative triggers | Model |

**Summary:** 31 checks total — 11 programmatic (S1-S4, F1-F5, C11) + 20 model-based
(C1-C10, C12, T1-T3), plus the conditional Scripts block (SC1-SC8) when `scripts/` exists.

**Category totals** (Scripts excluded when absent):

| Category | Items | Count |
|----------|-------|-------|
| 📁 Structure | S1-S4 | 4 |
| 📋 Format | F1-F5 | 5 |
| 📝 Content | C1-C12 | 12 |
| 🎯 Trigger | T1-T3 | 3 |
| 🛠️ Scripts (conditional) | SC1-SC8 | 8 |
| **Base total (no scripts)** | | **24** |
| **With scripts** | | **32** |
