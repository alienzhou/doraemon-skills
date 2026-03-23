# Project Directory Structure

**Decision Time**: #R9-R11  
**Status**: ⚠️ PARTIALLY SUPERSEDED  
**Superseded By**: [D02: Directory Structure](./../../../2026-01-28/discuss-mode-optimization/decisions/D02-directory-structure.md) (2026-01-28)  
**Related Outline**: [Back to Outline](../outline.md)

> **⚠️ UPDATE (2026-01-28)**: The discussion directory structure has been updated:
> - Old: `discuss/YYYY-MM-DD/[topic]/`
> - New: `.discuss/YYYY-MM-DD/[topic]/` (hidden directory)
> 
> The Skills and Hooks directory structure remains valid.

---

## 📋 Background

### Problem/Requirement
Need to organize the project directory structure for a multi-platform AI discussion Skill system.

Key questions:
1. How to organize code vs content (Skills are Markdown, not code)?
2. How to clearly separate Skills (Markdown instructions) from Hooks (automation scripts)?
3. Where to place platform-specific adaptations?

### Constraints
- **Skills are primarily Markdown** files (SKILL.md), not code
- Hooks are Python scripts for automation
- Need to support multiple platforms (Claude Code, Cursor, VS Code, etc.)
- Must be clear whether something relates to Skills or Hooks

---

## 🎯 Objective

Design a directory structure that:
- Clearly separates mechanism types (Skills vs Hooks)
- Makes it immediately obvious what each directory contains
- Supports multi-platform output
- Facilitates maintenance and iteration

---

## 📊 Solution Comparison

### Rejected: Functional Organization

```
❌ core/
    ├── coordinator/      # Mixing Skills and code logic
    ├── output/           # Unclear: is this Markdown or code?
    └── hooks/
```

**Problem**: Mixes functional concerns with mechanism types. Unclear at a glance what's Markdown (for AI) vs code (for automation).

### Chosen: Mechanism-Based Organization

```
✅ skills/                # 📝 Markdown files (AI instructions)
   hooks/                 # ⚡ Python scripts (automation)
   platforms/             # 🔌 Platform adaptations
```

**Advantage**: Immediately clear what each directory contains and its purpose.

---

## ✅ Final Decision

### Directory Structure

```
skill-discuss-for-specs/
├── README.md
├── LICENSE
├── pyproject.toml            # Python project configuration
│
├── skills/                   # 📝 Skills (Markdown)
│   ├── discuss-coordinator/
│   │   ├── SKILL.md          # Core: Coordinator Skill instructions
│   │   └── references/       # Reference materials
│   │       ├── decision-rules.md
│   │       └── problem-lifecycle.md
│   │
│   └── discuss-output/
│       ├── SKILL.md          # Core: Output Skill instructions
│       └── references/
│           ├── outline-format.md
│           └── doc-templates.md
│
├── hooks/                    # ⚡ Hooks (Python)
│   ├── post-response/        # Triggered after each response
│   │   ├── check_stale.py    # Check unprecipitated decisions
│   │   └── update_round.py   # Update round count
│   └── common/               # Common modules
│       ├── meta_parser.py    # meta.yaml parsing
│       └── file_utils.py     # File utilities
│
├── config/                   # ⚙️ Configuration
│   ├── default.yaml          # Default configuration
│   └── schema.json           # Configuration schema
│
├── templates/                # 📄 File templates
│   ├── outline.md            # Outline template
│   ├── decision.md           # Decision document template
│   └── meta.yaml             # meta.yaml template
│
├── platforms/                # 🔌 Platform adaptations
│   ├── claude-code/
│   │   ├── install.sh        # Install to ~/.claude/skills/
│   │   └── transform.py      # Transform SKILL.md headers
│   │
│   └── cursor/
│       ├── install.sh        # Install to .cursor/rules/
│       └── transform.py      # Transform format
│
├── scripts/                  # 🔧 Development/build scripts
│   ├── build.sh              # Build for all platforms
│   └── test.sh               # Run tests
│
├── tests/                    # 🧪 Tests
│   ├── test_hooks/
│   └── test_transforms/
│
└── docs/                     # 📚 Project documentation
    ├── architecture.md       # Architecture overview
    ├── contributing.md       # Contribution guide
    └── user-guide.md         # User guide
```

---

## 📊 Key Design Decisions

### 1. Mechanism-Based Top-Level Directories

| Directory | Content Type | Purpose |
|-----------|--------------|---------|
| `skills/` | Markdown | AI instructions for discussion facilitation |
| `hooks/` | Python | Automation scripts for procedural tasks |
| `platforms/` | Platform-specific | Handle platform differences only |

**Rationale**: Immediately clear what each directory contains.

### 2. Skills vs Hooks Separation

**Skills** (Markdown):
- Give instructions to AI
- Define "how to think" and "what to do"
- Natural language descriptions
- Platform-agnostic content

**Hooks** (Python):
- Automate mechanical tasks
- Execute at specific trigger points
- No intelligence, pure execution
- Platform-agnostic logic

### 3. Platform Adaptations

Platforms directory only handles:
- Header format differences
- Installation location differences
- Build/transform scripts

Core content stays in `skills/` and `hooks/`.

---

## 📊 Comparison with Previous Structure

| Aspect | Previous (Functional) | Current (Mechanism) |
|--------|----------------------|---------------------|
| Top-level organization | By function (coordinator, output) | By mechanism (skills, hooks) |
| Clarity | Unclear if Markdown or code | Immediately obvious |
| Skill location | Mixed with code logic | Separate, clear |
| Hook location | Mixed with other concerns | Separate, clear |
| Platform handling | Unclear | Explicit `platforms/` |

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Confusion about Skill vs Hook scope | Low | Low | Clear documentation, examples |
| Platform adaptation complexity | Medium | Medium | Keep platform code minimal |
| Directory structure too rigid | Low | Medium | Revisit in V2 if needed |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R9 | 2026-01-17 | Initial structure proposal (functional) | First pass organization |
| #R10 | 2026-01-17 | Refactored to mechanism-based | User feedback: clarity issues |
| #R11 | 2026-01-17 | Finalized mechanism-based structure | Confirmed with user |

---

## 🔗 Related Links

- [Decision 02: Skill Naming](./02-skill-naming.md)
- [Decision 08: Multi-Platform Output](./08-multi-platform-output.md)
- [Decision 09: Implementation Language](./09-implementation-language.md)
