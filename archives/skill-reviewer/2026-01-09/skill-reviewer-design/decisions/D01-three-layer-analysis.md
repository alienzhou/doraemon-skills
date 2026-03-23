# Three-Layer Analysis Framework

## Decision

Use a progressive three-layer analysis framework for execution review:
- **L1: Engineering Correctness** - Is execution correct?
- **L2: Goal Achievement** - Is the effect good?
- **L3: Optimization Space** - Can it be better?

## Context

When reviewing Skill/Tool/Agent execution, we need to answer multiple questions:
1. Did it execute correctly? (Technical correctness)
2. Did it achieve the goal? (Effectiveness)
3. Can it be improved? (Optimization)

These questions have dependencies:
- If L1 fails, L2/L3 are less relevant
- If L2 fails, L3 is less relevant
- L3 only makes sense when L1+L2 pass

## Rationale

### Progressive Analysis

The three layers form a natural progression:
```
L1 (Foundation) → L2 (Core) → L3 (Enhancement)
```

Each layer builds on the previous:
- L1 must pass before meaningful L2 analysis
- L2 must at least pass before L3 suggestions are useful

### Clear Separation of Concerns

- **L1**: Technical issues (blocking problems)
- **L2**: Effectiveness issues (goal achievement)
- **L3**: Efficiency issues (optimization opportunities)

This separation helps:
- Prioritize fixes (L1 > L2 > L3)
- Focus analysis (don't optimize broken code)
- Provide actionable feedback

## Implementation

### L1: Engineering Correctness

**Question**: Is execution correct?

**Checks**:
- Tool calls successful?
- Scripts execute without errors?
- No Linter/syntax errors?
- No infinite loops?

**Output**: Pass/Fail + blocking issues

### L2: Goal Achievement

**Question**: Is the effect good?

**Checks**:
- Goal correctly understood?
- Key steps executed?
- Output format/quality?

**Output**: Rating (✓✓✓/✓✓/✓/✗) + deviation analysis

### L3: Optimization Space

**Question**: Can it be better?

**Prerequisite**: L1 pass + L2 at least pass

**Checks**:
- Redundant calls?
- Token efficiency?
- Implementation improvements?

**Output**: Specific suggestions with priorities

## Alternatives Considered

### Single-Layer Analysis
- **Rejected**: Too simplistic, doesn't distinguish technical vs effectiveness issues

### Two-Layer Analysis (Correctness + Quality)
- **Rejected**: Missing optimization dimension, less actionable

### Four-Layer Analysis
- **Rejected**: Too complex, diminishing returns

## Consequences

### Positive
- Clear analysis structure
- Actionable feedback
- Easy to understand and use

### Negative
- Requires more input (implementation reference for L2/L3)
- More complex than simple pass/fail

## Status

✅ Implemented

## Related Decisions

- Four Input Dimensions
- Progressive Disclosure Documentation
