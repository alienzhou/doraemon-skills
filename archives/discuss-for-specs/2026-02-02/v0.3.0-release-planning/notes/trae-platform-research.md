# Trae Platform Research

> **Date**: 2026-02-02
> **Source**: Official docs (trae.ai, docs.trae.ai, traeide.com)

## Overview

Trae is an AI-powered IDE developed by ByteDance, built on VSCode architecture. It offers free unlimited access to GPT-4o and Claude-3.5-Sonnet.

**Latest Version**: v1.3.0+

## Capability Matrix

| Capability | Support | Details |
|-----------|---------|---------|
| **Skills** | ✅ Yes | Based on agentskills.io open standard, SKILL.md format |
| **Rules** | ✅ Yes | `.trae/project_rules.md` / `user_rules.md` |
| **MCP** | ✅ Yes | JSON-RPC 2.0, supports stdio/SSE |
| **Hooks** | ❌ No | No Stop Hook or lifecycle hooks |

## L1/L2 Classification

**Conclusion: Trae = L1 (Skills Only)**

- ✅ Full Skills support (on-demand loading)
- ✅ Rules support (always loaded)
- ❌ No Stop Hook, cannot auto-detect decision precipitation

## Skills Support

### Structure

```
your-skill/
├── SKILL.md          # Required: Core instructions
├── examples/         # Optional
├── templates/        # Optional
└── resources/        # Optional
```

### SKILL.md Format

```markdown
---
name: Skill Name
description: Brief description
---

# Skill Name

## Description
...

## When to Use
...

## Instructions
...
```

### Invocation Methods

1. **Explicit**: `"Use the codemap skill to..."`
2. **Implicit**: Auto-match based on "When to Use" description

### Key Difference: Skills vs Rules

| Aspect | Rules | Skills |
|--------|-------|--------|
| Loading | Always on | On demand |
| Context usage | Continuous | Only when invoked |
| Use case | Preferences, coding style | Workflows, domain knowledge |

## Rules Configuration

### File Paths

- **Project-level**: `.trae/project_rules.md`
- **User-level**: `.trae/user_rules.md`

### Format

Markdown format, supports:
- Naming conventions
- Project standards
- Commenting requirements
- etc.

### Example

```markdown
## Naming Conventions
Variables use camelCase, components use PascalCase.

## React Project Conventions
- Use Hooks
- Use Zustand for state management
- Avoid direct DOM manipulation
```

## MCP Configuration

### File Paths

- **Global**: `~/.cursor/mcp.json`
- **Project-level**: `.trae/mcp.json`

### Example (stdio)

```json
{
  "mcpServers": [
    {
      "name": "supabase_local",
      "command": ["supabase", "mcp"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_TOKEN"
      }
    }
  ]
}
```

## Implementation for discuss-for-specs

### Installation Target

```
~/.trae/skills/discuss-for-specs/SKILL.md
```

Or project-level:

```
.trae/skills/discuss-for-specs/SKILL.md
```

### Required Content

1. **SKILL.md** - Main skill file
2. **L1 Guidance injection** - Since no Hooks, inject "Precipitation Discipline" guidance

### Build Script Requirements

```javascript
// npm-package/scripts/build.js
platforms['trae'] = {
  level: 'L1',
  skillPath: 'discuss-for-specs/SKILL.md',
  hasHooks: false,
  // Needs l1-guidance.md injection
};
```

## Current Limitations

1. No GUI configuration interface (MCP / Rules)
2. `.rules` lacks official syntax specification
3. Not friendly for non-technical users

## References

- [Trae Official](https://www.trae.ai/)
- [Trae Docs](https://docs.trae.ai/)
- [Agent Skills Best Practices](https://www.trae.ai/blog/trae_tutorial_0115)
- [v1.3.0 Release Notes](https://traeide.com/news/6)
