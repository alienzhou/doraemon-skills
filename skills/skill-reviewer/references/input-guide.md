# Four Input Dimensions - Detailed Guide

## Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    Four Input Dimensions                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   [Required] 1. Execution Trace   [Optional] 3. Implementation   │
│   Agent execution process         Reference (choose based on      │
│   • Tool calls sequence           analysis target):               │
│   • Output content                • Skill → SKILL.md              │
│   • Error information             • Tool → Tool source            │
│                                   • Both → Read both              │
│                                                                    │
│   [Required] 2. Execution Goal    [Optional] 4. Agent            │
│   User's original prompt          Implementation                  │
│   What to achieve                 Target Agent source              │
│                                   • System prompt                 │
│                                   • Tool definitions              │
│                                   • Core logic                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Input 1: Execution Trace (Required)

Complete Agent execution process.

### What to Include

```markdown
1. Tool calls sequence
   - Tool name
   - Call parameters
   - Return results

2. Agent output content
   - Thinking process (if visible)
   - Final output

3. Error information
   - Tool call errors
   - Script execution errors
   - Any exceptions
```

### How to Obtain

| Environment | Method |
|-------------|--------|
| Claude Code | Copy conversation history |
| IDE Agent | Export execution logs |
| API calls | Save response |

### Example

```
Tool: grep_search
Parameters: {"pattern": "TODO", "path": "./src"}
Result: Found 3 matches...

Tool: read_file  
Parameters: {"path": "./src/main.ts"}
Result: [file content]

Agent Output:
Found 3 TODO items...
```

---

## Input 2: Execution Goal (Required)

User's original prompt.

### Key Points

- Complete user input
- Include context information
- Clear expected results

### Example

```markdown
Good example:
"Help me analyze chatId abc123's agent stuck issue,
 this agent keeps failing when executing replace_in_file"

Bad example:
"Help me check" ← Missing context
```

---

## Input 3: Implementation Reference (Optional)

Read corresponding implementation based on analysis target.

### Skill Analysis

```bash
# Read Skill definition
cat skills/${SKILL_NAME}/SKILL.md

# Understand available resources
ls skills/${SKILL_NAME}/

# Read key scripts
cat skills/${SKILL_NAME}/scripts/*.sh
```

**Extract content:**
- Design goals (Overview)
- Workflow
- Expected output (Output Format)

### Tool Analysis

```bash
# Read Tool implementation
cat path/to/tool/implementation.ts

# Or read Tool definition
cat path/to/tools.json | jq '.[] | select(.name == "tool_name")'
```

**Extract content:**
- Parameter definitions
- Processing logic
- Return format
- Error handling

### Mixed Analysis

When Skill uses custom Tools:

```bash
# Read Skill first
cat skills/${SKILL_NAME}/SKILL.md

# Then read scripts/tools referenced in Skill
cat skills/${SKILL_NAME}/scripts/*.sh
```

---

## Input 4: Agent Implementation (Optional)

Use when analyzing your own developed Agent.

### Applicable Scenarios

| Scenario | Need Agent Implementation? |
|----------|---------------------------|
| Analyze Skill in Claude Code | ❌ Not needed |
| Analyze IDE Agent issues | ✅ Needed |
| Analyze custom Tool effectiveness | ⚡ Optional |

### What to Read

```bash
# System Prompt
cat ${AGENT_PATH}/system-prompt.md
cat ${AGENT_PATH}/prompts/*.md

# Tool definitions
cat ${AGENT_PATH}/tools/*.ts
cat ${AGENT_PATH}/tools.json

# Core logic
cat ${AGENT_PATH}/agent.ts
cat ${AGENT_PATH}/handler.ts
```

### Analysis Value

With Agent implementation, can analyze:

1. **System Prompt Issues**
   - Are instructions clear?
   - Are there missing constraints?

2. **Tool Definition Issues**
   - Is parameter design reasonable?
   - Is description accurate?

3. **Decision Logic Issues**
   - Tool selection logic
   - Error handling strategy

---

## Input Combination Scenarios

### Scenario A: Minimal Analysis

```
Input: Trace + Goal
Can do: L1 basic check
```

### Scenario B: Skill Analysis

```
Input: Trace + Goal + Skill
Can do: L1 + L2 + L3 (for Skill)
```

### Scenario C: Tool Analysis

```
Input: Trace + Goal + Tool
Can do: L1 + L2 + L3 (for Tool)
```

### Scenario D: Deep Analysis

```
Input: Trace + Goal + Skill + Agent
Can do: L1 + L2 + L3 (Skill + Agent)
```

---

## User Guidance Template

```markdown
Please provide the following information for analysis:

**Required:**
1. **Execution Trace** - Paste Agent's complete execution process
   - Tool calls (tool name, parameters, results)
   - Agent output content
   - Any error information

2. **Execution Goal** - Your original prompt to Agent

**Optional (recommended):**
3. **Analysis Target** - What do you want to analyze?
   - [ ] Skill → Provide Skill name
   - [ ] Tool → Provide Tool name or source path
   
4. **Agent Source** - Analyzing your own Agent?
   - [ ] Yes → Provide Agent source path
   - [ ] No → Skip
```
