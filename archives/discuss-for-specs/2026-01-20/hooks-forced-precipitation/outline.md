# Discussion: Hooks Forced Precipitation Mechanism

> Status: In Progress | Round: R10 | Date: 2026-01-20

## 🔵 Current Focus

- **Design phase completed, plan confirmed**
- **Not implemented yet, will be developed when needed**

## ⚪ Pending

- [x] ~~Q1: Specific implementation of file edit hooks~~ → Claude Code: PostToolUse, Cursor: afterFileEdit
- [x] ~~Q2: State passing solution~~ → Use meta.yaml to mark pending_update
- [ ] Q3: Exception handling logic (reserved, refine during implementation)

## ✅ Confirmed

- **D1**: meta.yaml only records status, remove topic (directory name is topic) → [D02-meta-yaml-schema.md](./decisions/D02-meta-yaml-schema.md)
- **D2**: decisions detection only cares about "any updates", doesn't distinguish new/old decisions → [D03-detection-mechanism.md](./decisions/D03-detection-mechanism.md)
- **D3**: hooks configuration placed globally (`~/.claude/settings.json` / `~/.cursor/hooks.json`) → [D01-hooks-architecture.md](./decisions/D01-hooks-architecture.md)
- **D4**: run definition = one AI conversation ends (when Stop Hook triggers) → [D01-hooks-architecture.md](./decisions/D01-hooks-architecture.md)
- **D5**: Use two hooks collaboration: file edit tracking + stop detection → [D01-hooks-architecture.md](./decisions/D01-hooks-architecture.md)
- **D6**: Infer discussion directory from file path → [D03-detection-mechanism.md](./decisions/D03-detection-mechanism.md)
- **D7**: State passing via meta.yaml (mark pending_update in meta.yaml) → [D02-meta-yaml-schema.md](./decisions/D02-meta-yaml-schema.md)

## ✅ Fixed Issues

- **P1**: ~~Cursor SKILL.md missing YAML frontmatter~~ → Fixed, dynamically injected via build.sh

## ❌ Rejected

(None)

## 📁 Archive

| Topic | Summary | Details |
|-------|---------|---------|
| Existing Mechanism Analysis | update_round.py + check_stale.py | [→ notes/background-analysis.md](./notes/background-analysis.md) |
| Platform Hooks API Comparison | Claude Code vs Cursor | [→ notes/platform-hooks-comparison.md](./notes/platform-hooks-comparison.md) |

---

## 📚 Reference Documents

### Decisions

- [D01: Hooks Architecture](./decisions/D01-hooks-architecture.md) - Two hooks collaboration design, platform configuration
- [D02: meta.yaml Schema](./decisions/D02-meta-yaml-schema.md) - Schema definition, state passing mechanism
- [D03: Detection Mechanism](./decisions/D03-detection-mechanism.md) - Detection logic, two-stage trigger, exception handling

### Notes

- [Background Analysis](./notes/background-analysis.md) - Existing mechanism, issues, user proposed solution
- [Platform Hooks Comparison](./notes/platform-hooks-comparison.md) - Claude Code vs Cursor API comparison, implementation differences
