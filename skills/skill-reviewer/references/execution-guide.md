# Execution Plan Generation Guide

## When to Generate

Generate execution plan when user:
- Explicitly adopts L3 suggestions
- Asks "How do I implement this?"
- Requests execution steps

## Context Loading Map Template

Progressive loading strategy (L0 → L3):

| Level | Context Type | Load Timing | Example |
|-------|-------------|-------------|---------|
| L0 | Core files to modify | Immediately | `skills/xxx/SKILL.md` |
| L1 | Reference implementations | Before modification | Similar patterns, related SKILL.md |
| L2 | Best practice docs | As reference | `references/patterns.md` |
| L3 | External dependencies | On-demand | API docs, conventions |

**Loading Principle**: Metadata first (~100 tokens) → Full content only when needed

---

## Best Practices Checklist

### Modular Design
- [ ] Single responsibility maintained
- [ ] Content is composable and reusable
- [ ] No tight coupling introduced

### Progressive Disclosure
- [ ] Follows two-stage loading (Metadata → Full Instructions)
- [ ] Hierarchical structure (Quick Reference → Details)
- [ ] Core workflow concise, details in references/

### Clear Activation
- [ ] Description contains specific keywords
- [ ] Trigger conditions clearly defined
- [ ] Action-oriented language

### Error Handling
- [ ] Boundary cases considered
- [ ] Recovery mechanisms in place
- [ ] Clear error messages

### Documentation
- [ ] References/ updated
- [ ] Examples provided
- [ ] Version updated if needed

---

## Execution Steps Template (Trackable Format)

Use imperative tone (second person) and trackable check-boxes:

```markdown
### Execution Steps

[ ] Step 1: **Load Core Context**
    Action: Read `{file_path}`, locate `{section}`
    Purpose: {why needed}
    Verify: {how to confirm success}

[ ] Step 2: **Apply Modification**
    Action: In `{file_path}` at `{location}`, {action}:
    ```{language}
    {specific content}
    ```
    Rationale: {why this change}
    Verify: {how to confirm success}

[ ] Step 3: **Update Related Files**
    Action: In `{related_file}`, {action}:
    - {change 1}
    - {change 2}
    Verify: {how to confirm success}

[ ] Step 4: **Verify Changes**
    - Check: {verification 1}
    - Confirm: {verification 2}
```

### Execution Rules (MUST FOLLOW)

1. **Execute IN ORDER**: Steps must be performed sequentially. Do not skip or reorder.
2. **Progress Output**: 
   - Before each step: Output "→ Executing Step N: {title}"
   - After each step: Output "[DONE] Step N" + verification result
3. **Fail-Safe**: If a step fails or produces unexpected results, STOP immediately and report to the user. Do not proceed with subsequent steps.
4. **Completion Summary**: After all steps are completed, provide a final summary listing all actions taken and verification results.

---

## Verification Checklist

### Completeness
- [ ] All modifications applied
- [ ] Related files updated
- [ ] No broken references

### Correctness
- [ ] Syntax/formats correct
- [ ] File paths accurate
- [ ] Content consistent

### Standards
- [ ] Modular design maintained
- [ ] Progressive disclosure followed
- [ ] Documentation synchronized

### Functionality
- [ ] Goal achieved
- [ ] No breaking changes
- [ ] Edge cases handled

---

## Complete Example

```markdown
## Execution Plan: Add Input Validation Step

### Context Loading Map

| Level | Context | Load Timing | Purpose |
|-------|---------|-------------|---------|
| L0 | `skills/my-skill/SKILL.md` | Immediately | Add workflow step |
| L1 | `references/input-guide.md` | Before mod | Reference requirements |
| L2 | `references/patterns.md` | Reference | Validation patterns |

### Best Practices Checklist

- [x] Single responsibility (validation is distinct step)
- [x] Progressive disclosure (details in references/)
- [x] Error handling (invalid input handled)
- [x] Documentation sync (input-guide updated)

### Execution Steps

[ ] Step 1: **Load Core Context**
    Action: Read `skills/my-skill/SKILL.md`, locate "Workflow" section
    Purpose: Find insertion point
    Verify: Section found and context loaded

[ ] Step 2: **Add Validation Step**
    Action: After Step 2, add:
    ```markdown
    Step 3: Validate inputs
            - Check required fields present
            - Verify data types
            - If invalid → Return error
    ```
    Rationale: Ensures data quality
    Verify: Step added with correct numbering

[ ] Step 3: **Update Input Guide**
    Action: In `references/input-guide.md`, add:
    - Required fields: id, name, email
    - Type constraints: id (number), email (valid format)
    Verify: File saved and content verified

[ ] Step 4: **Verify Changes**
    - Check: Step numbering sequential
    - Test: Run with invalid input
    Verify: All checks pass

### Execution Rules (MUST FOLLOW)

1. Execute IN ORDER (1 → 2 → 3 → 4)
2. Output status for each step: "→ Executing Step N" and "[DONE] Step N"
3. Stop if any step fails

### Verification Checklist

- [ ] Step at correct position
- [ ] Numbering updated
- [ ] Input guide updated
- [ ] No breaking changes

---

**Ready to execute?**
```

---

## Interaction Flow

```
L3 Suggestions
     ↓
User adopts
     ↓
Generate Execution Plan (with trackable steps)
     ↓
Ask: "Ready to execute?"
     ↓
User confirms
     ↓
Execute with progress output:
  → Executing Step 1: Load Core Context
  [DONE] Step 1 ✓
  
  → Executing Step 2: Add Validation Step
  [DONE] Step 2 ✓
  ...
     ↓
Output completion summary
```

**Tone Shift**: Before adoption (analytical) → After adoption (imperative)
