# Qoder Platform Research

> **Date**: 2026-02-02
> **Source**: Official docs (docs.qoder.com, qoder.com)

## Overview

Qoder is an Agentic Coding Platform, offering:
- AI-Native IDE
- CLI tool
- JetBrains plugin

**Key Stats**:
- 1M+ developers worldwide
- Up to 100k files supported for codebase analysis
- Up to 24h maximum agent execution time
- Spec-Driven Development philosophy

## Capability Matrix

| Capability | Support | Details |
|-----------|---------|---------|
| **Skills** | ✅ Yes | SKILL.md format, user-level/project-level |
| **Rules** | ✅ Yes | `.qoder/rules` directory, AGENTS.md compatible |
| **MCP** | ✅ Yes | Model Context Protocol |
| **Custom Agents** | ✅ Yes | `.qoder/agents/` directory |
| **Hooks** | ❌ No | No Stop Hook or lifecycle hooks |

## L1/L2 Classification

**Conclusion: Qoder = L1 (Skills Only)**

- ✅ Full Skills support (auto/manual trigger)
- ✅ Rules support + AGENTS.md compatibility
- ❌ No Stop Hook, cannot auto-detect decision precipitation

## Skills Support

### Storage Locations

| Location | Path | Scope |
|----------|------|-------|
| Personal | `~/.qoder/skills/{skill-name}/SKILL.md` | All projects |
| Project | `.qoder/skills/{skill-name}/SKILL.md` | Current project |

> Project Skills override Personal Skills with the same name.

### Directory Structure

```
{skill-name}/
├── SKILL.md          # Required: main file
├── REFERENCE.md      # Optional
├── EXAMPLES.md       # Optional
├── scripts/          # Optional: helper scripts
└── templates/        # Optional: template files
```

### SKILL.md Format

```markdown
---
name: skill-name
description: Brief description of functionality and when to use
---

# Skill Name

## Instructions
Provide clear step-by-step guidance.

## Examples
Show specific usage examples.
```

**Frontmatter Fields**:

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Lowercase, numbers, hyphens; max 64 chars |
| `description` | Yes | Max 1024 chars |

### Invocation Methods

1. **Automatic Trigger**: Model decides based on description
   ```
   Analyze the errors in this log file
   ```
2. **Manual Trigger**: `/skill-name`
   ```
   /log-analyzer
   ```

### Installation via CLI

```bash
# Install from skills.sh marketplace
npx skills add vercel-labs/agent-browser -a qoder

# Install from GitHub
npx skills add https://github.com/anthropics/skills --skill skill-creator -a qoder
```

## Rules Support

### Storage Location

- `.qoder/rules` directory
- Shared with team via Git

### Rule Types

| Type | Description | Use Case |
|------|-------------|----------|
| Apply Manually | Apply via `@rule` manually | On-demand workflows |
| Model Decision | AI decides when to apply | Scenario-specific tasks |
| Always Apply | Always applied to all requests | Project standards |
| Specific Files | Match specific file patterns | Language/directory specific rules |

### AGENTS.md Compatibility

Qoder is fully compatible with AGENTS.md:
1. Place `AGENTS.md` in project directory
2. Agent automatically recognizes and uses it
3. No additional configuration required

> When conflicts occur, Rules content takes precedence over AGENTS.md

### Limitations

- Maximum 100,000 characters (total across all rule files)
- Natural language only, no images or links

## Custom Agents

### Storage Locations

- User-level: `~/.qoder/agents/`
- Project-level: `${project}/.qoder/agents/`

### Format

`.md` files with frontmatter metadata and system prompt.

## Skills vs Commands

| Feature | Skill | Command |
|---------|-------|---------|
| Trigger | Automatic + `/skill-name` | Manual `/command-name` |
| Use | Domain expertise, workflows | Quick preset tasks |
| Storage | `skills/` | `commands/` |

## Implementation for discuss-for-specs

### Installation Target

```
~/.qoder/skills/discuss-for-specs/SKILL.md
```

Or project-level:

```
.qoder/skills/discuss-for-specs/SKILL.md
```

### Required Content

1. **SKILL.md** - Main skill file
2. **L1 Guidance injection** - Inject "Precipitation Discipline" guidance

### Build Script Requirements

```javascript
// npm-package/scripts/build.js
platforms['qoder'] = {
  level: 'L1',
  skillPath: 'discuss-for-specs/SKILL.md',
  hasHooks: false,
  // Needs l1-guidance.md injection
};
```

### Alternative: AGENTS.md

Since Qoder is AGENTS.md compatible, could also consider installing via AGENTS.md format directly.

## Unique Advantages

1. **Skills CLI compatible** - Install directly via `npx skills add`
2. **AGENTS.md compatible** - No additional adaptation needed
3. **IDE + CLI unified** - Skills behave identically in both
4. **Quest Mode** - Supports autonomous agent execution for complex tasks

## References

- [Qoder Official](https://qoder.com/)
- [Qoder Docs](https://docs.qoder.com/)
- [Skills Documentation](https://docs.qoder.com/cli/Skills)
- [Rules Documentation](https://docs.qoder.com/user-guide/rules)
