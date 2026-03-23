# How It Works

This document explains the internal architecture and mechanisms of the Discussion Mode system.

> For quick start and installation, see the [README](../README.md).

---

## Overview

Discussion Mode uses a **Single-Skill + Snapshot Hook** architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Platform                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         Skill                               │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │                   discuss-for-specs                   │  │ │
│  │  │  • Three Roles (Socratic, Devil's Advocate, Connector)│  │ │
│  │  │  • Problem Type Differentiation                       │  │ │
│  │  │  • Discussion-First Principle                         │  │ │
│  │  │  • Problem Tracking & Consensus Recognition           │  │ │
│  │  │  • Output Strategy (No Duplication)                   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Hook (L2 Platforms Only)                 │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │   check_precipitation (snapshot-based detection)     │   │ │
│  │  │   (on conversation end - Stop hook)                  │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

> **Note**: Previous versions used two hooks (`track_file_edit` + `check_precipitation`). 
> As of 2026-01-30, this has been simplified to a single snapshot-based stop hook.
> See [D01: Snapshot-Based Detection](../.discuss/2026-01-30/multi-agent-platform-support/decisions/D01-snapshot-based-detection.md).

---

## Two-Level Platform Architecture

Platforms are classified into two capability levels based on hook support:

| Level | Capability | Required Hooks | User Experience |
|-------|------------|----------------|-----------------|
| **L1** | Discussion facilitation | None | Complete discussion features, no automatic reminders |
| **L2** | + Snapshot detection + Auto reminder | Stop only | Automatically detects and reminds about unprecipitated decisions |

### Platform Distribution

| Platform | Level | Reason |
|----------|-------|--------|
| Claude Code | L2 | Supports Stop hook |
| Cursor | L2 | Supports stop hook |
| Cline | L2 | Supports PostToolUse/TaskCancel |
| Gemini CLI | L2 | Supports AfterAgent hook |
| Kilocode | L1 | No Hooks support |
| OpenCode | L1 | No Hooks support |
| Codex CLI | L1 | Only notify (not a real Hook) |
| Windsurf | - | No Hooks support (planned) |
| Roo Code | - | No Hooks support (planned) |
| Trae | - | No Hooks support (planned) |

> L1 platforms use additional Skill guidance to encourage proactive decision precipitation.
> See [D05: L1 Skill Guidance](../.discuss/2026-01-30/multi-agent-platform-support/decisions/D05-l1-skill-guidance.md).

---

## Skill Architecture

### discuss-for-specs

**Purpose**: Facilitates in-depth discussions, tracks problems, guides decision-making, and manages structured output.

**Core Components**:

| Component | Description |
|-----------|-------------|
| **Three Roles** | Socratic Questioner, Devil's Advocate, Knowledge Connector |
| **Problem Types** | Different strategies for Factual / Design / Open-ended questions |
| **Discussion-First** | Ask before outputting; don't guess |
| **Problem Tracking** | Lifecycle: ⚪ pending → 🔵 discussing → ✅ resolved |
| **Output Strategy** | No Duplication between outline.md and responses |
| **Consensus Rules** | What IS and IS NOT consensus |

**Responsibilities**:
- Parse user intent and identify discussion topics
- Track problem lifecycle
- Analyze trends and detect consensus
- Render and update `outline.md` after each round
- Create decision documents in `decisions/` directory

---

## Hooks Architecture (L2 Platforms)

Hooks automate "process work" that doesn't require AI intelligence.

### Design Principle

> **Intelligence work for Agent, process work for Hook**

| Work Type | Handler | Examples |
|-----------|---------|----------|
| Intelligence | AI Skill | Understanding problems, analyzing solutions, recognizing consensus |
| Process | Python Hooks | File state detection, staleness checking, reminder generation |

### Snapshot-Based Detection

**Trigger**: When AI conversation ends
- Claude Code: `Stop` event
- Cursor: `stop` event

**Core Logic**:
1. Scan `.discuss/` directory for active discussions (modified within 24h)
2. Compare current file state with `.discuss/.snapshot.yaml`
3. If `outline.md` mtime changed → `change_count++`
4. If `decisions/` or `notes/` changed → `change_count = 0` (reset)
5. Trigger reminder when `change_count >= threshold`
6. Save updated snapshot

**Flow Diagram**:

```
Stop Hook Triggered
        │
        ▼
┌─────────────────────┐
│ Load .snapshot.yaml │
└─────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Find active discussions (24h)   │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ For each discussion:            │
│  • Compare outline.md mtime     │
│  • Compare decisions/ files     │
│  • Compare notes/ files         │
│  • Update change_count          │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ change_count >= threshold?      │
│  YES → Show reminder            │
│  NO  → Allow continue           │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Save updated .snapshot.yaml     │
└─────────────────────────────────┘
```

### Detection Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Detection window | 24 hours | Only check discussions modified within this window |
| Tracking method | mtime | Use file modification time for change detection |
| Suggest threshold | 3 | Suggest precipitation after 3 outline changes |
| Force threshold | 6 | Force precipitation after 6 outline changes |

---

## Discussion Directory Structure

Each discussion creates a structured directory:

```
.discuss/YYYY-MM-DD/topic-name/
├── outline.md          # Live progress tracking
├── decisions/          # Precipitated decisions
│   ├── D01-topic.md
│   ├── D02-topic.md
│   └── ...
└── notes/              # Reference materials
    └── ...
```

> **Note**: Previous versions used `discuss/` (without dot). As of 2026-01-28, 
> the standardized location is `.discuss/` (hidden directory).
> See [Architecture Decision D8](../specs/discuss-for-specs-v1/3-architecture.md#d8-discussion-directory-structure).

### outline.md

Real-time tracking of discussion state:

```markdown
# Discussion: Topic Name

## 🔵 Current Focus
- Current question being discussed

## ⚪ Pending
- [ ] Q1: Unanswered question

## ✅ Confirmed
| Decision | Description | Document |
|----------|-------------|----------|
| D1: First decision | Brief desc | [D01](./decisions/D01-xxx.md) |

## ❌ Rejected
- (Rejected options with rationale)
```

### .snapshot.yaml

State tracking managed **by hooks** at `.discuss/.snapshot.yaml`:

```yaml
# .discuss/.snapshot.yaml
version: 1
config:
  stale_threshold: 3          # Suggest reminder after N outline changes

discussions:
  "2026-01-30/topic-name":
    outline:
      mtime: 1706621400.0     # Unix timestamp
      change_count: 2         # Outline changes without decision updates
    decisions:
      - name: "D01-xxx.md"
        mtime: 1706620000.0
    notes:
      - name: "analysis.md"
        mtime: 1706619000.0
```

> **Note**: Previous versions used `meta.yaml` in each discussion directory.
> As of 2026-01-30, all state tracking is consolidated in `.snapshot.yaml`.
> See [D02: Remove meta.yaml](../.discuss/2026-01-30/multi-agent-platform-support/decisions/D02-remove-meta-yaml.md).

---

## Installed Components

After installation, components are distributed as follows:

### Global (User-Level)

```
~/.discuss-for-specs/
├── hooks/                    # Python hook scripts
│   ├── common/               # Shared utilities
│   │   ├── snapshot_manager.py   # Snapshot state management
│   │   ├── file_utils.py         # File operations
│   │   ├── logging_utils.py      # Logging utilities
│   │   └── platform_utils.py     # Platform detection
│   └── stop/                 # Precipitation check hook
│       └── check_precipitation.py
└── logs/                     # Hook execution logs
    └── discuss-hooks-YYYY-MM-DD.log
```

### Platform-Specific

**Claude Code**:
```
~/.claude/
├── skills/
│   └── discuss-for-specs/         # Single merged skill
└── settings.json             # Hooks configuration
```

**Cursor**:
```
~/.cursor/
├── skills/
│   └── discuss-for-specs/         # Single merged skill
└── hooks.json                # Hooks configuration
```

### Project-Level (with --target)

When using `--target /path/to/project`:
```
/path/to/project/
└── .cursor/                  # or .claude/
    └── skills/
        └── discuss-for-specs/
```

---

## Logging

Hooks log all operations for debugging:

**Location**: `~/.discuss-for-specs/logs/discuss-hooks-YYYY-MM-DD.log`

**Format**:
```
2026-01-30 22:31:40 | INFO     | discuss-hooks | Hook Started: check_precipitation
2026-01-30 22:31:40 | DEBUG    | discuss-hooks | Loaded snapshot with 3 discussions
2026-01-30 22:31:40 | DEBUG    | discuss-hooks | Found 1 active discussion(s)
2026-01-30 22:31:40 | DEBUG    | discuss-hooks | Outline modified, change_count: 2 -> 3
2026-01-30 22:31:40 | INFO     | discuss-hooks | Suggesting update: 1 stale item(s)
2026-01-30 22:31:40 | INFO     | discuss-hooks | Hook Ended: check_precipitation [SUCCESS]
```

---

## Platform Support

| Platform | Level | Skills | Hooks | Status |
|----------|-------|--------|-------|--------|
| Claude Code | L2 | ✅ | ✅ | Ready |
| Cursor | L2 | ✅ | ✅ | Ready |
| Kilocode | L1 | ✅ | - | Ready |
| OpenCode | L1 | ✅ | - | Ready |
| Codex CLI | L1 | ✅ | - | Ready |
| Cline | L2 | ✅ | ✅ | Planned |
| Gemini CLI | L2 | ✅ | ✅ | Planned |
| Windsurf | - | - | - | Planned |
| Roo Code | - | - | - | Planned |

---

## Related

- [README](../README.md) - Quick start and installation
- [AGENTS.md](../AGENTS.md) - Guidelines for AI agents
- [Architecture Design](../specs/discuss-for-specs-v1/3-architecture.md) - Design decisions
- [Multi-Agent Platform Support](../.discuss/2026-01-30/multi-agent-platform-support/outline.md) - Platform extension discussion
- [Discussion Records](../.discuss/) - Historical discussions

---

**Last Updated**: 2026-01-30
