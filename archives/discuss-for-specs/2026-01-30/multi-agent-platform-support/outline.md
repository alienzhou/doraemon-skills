# Multi-Agent Platform Support Extension

> **Discussion Date**: 2026-01-30 ~ 2026-01-31
> **Status**: Discussion Complete, Ready for Implementation

## 🔵 Current Focus
- Discussion complete, all decisions documented

## ⚪ Implementation Tasks (For Next Session)

### Phase 1: Skills-based Platforms (4 platforms)
- [ ] Cline L2: SKILL.md + TaskComplete Hook
- [x] Kilocode L1: SKILL.md ✅ (2026-01-31)
- [x] OpenCode L1: SKILL.md ✅ (2026-01-31)
- [x] Codex CLI L1: SKILL.md ✅ (2026-01-31)

### Phase 2: Custom Mode Platforms (Deferred)
- [ ] Gemini CLI L2: Custom + AfterAgent Hook
- [ ] Roo Code L1: Custom Mode

### Core Implementation
- [ ] Snapshot scheme (snapshot_manager.py)
- [ ] Precipitation checker (check_precipitation.py)
- [x] SKILL.md templates ✅ (2026-01-31, for L1 platforms)
- [ ] npm-package update

---

## ✅ Final Decisions

### Architecture Decisions

| ID | Decision | Summary |
|----|----------|---------|
| D01 | Snapshot-based detection | Replace dual-hook with single Stop hook + snapshot comparison |
| D02 | Remove meta.yaml | Merge configuration into snapshot.yaml |
| D03 | Two-level architecture | L1 (Skills only) + L2 (Skills + Hooks) |
| D04 | Snapshot parameters | 24h window, mtime-based, full file tracking |
| D05 | L1 Skill guidance | Two-layer separation for L1 platforms |
| D06 | OpenCode → L1 | Downgrade due to Hook misalignment (TS only, no Stop event) |

### Platform Decisions

| ID | Decision | Summary |
|----|----------|---------|
| D10 | Final platform list | Phase 1: Cline, Kilocode, OpenCode, Codex (Skills-based) |

---

## ❌ Rejected / Superseded

| Original Idea | Final Decision | Reason |
|---------------|----------------|--------|
| Support 7 platforms in Batch 1 | Reduced to 4 | User wanted to focus on Skills-based platforms first |
| Include Gemini CLI in Phase 1 | Deferred to Phase 2 | No Skills support (Hooks only), similar to Roo Code |
| Include Roo Code in Phase 1 | Deferred to Phase 2 | No Skills/Hooks support, requires Custom Mode |
| OpenCode as L2 | Downgraded to L1 | TS-only Hooks, no Stop event equivalent |

### Evolution of Platform List

```
Initial research → 7 platforms (D08)
├─ Claude Code (L2, already done)
├─ Cline (L2)
├─ Gemini CLI (L2)
├─ Kilocode (L1)
├─ OpenCode (L1)
├─ Codex (L1)
└─ Roo Code (L1)

After D09 → 5 platforms
├─ Removed Roo Code (user decision, was going to add back)

After D10 → 4 platforms (Final)
├─ Cline (L2) ✅
├─ Kilocode (L1) ✅
├─ OpenCode (L1) ✅
├─ Codex (L1) ✅
├─ Gemini CLI → Phase 2 (no Skills)
└─ Roo Code → Phase 2 (no Skills/Hooks)
```

---

## Overview

### Final Platform Matrix

| Platform | Version | Skills | Hooks | Level | Phase |
|----------|---------|--------|-------|-------|-------|
| Claude Code | - | ✅ | ✅ Stop | L2 | ✅ Done |
| **Cline** | v3.56.1 | ✅ | ✅ TaskComplete | L2 | Phase 1 |
| **Kilocode** | v5.2.2 | ✅ | ❌ | L1 | Phase 1 |
| **OpenCode** | v1.1.47 | ✅ | ⚠️ TS only | L1 | Phase 1 |
| **Codex CLI** | - | ✅ | ❌ notify | L1 | Phase 1 |
| Gemini CLI | - | ❌ | ✅ AfterAgent | L2 | Phase 2 |
| Roo-Code | v3.8.4 | ❌ | ❌ | L1 | Phase 2 |

### Two-Level Architecture

| Level | Capability | Mechanism | Platforms |
|-------|------------|-----------|-----------|
| **L1** | Discussion facilitation | Skills only | Kilocode, OpenCode, Codex |
| **L2** | + Auto reminder | Skills + Hooks | Claude Code✅, Cline |

### Snapshot Scheme

```
Stop Hook triggered
    ↓
Compare .discuss/.snapshot.yaml
    ↓
outline mtime changed? → change_count++
decisions/notes changed? → change_count = 0
    ↓
change_count >= threshold? → Show reminder
```

---

## Reference Materials

| File | Description |
|------|-------------|
| [notes/platform-research.md](notes/platform-research.md) | Detailed research with version tags |
| [notes/implementation-guide.md](notes/implementation-guide.md) | Implementation checklist |

---

## Decision Documents

### Active Decisions
| ID | Document | Status |
|----|----------|--------|
| D01 | [D01-snapshot-based-detection.md](decisions/D01-snapshot-based-detection.md) | ✅ Active |
| D02 | [D02-remove-meta-yaml.md](decisions/D02-remove-meta-yaml.md) | ✅ Active |
| D03 | [D03-two-level-architecture.md](decisions/D03-two-level-architecture.md) | ✅ Active |
| D04 | [D04-snapshot-parameters.md](decisions/D04-snapshot-parameters.md) | ✅ Active |
| D05 | [D05-l1-skill-guidance.md](decisions/D05-l1-skill-guidance.md) | ✅ Active |
| D06 | [D06-opencode-downgrade-l1.md](decisions/D06-opencode-downgrade-l1.md) | ✅ Active |
| D10 | [D10-gemini-cli-deferred.md](decisions/D10-gemini-cli-deferred.md) | ✅ Active (Final platform list) |

### Superseded Decisions (Historical Reference)
| ID | Document | Status | Superseded By |
|----|----------|--------|---------------|
| D07 | [D07-roo-code-removed.md](decisions/D07-roo-code-removed.md) | 📁 Historical | D10 |
| D08 | [D08-batch1-platforms.md](decisions/D08-batch1-platforms.md) | 📁 Historical | D09 → D10 |
| D09 | [D09-final-platform-list.md](decisions/D09-final-platform-list.md) | 📁 Historical | D10 |
