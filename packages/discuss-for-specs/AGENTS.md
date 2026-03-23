# AGENTS.md - AI Agent Guidelines

This document provides guidance for AI agents working on this project.

## 📋 Project Overview

**skill-discuss-for-specs** is a cross-platform AI discussion facilitation system that helps structure deep discussions, track decisions, and automatically precipitate knowledge into documents.

### Core Philosophy

> **Intelligence work for Agent, process work for Hook**

- **Agent** (AI) focuses on: Understanding problems, analyzing solutions, guiding discussions, recognizing consensus
- **Hook** (Scripts) handles: State detection, change tracking, reminders

## 🏗️ Architecture

### Single-Skill Architecture

| Skill | Responsibility |
|-------|---------------|
| `discuss-for-specs` | Discussion facilitation, problem tracking, consensus recognition, decision precipitation, file management |

### Directory Structure (Mechanism-Based)

```
skill-discuss-for-specs/
├── skills/              # 📝 Skill source (Markdown for AI)
│   └── discuss-for-specs/          # Unified discussion skill
│       ├── SKILL.md                # Core skill content
│       ├── headers/                # Platform-specific YAML headers
│       └── references/             # Templates and reference docs
├── hooks/               # ⚡ Python automation scripts
│   ├── stop/                # Precipitation checks (snapshot-based)
│   └── common/              # Shared utilities
├── npm-package/         # 📦 NPM distribution (single build entry)
│   ├── dist/                # Built skills for all platforms
│   ├── hooks/               # Bundled hooks
│   └── src/                 # CLI source code
├── config/              # ⚙️ Configuration files
├── templates/           # 📄 File templates
└── .discuss/            # 💬 Active discussions (dot-prefixed)
```

## 🎯 Key Conventions

### 1. Skill-Based Architecture

This project provides discussion facilitation capabilities through a single unified Skill:
- `discuss-for-specs`: Handles all discussion logic (in `skills/discuss-for-specs/SKILL.md`)

**To use discussion capabilities**: Load and follow the Skill. All usage details are documented in the SKILL.md file.

### 2. Data Structures

**Discussion directory**:
```
.discuss/YYYY-MM-DD/[topic]/
├── outline.md          # Discussion outline
├── decisions/          # Decision documents
└── notes/              # Reference materials
```

**Snapshot file** (managed by hooks):
```
.discuss/.snapshot.yaml  # Tracks discussion state changes
```

**File naming conventions**:
- Decisions: `DXX-decision-title.md` (D01, D02, D03...)
- Notes: `topic-name.md` (no prefix)

### 3. Language Conventions

| Context | Language Rule |
|---------|--------------|
| Conversation replies | Follow the user's language (Chinese if user writes in Chinese) |
| Documentation editing | Always use English as the primary language |
| Code comments | English |

This ensures:
- Natural interaction with users in their preferred language
- Consistent, searchable documentation in a universal language

### 4. Templates

Templates for new discussions are in `templates/`:
- `outline.md` - Outline template

## 📁 Important Files

| File | Purpose |
|------|---------|
| `skills/discuss-for-specs/SKILL.md` | Unified discussion skill instructions |
| `config/default.yaml` | Default configuration |
| `hooks/stop/check_precipitation.py` | Decision precipitation detection (snapshot-based) |
| `hooks/common/snapshot_manager.py` | Snapshot state management |
| `.discuss/*/outline.md` | Active discussion outlines |
| `.discuss/.snapshot.yaml` | Discussion state tracking |

## 🔧 Development Guidelines

### Building for Platforms

All skills are built via npm-package (single build entry):

```bash
# Build for all platforms (from npm-package directory)
cd npm-package && npm run build

# This generates:
# npm-package/dist/claude-code/discuss-for-specs/
# npm-package/dist/cursor/discuss-for-specs/
# npm-package/dist/kilocode/discuss-for-specs/
# npm-package/dist/opencode/discuss-for-specs/
# npm-package/dist/codex/discuss-for-specs/
```

### Installing (npm-based, with hooks)

```bash
# Auto-detect platform
npx @vibe-x/discuss-for-specs install

# Or specify platform
npx @vibe-x/discuss-for-specs install --platform claude-code
npx @vibe-x/discuss-for-specs install --platform cursor
```

### Testing Changes

```bash
# Run Python tests
python -m pytest tests/
```

## 📊 .snapshot.yaml Schema

Reference for understanding discussion state tracking:

```yaml
# .discuss/.snapshot.yaml
version: 1
config:
  stale_threshold: 3        # Trigger reminder after N outline changes

discussions:
  "2026-01-30/topic-name":
    outline:
      mtime: 1706621400.0   # Unix timestamp
      change_count: 2       # Outline changes without decision updates
    decisions:
      - name: "D01-xxx.md"
        mtime: 1706620000.0
    notes:
      - name: "analysis.md"
        mtime: 1706619000.0
```

## 🔨 Development Workflows

### Adding New Features

1. **AI behavior changes**: Update `skills/*/SKILL.md`
2. **Process automation**: Add Python scripts in `hooks/`
3. **Platform support**: Add directory in `platforms/` with build/install scripts
4. **Configuration**: Update `config/default.yaml`

### Modifying Skills

Skills are pure Markdown instructions. To modify behavior:
1. Edit the SKILL.md file
2. Test with discussion scenarios
3. Update version number and last updated date

### Hooks Development

Hooks are Python scripts that run at specific lifecycle events:
- `stop/`: Triggered when AI response completes (snapshot-based detection)
- `common/`: Shared utilities

**Key modules in `common/`**:
- `snapshot_manager.py`: Snapshot state management
- `file_utils.py`: File operations helpers
- `logging_utils.py`: Centralized logging utilities
- `platform_utils.py`: Platform detection and adaptation

## ⚠️ Development Pitfalls

1. **Don't put usage instructions in AGENTS.md** - That belongs in SKILL.md
2. **Don't modify Skills without testing** - Test with actual discussions first
3. **Don't break cross-platform compatibility** - Test build scripts for all platforms
4. **Keep hooks simple** - Complex logic should be in dedicated modules

### CRITICAL: Source vs Build Artifacts

**NEVER modify files under `npm-package/hooks/` or `npm-package/config/`** — these are build artifacts generated from source directories. Always modify the source files:

| Source (modify this) | Build artifact (auto-generated) |
|---------------------|--------------------------------|
| `hooks/` | `npm-package/hooks/` |
| `config/` | `npm-package/config/` |
| `skills/` | `npm-package/dist/` |

After modifying source files, run `npm run build` in the `npm-package/` directory to regenerate artifacts. The build artifacts are in `.gitignore` and should never be committed.

## 🔗 Related Resources

- [Architecture Design Discussion](.discuss/2026-01-17/skill-discuss-architecture-design/outline.md)
- [Multi-Agent Platform Support Discussion](.discuss/2026-01-30/multi-agent-platform-support/outline.md)
- [How It Works](docs/HOW-IT-WORKS.md)
- [Project README](README.md)

---

**Version**: 0.3.0
**Last Updated**: 2026-02-02
