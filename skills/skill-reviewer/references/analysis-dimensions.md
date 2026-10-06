# Three-Layer Analysis Checklist

## Contents

- **L1: Engineering Correctness** — tool calls, script errors, linter/syntax, infinite loops
  - Checklist / Error Keywords / Loop Detection Rules
- **L2: Goal Achievement** — goal understanding, key steps, output quality
  - Checklist / Rating Standards / Process Comparison Method
- **L3: Optimization Space** — efficiency, implementation, conciseness (MUST check all three)
  - [MUST] Efficiency Optimization
  - [MUST] Tool/Implementation Optimization
  - [MUST] Conciseness Check
  - [OPTIONAL] Execution Plan Generation
- **Common Issues Quick Reference** — by-layer triage for L1 / L2 / L3

---

## L1: Engineering Correctness

### Checklist

```
L1 Checklist
├── Tool Calls
│   ├── [ ] All tool calls return success?
│   ├── [ ] No "error"/"failed" responses?
│   ├── [ ] Parameter format correct (valid JSON, path exists)?
│   └── [ ] No permission issues?
│
├── Script Execution
│   ├── [ ] Shell command exit code = 0?
│   ├── [ ] No "Permission denied"?
│   ├── [ ] No "command not found"?
│   └── [ ] No timeout?
│
├── Code Quality
│   ├── [ ] No Linter errors?
│   ├── [ ] No syntax errors?
│   └── [ ] No type errors?
│
└── Execution Flow
    ├── [ ] Execution complete (not terminated unexpectedly)?
    ├── [ ] No infinite loop (5+ consecutive identical calls)?
    └── [ ] No timeout interruption?
```

### Error Keywords

| Keyword | Meaning |
|---------|---------|
| "error" | General error |
| "failed" | Operation failed |
| "not found" | File/command not found |
| "denied" | Permission denied |
| "timeout" | Timeout |
| "exit code: 1" | Script failed |

### Loop Detection Rules

```
If N consecutive calls satisfy:
- Same tool name
- Similar parameters (>80% similarity)
- Similar results

Then judged as loop. Thresholds:
- replace_in_file: 3 times
- read_file: 3 times
- grep_search: 5 times
- Others: 5 times
```

---

## L2: Goal Achievement

### Checklist

```
L2 Checklist
├── Goal Understanding
│   ├── [ ] Agent correctly understands user intent?
│   ├── [ ] Selected correct Skill/method?
│   └── [ ] Correctly defined task scope?
│
├── Process Coverage
│   ├── [ ] All key steps executed?
│   ├── [ ] No important steps skipped?
│   └── [ ] Execution order correct?
│
├── Output Quality
│   ├── [ ] Format matches expectation?
│   ├── [ ] Content complete, no omissions?
│   ├── [ ] High accuracy?
│   └── [ ] Good readability?
│
└── Tool Behavior (when analyzing Tool)
    ├── [ ] Parameters used reasonably?
    ├── [ ] Return values handled correctly?
    └── [ ] Meets tool design intent?
```

### Rating Standards

| Level | Condition | Description |
|-------|-----------|-------------|
| ✓✓✓ Excellent | 100% goal + excellent quality + extra value | Exceeds expectation |
| ✓✓ Good | 100% goal + good quality | Meets expectation |
| ✓ Pass | Core achieved + omissions but usable | Basically usable |
| ✗ Fail | Core not achieved or unusable | Needs rework |

### Process Comparison Method

```
1. Extract step list from SKILL.md
2. Find corresponding execution in trace one by one
3. Mark status:
   ✓ Fully executed
   △ Partially executed
   ✗ Skipped
   ? Cannot determine
```

---

## L3: Optimization Space

**Execution Rule**: All [MUST] dimensions must be checked and reported in output.

### [MUST] Efficiency Optimization

### Checklist

```
L3 Checklist
├── Efficiency Optimization
│   ├── [ ] Any redundant calls?
│   ├── [ ] Steps that can be merged?
│   ├── [ ] Repeated reads of same file?
│   └── [ ] Unnecessary wide searches?
│
├── Token Optimization
│   ├── [ ] Read unnecessarily large files?
│   ├── [ ] Output too verbose?
│   ├── [ ] Too many intermediate results?
│   └── [ ] Can use simpler approach?
│
├── Tool/Implementation Optimization
│   ├── [ ] More suitable tool available?
│   ├── [ ] Parameter definition can be improved?
│   ├── [ ] Description can be optimized?
│   └── [ ] Scripts can be simplified?
│
└── Agent Optimization (if source available)
    ├── [ ] System prompt can be improved?
    ├── [ ] Tool list can be adjusted?
    └── [ ] Decision logic can be optimized?
```

### Common Optimization Patterns

| Pattern | Detection | Optimization |
|---------|----------|-------------|
| Consecutive grep | grep A; grep B; grep C | grep "A\|B\|C" |
| Repeated file reads | read f; ...; read f | Cache results |
| Full file read | read large file | grep first then read |
| One-by-one processing | Loop tool calls | Batch script |

### [MUST] Tool/Implementation Optimization

### Suggestion Categories

```
Optimization Suggestions
├── For Skill
│   ├── SKILL.md description
│   ├── scripts/ scripts
│   └── references/ documentation
│
├── For Tool
│   ├── Parameter definition
│   ├── Description
│   └── Return format
│
└── For Agent
    ├── System prompt
    ├── Tool list
    └── Decision logic
```

### [MUST] Conciseness Check

**Principle**: Conciseness serves clarity. Don't sacrifice clarity for brevity.

```
Conciseness Check
├── Reference Thresholds (Advisory, not mandatory)
│   ├── SKILL.md > 150 lines → ⚠️ Consider if simplifiable
│   ├── Single reference doc > 200 lines → ⚠️ Consider splitting/simplifying
│   └── Note: Complex features may need more. Don't over-split for numbers.
│
├── Redundancy Check (Real issues)
│   ├── [ ] Duplicate content? → Remove or merge
│   ├── [ ] Too much explanation, too few templates? → Agent understands concise templates
│   └── [ ] Too many examples? → 1-2 usually enough
│
└── Clarity Preservation (Prerequisite)
    ├── [ ] Still clear after simplification?
    ├── [ ] Key information retained?
    └── [ ] Avoid over-splitting that fragments logic
```

**When to Flag**:
- If redundancy found → **Must fix**
- If exceeds thresholds → ⚠️ **Warning**, check if simplifiable
- If unclear → **Clarity over brevity**

### [OPTIONAL] Execution Plan Generation (When user adopts suggestions)

When user adopts suggestions, generate execution plan with:

**Required Components:**
- [ ] Context loading map (L0-L3 progressive loading)
- [ ] Best practices checklist (modular design, progressive disclosure, etc.)
- [ ] Step-by-step execution guidance (imperative tone)
- [ ] Verification checklist (completeness, correctness, standards, functionality)

**Context Loading Map Requirements:**
- [ ] L0 core context identified (target files to modify)
- [ ] L1 reference context identified (similar patterns, related files)
- [ ] L2 pattern context identified (best practice documents)
- [ ] L3 extended context noted (if needed, external dependencies)

**Best Practices Coverage:**
- [ ] Modular design principles checked
- [ ] Progressive disclosure pattern verified
- [ ] Clear activation conditions ensured
- [ ] Error handling considered
- [ ] Documentation synchronization planned

**Execution Guidance Quality:**
- [ ] Steps are specific (file paths, line numbers, exact locations)
- [ ] Rationale provided for each step
- [ ] Examples included where helpful
- [ ] Tone shifted to imperative (second person)

> Execution-plan generation rules live in the Execution Plan Generation Guide,
> which `SKILL.md` links to directly.

---

## Common Issues Quick Reference

### L1 Common Issues

| Issue | Manifestation | Common Causes |
|-------|--------------|---------------|
| Path error | "not found" | Mixed relative/absolute paths |
| Permission denied | "permission denied" | Sandbox restrictions |
| Command not found | "command not found" | Environment/dependency issues |
| Infinite loop | Repeated identical calls | Condition not converging |
| Invalid parameter | "invalid argument" | JSON format error |

### L2 Common Issues

| Issue | Manifestation | Common Causes |
|-------|--------------|---------------|
| Step skipped | Incomplete output | SKILL.md unclear |
| Format error | Table/chart abnormal | No output examples |
| Shallow analysis | Only describes phenomena | Analysis method unclear |
| Goal deviation | Did something but wrong | Intent misunderstanding |

### L3 Common Issues

| Issue | Manifestation | Optimization Direction |
|-------|--------------|------------------------|
| Repeated calls | N times same tool | Batch processing |
| Token waste | Read large file fully | Search first then read |
| Inefficient tool | grep to find files | Use glob |
| Verbose output | Too many intermediate results | Simplify output |
