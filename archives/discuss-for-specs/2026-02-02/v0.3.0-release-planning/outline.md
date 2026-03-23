# v0.3.0 Release Planning

> **Discussion Date**: 2026-02-02
> **Status**: ✅ Discussion Complete

## 🔵 Current Focus
(None - Discussion complete for CLI help optimization)

## ⚪ Pending
(None)

## ✅ Confirmed

### Scope for v0.3.0

#### Improvements (6 items)

| # | Feature | Description | Reference |
|---|---------|-------------|-----------|
| 1 | Integration tests enhancement | Improve test coverage | - |
| 2 | `stale_threshold` config entry | Configurable threshold | - |
| 3 | Timezone handling | Proper timezone support | - |
| 4 | Workspace detection improvement | Support stdin data from platforms | [D01](./decisions/D01-workspace-detection-improvement.md) |
| 5 | SKILL.md workspace root guidance | Add guidance for all platforms | [D02](./decisions/D02-skill-workspace-guidance.md) |
| 6 | Project-level installation | `--target` flag for Skills + Hooks | [D03](./decisions/D03-project-level-installation.md) |
| 7 | CLI simplification & export command | Remove `--project-level`, add `export` command | [D04](./decisions/D04-cli-simplification-export.md) |
| 8 | CLI help output optimization | Improve scannability with tiered structure and colors | [D05](./decisions/D05-cli-help-optimization.md) |

#### New Platforms (5 platforms)

| Platform | Level | Skills | Hooks | Approach | Research |
|----------|-------|--------|-------|----------|----------|
| **Cline** | L2 | ✅ | ✅ TaskComplete | SKILL.md + Hook | - |
| **Gemini CLI** | L2 | ❌ | ✅ AfterAgent | Custom config | - |
| **Roo-Code** | L1 | ❌ | ❌ | Custom Mode | - |
| **Trae** | L1 | ✅ | ❌ | SKILL.md only | [Research](notes/trae-platform-research.md) |
| **Qoder** | L1 | ✅ | ❌ | SKILL.md + AGENTS.md | [Research](notes/qoder-platform-research.md) |

### Project-Level Installation Design

#### Skills Directory Matrix

| Platform | User-Level | Project-Level | Priority |
|----------|-----------|---------------|----------|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` | Project > User |
| Cursor | `~/.cursor/skills/` | `.cursor/skills/` | Project > User |
| Cline | `~/.cline/skills/` | `.cline/skills/` | ⚠️ User > Project |
| Kilocode | `~/.kilocode/skills/` | `.kilocode/skills/` | Project > User |
| OpenCode | `~/.config/opencode/skills/` | `.opencode/skills/` | Project > User |
| Codex CLI | `~/.codex/skills/` | `.codex/skills/` | Scoped |
| Trae | `~/.trae/skills/` | `.trae/skills/` | TBD |
| Qoder | `~/.qoder/skills/` | `.qoder/skills/` | Project > User |
| Roo-Code | `~/.roo/skills/` | `.roo/skills/` | Project > User |

#### Hooks Directory Matrix (L2 Platforms)

| Platform | User-Level | Project-Level | Format |
|----------|-----------|---------------|--------|
| Claude Code | `~/.claude/settings.json` | `.claude/settings.json` | JSON |
| Cursor | `~/.cursor/hooks.json` | `.cursor/hooks.json` | JSON |
| Cline | `~/Documents/Cline/Hooks/` | `.clinerules/hooks/` | Shell scripts |
| Gemini CLI | `~/.gemini/settings.json` | `.gemini/settings.json` | JSON |

#### CLI Design (Updated)

```bash
# User-level (default, platform required)
npx @vibe-x/discuss-for-specs install --platform cursor

# Project-level (use --target instead of --project-level)
npx @vibe-x/discuss-for-specs install --platform cursor --target .
npx @vibe-x/discuss-for-specs install --platform claude-code --target /path/to/project

# Raw directory export (no platform needed, no hooks)
npx @vibe-x/discuss-for-specs export /my/custom/skills/
npx @vibe-x/discuss-for-specs export /my/custom/skills/ --include-l1-guidance
```

## ❌ Rejected

- Concurrent access protection (deferred to future version)

## ⏸️ Deferred

- Gemini CLI: No Skills support, requires custom commands approach

---

## Platform Research Summary

### Current Platforms (v0.2.0)

| Platform | Level | Status |
|----------|-------|--------|
| Claude Code | L2 | ✅ Production |
| Cursor | L2 | ✅ Production |
| Kilocode | L1 | ✅ Production |
| OpenCode | L1 | ✅ Production |
| Codex CLI | L1 | ✅ Production |

### New Platforms Analysis

#### Trae (ByteDance AI IDE)
- **Version**: v1.3.0+
- **Skills**: ✅ agentskills.io standard
- **Rules**: ✅ `.trae/project_rules.md`
- **MCP**: ✅ JSON-RPC 2.0
- **Hooks**: ❌ None
- **Classification**: L1

#### Qoder (Agentic Coding Platform)
- **Skills**: ✅ SKILL.md format
- **Rules**: ✅ `.qoder/rules` + AGENTS.md compatible
- **MCP**: ✅ Model Context Protocol
- **Hooks**: ❌ None
- **Classification**: L1
- **Unique**: `npx skills add` support, IDE + CLI unified

### Workspace Detection Priority

```
1. stdin JSON: workspace_roots (Cursor) / workspaceRoots (Cline)
2. Environment: CURSOR_PROJECT_DIR, CLAUDE_PROJECT_DIR, WORKSPACE_ROOT, PROJECT_ROOT
3. PWD environment variable
4. Path.cwd() fallback
```

---

## Decision Documents

| ID | Document | Status |
|----|----------|--------|
| D01 | [Workspace Detection Improvement](./decisions/D01-workspace-detection-improvement.md) | ✅ Confirmed |
| D02 | [SKILL.md Workspace Guidance](./decisions/D02-skill-workspace-guidance.md) | ✅ Confirmed |
| D03 | [Project-Level Installation](./decisions/D03-project-level-installation.md) | ✅ Confirmed |
| D04 | [CLI Simplification & Export Command](./decisions/D04-cli-simplification-export.md) | ✅ Confirmed |

## Research Notes

| File | Description |
|------|-------------|
| [workspace-research-verification.md](notes/workspace-research-verification.md) | Platform workspace detection verification |
| [trae-platform-research.md](notes/trae-platform-research.md) | Trae platform capabilities |
| [qoder-platform-research.md](notes/qoder-platform-research.md) | Qoder platform capabilities |
| [project-level-skills-research.md](notes/project-level-skills-research.md) | Project-level installation research |
