# Discuss Mode v1 - Cross-Platform Distribution Architecture

> **Project**: skill-discuss-for-specs  
> **Version**: v0.2.0  
> **Created**: 2026-01-19  
> **Last Updated**: 2026-01-28  
> **Status**: Design confirmed, implementation in progress

---

## Overview

This project adopts spec-kit's cross-platform distribution architecture to provide unified cross-platform distribution capabilities for the `discuss-mode` Skill. Through standardized Skill format, centralized configuration management, and npm distribution mechanism, we achieve the goal of "one set of content, multi-platform deployment".

### Core Objectives

1. **Cross-Platform Support**: Cover Claude Code, Cursor, GitHub Copilot, Windsurf, Gemini CLI
2. **Unified Distribution Format**: Use Skill as the primary distribution format
3. **Convenient Installation Experience**: One-command installation via `npx discuss-for-specs install`
4. **Low Maintenance Cost**: Centralized configuration management, adding new platforms only requires adding config entries

---

## Document Index

| No. | Document | Description |
|-----|----------|-------------|
| 2 | [Technical Research](./2-technical-research.md) | Platform Skills/Rules mechanism comparison study |
| 3 | [Architecture Design](./3-architecture.md) | Three-tier architecture design and decision records |
| 4 | [Task List](./4-task-list.md) | Development task breakdown and progress tracking |
| 5 | [Backlog](./5-backlog.md) | Items not included in current version |

---

## Key Decision Summary

### Original Decisions (2026-01-19)

| Decision | Conclusion | Details | Status |
|----------|------------|---------|--------|
| D1: Primary Distribution Format | Skill (`SKILL.md` + YAML frontmatter) | [Architecture - D1](./3-architecture.md#d1-skill-as-primary-distribution-format) | ✅ Active |
| D2: Header Separation Design | Preserve `headers/<platform>.yaml` separation | [Architecture - D2](./3-architecture.md#d2-preserve-header-separation-design) | ✅ Active |
| D3: Centralized Configuration | Create `config/platforms.yaml` | [Architecture - D3](./3-architecture.md#d3-adopt-centralized-configuration-management) | ✅ Active |
| D4: Distribution Method | Distribute installation commands via npm | [Architecture - D4](./3-architecture.md#d4-distribute-installation-commands-via-npm) | ✅ Active |
| D5: npm Package Design | Package name `discuss-for-specs`, Node.js implementation | [Architecture - D5](./3-architecture.md#d5-npm-package-design) | ✅ Active |
| D6: Pre-built Content | npm package includes pre-built SKILL.md files | [Architecture - D6](./3-architecture.md#d6-pre-built-content-in-npm-package) | ✅ Active |

### New Decisions (2026-01-28)

| Decision | Conclusion | Details | Status |
|----------|------------|---------|--------|
| D7: Skill Merge | Merge coordinator + output into single `discuss-mode` Skill | [Architecture - D7](./3-architecture.md#d7-skill-architecture-merge) | ✅ Active |
| D8: Directory Structure | Use `.discuss/YYYY-MM-DD/[topic]/` | [Architecture - D8](./3-architecture.md#d8-discussion-directory-structure) | ✅ Active |
| D9: meta.yaml Automation | Fully automated by Hooks, zero agent burden | [Architecture - D9](./3-architecture.md#d9-metayaml-programmatic-automation) | ✅ Active |
| D10: Hook Refactoring | Session-based round counting | [Architecture - D10](./3-architecture.md#d10-hook-refactoring) | ✅ Active |
| D11: Post-Discussion Guidance | Guidance response template when discussion ends | [Architecture - D11](./3-architecture.md#d11-post-discussion-guidance) | ✅ Active |
| D12: Response Depth | Three Roles + Problem Types + Discussion-First Principle | [Architecture - D12](./3-architecture.md#d12-response-depth-enhancement) | ✅ Active |

---

## Supported Platforms

| Platform | Skills Status | Installation Directory |
|----------|---------------|------------------------|
| Claude Code | ✅ Stable | `.claude/skills/` |
| Cursor | ⚠️ Beta | `.cursor/skills/` |
| GitHub Copilot | ✅ Stable | `.github/skills/` |
| Windsurf | ✅ Stable | `.windsurf/skills/` |
| Gemini CLI | ⚠️ Needs manual enable | `.gemini/skills/` |

---

## Expected Usage

```bash
# Install to current project (Cursor platform)
npx discuss-for-specs install --platform cursor

# Install to specific directory (Claude Code platform)
npx discuss-for-specs install --platform claude-code --target ~/my-project

# View supported platforms
npx discuss-for-specs platforms

# View version
npx discuss-for-specs --version
```

---

## References

- [Discussion Records (Original)](../.discuss/2026-01-19/spec-kit-evaluation/)
- [Discussion Records (2026-01-28 Update)](../.discuss/2026-01-28/discuss-mode-optimization/)
- [Platform Skills Mechanism Comparison](./2-technical-research.md)
- [spec-kit Project](https://github.com/spec-kit/spec-kit)

---

**Last Updated**: 2026-01-28
