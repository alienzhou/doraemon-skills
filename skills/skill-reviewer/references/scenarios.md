# Typical Analysis Scenarios Guide

## Default Mode: Definition Review

**Default behavior**: When user says "review skill", use **Definition Review** mode.

**Execution Review**: Only when user **explicitly** mentions "analyze execution", "review trace", or "执行过程评估".

| Mode | When to Use | Input |
|------|-------------|-------|
| **Definition Review** (Default) | "review skill", "check quality", "validate" | Skill folder path |
| **Execution Review** (Explicit only) | "analyze execution", "review trace" | Execution trace + goal |

---

# Mode A: Definition Review Scenarios

## Scenario A1: Pre-publish Check

**Input:** Skill folder path

**Applicable:**
- About to publish a new Skill
- Want to verify it meets standards
- Quick quality check

**Workflow:**
```
Step 1: Read Skill folder structure
        ls -la ${SKILL_PATH}/
        
Step 2: Check Structure (S1-S4)
        - SKILL.md exists?
        - Folder naming kebab-case?
        - Directory structure correct?
        
Step 3: Check Format (F1-F5)
        - YAML frontmatter valid?
        - name field correct?
        - description field present?
        
Step 4: Check Content (C1-C8)
        - Description has WHAT and WHEN?
        - Instructions actionable?
        - Examples provided?
        
Step 5: Check Trigger (T1-T3)
        - Trigger phrases clear?
        - Scope appropriate?
        
Step 6: Output report with Summary + Details + Comments
```

> See `references/definition-checklist.md` for complete checklist
> See `references/definition-report.md` for report template

---

## Scenario A2: Post-modification Validation

**Input:** Skill folder path + Change context

**Applicable:**
- Just modified a Skill
- Want to ensure changes don't break things
- Regression check

**Workflow:**
```
Step 1: Read current Skill state
Step 2: Run full checklist (S1-T3)
Step 3: Focus on areas likely affected by changes
Step 4: Output report highlighting potential issues
```

---

## Scenario A3: Quality Improvement

**Input:** Skill folder path + "want to improve"

**Applicable:**
- Skill works but want to make it better
- Looking for optimization opportunities
- Learning best practices

**Workflow:**
```
Step 1: Run full checklist
Step 2: Focus on ⚠️ warnings (not just ❌ failures)
Step 3: Provide detailed improvement suggestions
Step 4: Reference best practices from guide
```

---

# Mode B: Execution Review Scenarios

## Scenario B1: Quick Troubleshooting

**Input:** Execution trace + Execution goal

**Applicable:**
- Don't know what Skill was used
- Just want to quickly check for obvious errors
- Initial problem direction identification

**Analysis Capability:**
```
✓ L1 Engineering correctness check
  - Tool call errors
  - Script execution failures
  - Loop detection

△ L2 Goal achievement (limited)
  - Can only compare goal with final output
  - Cannot check step coverage

✗ L3 Optimization suggestions
  - Missing implementation reference, cannot give specific suggestions
```

**Workflow:**
```
1. Scan trace for error keywords
   grep: "error", "failed", "denied", "not found"

2. Detect loops
   Count consecutive identical tool calls

3. Compare goal with output
   Goal requirements vs actual output

4. Output L1 results + preliminary L2 judgment
```

---

## Scenario B2: Skill Execution Analysis

**Input:** Execution trace + Execution goal + Skill implementation

**Applicable:**
- Used specific Skill but effect not good
- Want to optimize Skill implementation
- Verify Skill design is correctly executed

**Analysis Capability:**
```
✓ L1 Engineering correctness check
✓ L2 Goal achievement
  - Step coverage check
  - Output format comparison
  - Quality assessment
✓ L3 Optimization suggestions
  - For SKILL.md
  - For scripts/
  - For references/
```

**Workflow:**
```
Step 1: Read Skill implementation
        cat ${SKILL_PATH}/SKILL.md
        ls ${SKILL_PATH}/

Step 2: Extract design elements
        - Workflow steps
        - Expected output format
        - Key scripts

Step 3: L1 check
        Scan errors, detect loops

Step 4: L2 comparison
        Design steps vs actual execution
        Mark: ✓ executed / ✗ skipped / △ partial

Step 5: L3 suggestions
        Propose improvements for deviation points
```

**L3 Suggestion Categories:**
```
For SKILL.md:
├── Step description unclear → Improve description
├── Key step skipped → Add emphasis markers
└── Output examples missing → Add examples/

For scripts/:
├── Script has bug → Fix
├── Error handling insufficient → Enhance
└── Efficiency issues → Optimize

For references/:
├── Documentation missing → Add
└── Examples outdated → Update
```

---

## Scenario B3: Tool Execution Analysis

**Input:** Execution trace + Execution goal + Tool implementation

**Applicable:**
- A Tool call effect not good
- Want to optimize Tool parameter design
- Tool return value doesn't meet expectation

**Analysis Capability:**
```
✓ L1 Engineering correctness check
✓ L2 Goal achievement
  - Are parameters used correctly
  - Are return values handled correctly
  - Does it meet Tool design intent
✓ L3 Optimization suggestions
  - Parameter definition optimization
  - Return format improvement
  - Description improvement
```

**Workflow:**
```
Step 1: Read Tool implementation
        cat path/to/tool/implementation.ts

Step 2: Extract Tool design
        - Parameter schema
        - Description
        - Processing logic
        - Return format

Step 3: L1 check
        - Is call successful
        - Are parameters valid

Step 4: L2 comparison
        - Does parameter use match design
        - Are return values correctly understood
        - Does it achieve expected effect

Step 5: L3 suggestions
        - Parameter design improvement
        - Description optimization
        - Error handling enhancement
```

**L3 Suggestion Categories:**
```
For Tool definition:
├── Description unclear → Improve description
├── Parameter design unreasonable → Optimize schema
└── Return format messy → Standardize

For Tool implementation:
├── Error handling insufficient → Add boundary checks
├── Return information insufficient → Enrich return content
└── Performance issues → Optimize logic
```

---

## Scenario B4: Agent Deep Analysis

**Input:** Execution trace + Execution goal + Skill + Agent implementation

**Applicable:**
- Analyzing your own developed Agent
- Agent behavior doesn't match expectation
- Want to optimize Agent decision logic

**Analysis Capability:**
```
✓ L1 Engineering correctness check
✓ L2 Goal achievement
  - Skill step coverage
  - Is Agent decision reasonable
✓ L3 Deep optimization suggestions
  - Skill improvement
  - Tool improvement
  - System prompt improvement
  - Agent logic improvement
```

**Workflow:**
```
Step 1: Read all implementations
        # Skill
        cat ${SKILL_PATH}/SKILL.md
        
        # Agent
        cat ${AGENT_PATH}/system-prompt.md
        cat ${AGENT_PATH}/tools/*.ts

Step 2: Establish relationships
        Skill instruction → Agent understanding → Tool call

Step 3: L1 check
        Full-chain error check

Step 4: L2 comparison
        - Skill design vs Agent execution
        - Agent decision vs Tool call
        - Tool result vs final output

Step 5: L3 deep suggestions
        Locate which layer has the problem
```

**Problem Location Layers:**
```
Problem may be at:
├── Skill layer
│   └── Instruction unclear, Agent misunderstood
│
├── Agent layer
│   ├── System prompt missing constraints
│   ├── Tool definition description inaccurate
│   └── Decision logic has issues
│
└── Tool layer
    └── Implementation has bug, return value abnormal
```

---

## Scenario Selection Guide

```
Start
  │
  ├─ Want to check Skill definition quality?
  │     └─ Mode A (Definition Review)
  │           ├─ Pre-publish? → A1
  │           ├─ After modification? → A2
  │           └─ Want to improve? → A3
  │
  └─ Want to analyze execution?
        └─ Mode B (Execution Review)
              ├─ Quick check? → B1 (Minimal)
              ├─ Skill issue? → B2 (Skill Analysis)
              ├─ Tool issue? → B3 (Tool Analysis)
              └─ Agent deep analysis? → B4 (Deep)
```
