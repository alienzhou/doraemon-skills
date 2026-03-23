# Report Templates

## Template Selection

| Scenario | Recommended Template |
|---------|---------------------|
| Quick troubleshooting | Brief report |
| Formal analysis | Complete report |
| Deep analysis | Complete report + Agent section |

---

## Brief Report

Suitable for quick troubleshooting, fits on one screen.

```markdown
## Execution Quick Review

**Analysis Target**: {Skill/Tool} | **Goal**: "{prompt summary}" | **Time**: {date}

### Three-Layer Conclusion

| Layer | Result | One Sentence |
|-------|--------|--------------|
| L1 Engineering | ✓/✗ | {Issue or pass} |
| L2 Effect | ✓✓/✓/✗ | {Achievement status} |
| L3 Optimization | N items | {Main direction} |

### Key Issues

1. {Most important issue}

### Priority Improvements

1. {Highest priority suggestion}
```

---

## Complete Report

Suitable for formal analysis, complete structure.

```markdown
## Execution Review Report

### Basic Information

| Item | Content |
|------|---------|
| Analysis Target | {Skill/Tool/Agent} |
| Name | {name} |
| Execution Goal | "{user prompt}" |
| Analysis Time | {date} |
| Input Dimensions | Trace + Goal [+ Skill] [+ Agent] |

---

### L1: Engineering Correctness ✓/✗

| Check Item | Status | Details |
|------------|--------|---------|
| Tool Calls | ✓/✗ | {Success/failure count, error info} |
| Script Execution | ✓/✗ | {exit code, error output} |
| Code Quality | ✓/✗/- | {linter error count} |
| Execution Flow | ✓/✗ | {complete/interrupted/loop} |

**L1 Conclusion**: ✓ Pass / ✗ Fail

**Blocking Issues**: (if any)
```
{Specific error information}
{Location}
{Possible causes}
```

---

### L2: Goal Achievement ✓✓✓/✓✓/✓/✗

**Execution Goal**: 
> {User's original prompt}

**Design Goal**: (extracted from implementation reference)
> {What Skill/Tool claims to do}

#### Process Coverage

| Design Step | Actual Execution | Notes |
|-------------|------------------|-------|
| Step 1: {description} | ✓/✗/△ | {explanation} |
| Step 2: {description} | ✓/✗/△ | {explanation} |
| Step 3: {description} | ✓/✗/△ | {explanation} |

#### Output Quality

| Dimension | Evaluation | Explanation |
|-----------|------------|-------------|
| Format | ✓/✗ | {Does it match expected format} |
| Completeness | ✓/✗ | {Any omissions} |
| Accuracy | ✓/✗ | {Is content correct} |
| Usability | ✓/✗ | {Can it be used directly} |

**L2 Rating**: ✓✓ Good

**Rating Reason**: 
{1-2 sentences explaining why this rating}

---

### L3: Optimization Space 💡

#### Execution Statistics

| Metric | Value | Explanation |
|--------|-------|-------------|
| Total Tool Calls | N | |
| Repeated Calls | M times | {Which tools} |
| Large File Reads | K files | {File names, line counts} |

#### Optimization Suggestions

**Efficiency**

{Suggestions or "No redundancy found"}

**Implementation**

{Suggestions or "No improvement needed"}

**Conciseness [MUST]**

| Check Item | Status | Notes |
|-----------|--------|-------|
| Redundant content | ✓/⚠️ | {Details or "None found"} |
| Over-explanation (templates vs text) | ✓/⚠️ | {Details or "Appropriate balance"} |
| Clarity preserved | ✓/⚠️ | {Details or "Clear and concise"} |

**Conciseness Verdict**: {✓ Pass / ⚠️ Warning with suggestions}

---

### Summary

| Layer | Result | Explanation |
|-------|--------|-------------|
| L1 Engineering Correctness | ✓ Pass | {One sentence} |
| L2 Goal Achievement | ✓✓ Good | {One sentence} |
| L3 Optimization Space | N suggestions | {Main direction} |

**Core Issues**: 
1. {Most important issue}
2. {Second most important issue}

**Priority Improvements**:
1. [{Priority}] {Specific suggestion}
2. [{Priority}] {Specific suggestion}

**Follow-up Suggestions**:
- {Whether need re-analysis}
- {Whether need actual testing verification}
```

---

## Execution Plan Template

When user adopts L3 suggestions, generate execution plan.

> See `references/execution-guide.md` for complete execution plan generation guide, including:
> - Context Loading Map template
> - Best Practices Checklist
> - Execution Steps format
> - Verification Checklist
> - Complete examples

---

## Agent Deep Analysis Supplement

When Agent implementation is provided, add to complete report:

```markdown
---

### Agent Implementation Analysis

#### System Prompt Check

| Check Item | Status | Explanation |
|-----------|--------|-------------|
| Instruction Clarity | ✓/✗ | {Is it clear} |
| Constraint Completeness | ✓/✗ | {Any omissions} |
| Alignment with Skill | ✓/✗ | {Is it consistent} |

#### Tool Definition Check

| Tool | Description | Parameter Design | Issues |
|------|-------------|------------------|--------|
| {tool1} | ✓/✗ | ✓/✗ | {explanation} |
| {tool2} | ✓/✗ | ✓/✗ | {explanation} |

#### Problem Location

```
Problem Chain:
Skill Instruction ──?──▶ Agent Understanding ──?──▶ Tool Call ──?──▶ Final Output
                            │
                            └── Problem is here: {Specific explanation}
```

#### Agent Layer Optimization Suggestions

**1. [System Prompt] {Title}**
- Current State: {Description}
- Suggested Modification:
  ```
  {Specific prompt modification}
  ```

**2. [Tool Definition] {Title}**
- Current State: {Description}
- Suggested Modification:
  ```json
  {Specific tool definition modification}
  ```
```

---

## Report Example

### Example: Skill Analysis Report

```markdown
## Execution Review Report

### Basic Information

| Item | Content |
|------|---------|
| Analysis Target | Skill |
| Name | agent-debug |
| Execution Goal | "Help me analyze why chatId xxx is stuck" |
| Analysis Time | 2026-01-09 |
| Input Dimensions | Trace + Goal + Skill |

---

### L1: Engineering Correctness ✓

| Check Item | Status | Details |
|------------|--------|---------|
| Tool Calls | ✓ | 8/8 successful |
| Script Execution | ✓ | curl exit 0 |
| Code Quality | - | No code generation |
| Execution Flow | ✓ | Completed normally |

**L1 Conclusion**: ✓ Pass

---

### L2: Goal Achievement ✓✓

**Execution Goal**: 
> Help me analyze why chatId xxx is stuck

**Design Goal**:
> Analyze Agent issues through four context sources, generate report with Overview, Timeline, root cause analysis

#### Process Coverage

| Design Step | Actual Execution | Notes |
|-------------|------------------|-------|
| Step 0: Initialize session | ✓ | Used init-debug-session.sh |
| Step 1: Collect information | ✓ | Retrieved chatId |
| Step 2: Query API | ✓ | curl call successful |
| Step 3: Generate timeline | △ | Only text description, no chart |
| Step 4: Root cause analysis | ✓ | Found stuck reason |
| Step 5: Generate report | ✓ | Markdown format |

#### Output Quality

| Dimension | Evaluation | Explanation |
|-----------|------------|-------------|
| Format | ✓ | Markdown table correct |
| Completeness | △ | Missing Timeline chart |
| Accuracy | ✓ | Correctly identified stuck reason |
| Usability | ✓ | Can be used directly for OnCall |

**L2 Rating**: ✓✓ Good

**Rating Reason**: Core goal achieved, found problem reason, but Timeline visualization missing.

---

### L3: Optimization Space 💡

#### Execution Statistics

| Metric | Value | Explanation |
|--------|-------|-------------|
| Total Tool Calls | 8 | |
| Repeated Calls | 0 | |
| Large File Reads | 1 | messages.json (500 lines) |

#### Optimization Suggestions

**1. [SKILL.md] Emphasize Timeline Visualization**

- **Priority**: Medium
- **Current State**: Step 3 only says "generate timeline", doesn't emphasize need for chart
- **Suggestion**: Add "⭐ Use ASCII or Mermaid visualization"
- **Location**: SKILL.md Step 3
- **Expected Benefit**: Improve output readability

**2. [Efficiency] Use jq Filter Instead of Full Read**

- **Priority**: Low
- **Current State**: Read complete messages.json
- **Suggestion**: Extract key fields with jq first
- **Location**: Analysis process
- **Expected Benefit**: Reduce ~60% tokens

---

### Summary

| Layer | Result | Explanation |
|-------|--------|-------------|
| L1 Engineering Correctness | ✓ Pass | No errors |
| L2 Goal Achievement | ✓✓ Good | Core achieved, Timeline missing |
| L3 Optimization Space | 2 suggestions | Visualization + Efficiency |

**Core Issue**: 
1. Timeline missing visualization chart

**Priority Improvement**:
1. [Medium] Add visualization requirement to SKILL.md Step 3
```
