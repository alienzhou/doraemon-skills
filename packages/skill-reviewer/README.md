# Skill Reviewer

> [中文文档](README_CN.md) | English

![Skill Reviewer](./assets/skill-reviewer.png)

A universal Skill review tool with two modes: **Definition Review** (default) for validating Skill quality, and **Execution Review** for analyzing runtime performance.

## What is This?

**Skill Reviewer** is an AI-native tool designed to systematically analyze and improve AI Skills quality, based on [**Claude's official skill building guidelines**](assets/the-complete-guideto-building-skills-for-claude.pdf) ([中文版](assets/skills构建指南.pdf)).

It provides:

- **Definition Review** (Default): Validate Skill structure, format, content, and triggers against a 20-item checklist
- **Execution Review** (Explicit): Analyze runtime performance through three-layer progressive analysis

Think of it as a linter + code review system for AI Skills.

## Two Review Modes

### Mode A: Definition Review (Default)

Validate Skill quality with a **20-item checklist** across four categories:

| Category     | Focus                | Items |
| ------------ | -------------------- | ----- |
| 📁 Structure | File/folder layout   | S1-S4 |
| 📋 Format    | YAML frontmatter     | F1-F5 |
| 📝 Content   | Instructions quality | C1-C8 |
| 🎯 Trigger   | Activation design    | T1-T3 |

### Mode B: Execution Review (Explicit)

Three-layer progressive analysis for runtime performance:

```
L1 Engineering Correctness ──▶ L2 Goal Achievement ──▶ L3 Optimization Space
   Is execution correct?         Is effect good?          Can it be better?
```

- **L1 (Engineering)**: Catches technical errors - syntax errors, failed calls, infinite loops
- **L2 (Goal)**: Evaluates effectiveness - is the task actually completed well?
- **L3 (Optimization)**: Identifies improvements - redundant calls, token efficiency, better approaches

## Features

- ✅ **Dual Mode**: Definition Review (default) + Execution Review (explicit)
- 📊 **Systematic**: 20-item checklist for definitions, 3-layer analysis for execution
- 🎯 **Actionable**: Provides specific, prioritized improvement suggestions
- 🔍 **Comprehensive**: Covers structure, format, content, triggers, and runtime

## Installation

### Prerequisites

- An AI editor that supports MCP Skills (Claude Code, Cursor, Windsurf, etc.)
- Access to filesystem (for symlinking)

### Install via Symlink

```bash
# Clone the repository
git clone https://github.com/vibe-x-ai/skill-reviewer.git
cd skill-reviewer

# Create symlink to your skills directory
ln -s $(pwd)/skill-reviewer ~/.claude/skills/skill-reviewer
```

### Verify Installation

After installation, the skill should appear in your AI editor's skill list. You can verify by asking your AI assistant:

```
"List available skills"
```

## Usage Guide

### In Claude Code

1. **Trigger the skill** by asking:

```
   "Review my skill"           # → Definition Review (default)
   "Check skill quality"       # → Definition Review
   "Analyze this execution"    # → Execution Review (explicit)
   "Review this trace"         # → Execution Review (explicit)
```

2. **For Definition Review** (default):

- Provide: Skill folder path (e.g., `./my-skill/`)
- Receive: 20-item checklist report with pass/warn/fail status

3. **For Execution Review** (explicit):

- Provide: Execution trace + original goal
- Optionally: Skill/Tool source code path
- Receive: L1/L2/L3 analysis report

**Example - Definition Review:**

```
You: Review my skill at ./my-skill/

Claude: [Reads folder structure, checks SKILL.md]
        [Runs 20-item checklist]
        [Generates review report]

# 🔍 Skill Review: my-skill
| Category | ✅ Pass | ⚠️ Warn | ❌ Fail |
|----------|---------|---------|--------|
| Structure | 4 | 0 | 0 |
| Format | 5 | 0 | 0 |
| Content | 6 | 2 | 0 |
| Trigger | 3 | 0 | 0 |
```

**Example - Execution Review:**

```
You: Analyze this skill execution

Claude: I'll help review the execution. Please provide:
1. [Required] Execution trace - The agent execution process
2. [Required] Execution goal - Your original prompt
3. [Optional] Which skill/tool was used?

You: [Paste execution trace]
     Goal: "Generate API documentation"

Claude: [Generates L1/L2/L3 analysis report]
```

### In Cursor

1. **Open Cursor** and ensure the skill is installed (symlinked to `~/.claude/skills/`)
2. **In chat or composer**, use natural language:

```
   "Review my skill at ./my-skill/"    # Definition Review
   "Check skill quality"                # Definition Review
   "Analyze this execution trace"       # Execution Review
```

3. **Provide context** by:

- Referencing skill folders with `@my-skill/`
- Pasting execution logs directly in chat
- Sharing terminal output

4. **Get instant feedback** with actionable suggestions

**Tips for Cursor:**

- Use `@skill-reviewer` to explicitly invoke the skill
- Reference skill folders for definition review
- Attach execution traces for runtime analysis

### In Others

If your editor supports MCP Skills:

1. **Install skill** via symlink to your editor's skills directory
2. **Trigger** by mentioning keywords:
   - Definition: "review skill", "check quality", "validate skill"
   - Execution: "analyze execution", "review trace"
3. **Follow prompts** to provide required inputs
4. **Review output** and apply suggestions

## What to Provide for Review

### For Definition Review (Default)

| Input                | Description                | Example                                         |
| -------------------- | -------------------------- | ----------------------------------------------- |
| **Skill Path** | Folder containing SKILL.md | `./my-skill/`, `~/.claude/skills/my-skill/` |

### For Execution Review (Explicit)

| Input                              | Required | Description                       |
| ---------------------------------- | -------- | --------------------------------- |
| **Execution Trace**          | ✅ Yes   | Complete agent/tool execution log |
| **Execution Goal**           | ✅ Yes   | Original user prompt              |
| **Implementation Reference** | Optional | Skill/Tool source code            |
| **Agent Implementation**     | Optional | Agent source code                 |

### Example Execution Trace

```
User: Generate API docs
↓
Agent: Reading openapi.yaml
Agent: Calling tool: parse_openapi(file="openapi.yaml")
Tool Output: [parsed structure]
Agent: Calling tool: generate_markdown(...)
Tool Output: docs/api.md created
Result: ✓ Documentation generated
```

## Output Examples

### Definition Review Output

```markdown
# 🔍 Skill Review: my-skill

> Path: `./my-skill/`

## 📊 Summary

| Category | ✅ Pass | ⚠️ Warn | ❌ Fail |
|----------|---------|---------|--------|
| Structure | 4 | 0 | 0 |
| Format | 5 | 0 | 0 |
| Content | 6 | 2 | 0 |
| Trigger | 3 | 0 | 0 |
| **Total** | **18** | **2** | **0** |

## 📁 Structure
- ✅ **S1 SKILL.md exists**
- ✅ **S2 References folder** — Has references/ with support files

## 💡 Improvements
- C3: Add troubleshooting section
- C5: Include end-to-end example
```

### Execution Review Output

```markdown
## Execution Review Report

### Basic Information
| Item | Content |
|------|---------|
| Analysis Target | doc-generator skill |
| Execution Goal | "Generate API documentation" |

### L1: Engineering Correctness ✓
✓ All tool calls successful
✓ No syntax errors
✓ Files created correctly

### L2: Goal Achievement ✓✓✓
✓✓✓ Excellent
- Documentation generated with correct structure
- All API endpoints covered

### L3: Optimization Space 💡
1. **Token Efficiency**: File read twice unnecessarily
2. **Implementation**: Could cache parsed OpenAPI structure
```

## Project Structure

```
skill-reviewer/
├── skill-reviewer/               # Main skill
│   ├── SKILL.md                  # Skill definition (two modes)
│   └── references/
│       ├── definition-checklist.md   # 20-item checklist (S/F/C/T)
│       ├── definition-report.md      # Definition review template
│       ├── input-guide.md            # Execution review inputs
│       ├── analysis-dimensions.md    # L1/L2/L3 checklists
│       ├── execution-guide.md        # Execution plan generation
│       ├── scenarios.md              # Usage scenarios
│       └── report-templates.md       # Report formats
├── .discuss/                     # Design documents
├── AGENTS.md                     # Skill development guide
├── README.md                     # This file
└── README_CN.md                  # Chinese documentation
```

## Documentation

- **[SKILL.md](skill-reviewer/SKILL.md)** - Complete skill specification (two modes)
- **[definition-checklist.md](skill-reviewer/references/definition-checklist.md)** - 20-item quality checklist
- **[definition-report.md](skill-reviewer/references/definition-report.md)** - Definition review template
- **[input-guide.md](skill-reviewer/references/input-guide.md)** - Four input dimensions for execution review
- **[analysis-dimensions.md](skill-reviewer/references/analysis-dimensions.md)** - L1/L2/L3 checklists
- **[scenarios.md](skill-reviewer/references/scenarios.md)** - Common usage scenarios
- **[report-templates.md](skill-reviewer/references/report-templates.md)** - Output formats

## Contributing

We welcome contributions! Please see [AGENTS.md](AGENTS.md) for:

- Skill development standards
- Design principles
- SKILL.md requirements
- Best practices

## Use Cases

### 1. Validating New Skills

```
Scenario: Built a new skill, want to verify quality
Action: "Review my skill at ./new-skill/"
Result: Get 20-item checklist report, fix issues before publishing
```

### 2. Debugging Failed Executions

```
Scenario: Agent task failed, unsure why
Action: "Analyze this execution trace" + paste logs
Result: L1 analysis identifies specific error
```

### 3. Improving Skill Quality

```
Scenario: Skill works but could be better
Action: Definition review for structure + Execution review for runtime
Result: Comprehensive improvement suggestions
```

### 4. Learning Best Practices

```
Scenario: New to skill development
Action: Review example skills to understand patterns
Result: Learn from pass/warn/fail feedback
```

## FAQ

**Q: What's the difference between Definition Review and Execution Review?**
A: Definition Review checks Skill quality (SKILL.md structure, content). Execution Review analyzes runtime performance (tool calls, errors, efficiency).

**Q: When should I use which mode?**
A: Use Definition Review (default) when building/improving Skills. Use Execution Review when debugging runtime issues or optimizing performance.

**Q: Do I need to provide all inputs?**
A: For Definition Review, just provide the skill path. For Execution Review, trace + goal are required; others enhance analysis depth.

**Q: Can it review any Skill?**
A: Yes! It works with any SKILL.md-based Skill regardless of implementation.

**Q: How long does a review take?**
A: Definition Review: ~30 seconds. Execution Review: 1-2 minutes for full L1-L3 analysis.

**Q: Can I customize the checklist?**
A: The 20-item checklist is standard, but you can fork and modify for specific needs.

## License

MIT License - See LICENSE file for details

---

**Built for AI-native development** 🚀

*Based on Claude's official skill building guidelines*
