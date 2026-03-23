# Architecture Design: Cross-Platform Skills Distribution

> **Created**: 2026-01-19  
> **Last Updated**: 2026-01-28  
> **Status**: Confirmed  
> **Discussion Source**: [Original Discussion](../.discuss/2026-01-19/spec-kit-evaluation/) | [2026-01-28 Update](../.discuss/2026-01-28/discuss-mode-optimization/)

---

## 1. Design Overview

### 1.1 Design Goals

1. **Cross-Platform Consistency**: Single source of Skill content, deployable to multiple platforms
2. **Maintainability**: Adding new platforms should only require configuration changes
3. **Good User Experience**: One-command installation
4. **Extensibility**: Preserve space for platform-specific customizations

### 1.2 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Config Layer                             │
│               config/platforms.yaml                          │
│         (Platform definitions, directories, headers)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Template Layer                            │
│                  skills/<name>/                              │
│     ├── SKILL.md (common content)                           │
│     └── headers/<platform>.yaml (platform headers)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Build Layer                              │
│              npm package: discuss-for-specs                     │
│    (CLI commands: install, platforms, version)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Original Architecture Decisions (2026-01-19)

### D1: Skill as Primary Distribution Format

**Decision Time**: R2  
**Status**: ✅ Confirmed

#### Background

Need to determine the format for distributing discussion capabilities across different AI products.

#### Options Considered

| Option | Description | Pros | Cons | Decision |
|--------|-------------|------|------|----------|
| Skill | Capability extensions based on SKILL.md | All mainstream platforms support; auto triggering; high standardization | Cursor still in Beta | ✅ |
| Slash Command | User explicitly triggers with `/xxx` | Clear user control | Large format differences (Markdown vs TOML); requires more adaptation | ❌ |
| Rules | Rule files auto-load | Simple | Not suitable for complex capabilities; different platform formats | ❌ |

#### Final Decision

Use **Skill** as the primary distribution format. Other formats (like Slash Commands) can be secondary, deferred for later implementation.

> 📎 **Original Discussion**: [D01-skill-as-primary-format.md](../../.discuss/2026-01-19/spec-kit-evaluation/decisions/D01-skill-as-primary-format.md)

---

### D2: Preserve Header Separation Design

**Decision Time**: R3  
**Status**: ✅ Confirmed

#### Background

The current project has a `skills/<name>/headers/<platform>.yaml` design that separates YAML frontmatter from Skill content.

#### Final Decision

Preserve the `skills/<name>/headers/<platform>.yaml` separated design.

#### Rationale

1. **Platform Differences Exist**: Claude Code supports `allowed-tools`, Cursor supports `alwaysApply` and `globs`
2. **Build-time Concatenation**: `headers/<platform>.yaml` + `SKILL.md` → complete file
3. **Good Extensibility**: Adding a new platform only requires adding the corresponding header file

> 📎 **Original Discussion**: [D02-headers-separation.md](../../.discuss/2026-01-19/spec-kit-evaluation/decisions/D02-headers-separation.md)

---

### D3: Adopt Centralized Configuration Management

**Decision Time**: R5  
**Status**: ✅ Confirmed

#### Final Decision

Create `config/platforms.yaml` to centrally manage platform information.

> 📎 **Original Discussion**: [D03-centralized-config.md](../../.discuss/2026-01-19/spec-kit-evaluation/decisions/D03-centralized-config.md)

---

### D4: Distribute Installation Commands via npm

**Decision Time**: R5  
**Status**: ✅ Confirmed

#### Final Decision

Publish `discuss-for-specs` package via npm, providing bin commands.

#### Expected Commands

```bash
# Install to current project
npx discuss-for-specs install --platform cursor

# Install to specific directory
npx discuss-for-specs install --platform claude-code --target ~/my-project

# View supported platforms
npx discuss-for-specs platforms

# View version
npx discuss-for-specs --version
```

> 📎 **Original Discussion**: [D04-npm-distribution.md](../../.discuss/2026-01-19/spec-kit-evaluation/decisions/D04-npm-distribution.md)

---

### D5: npm Package Design

**Decision Time**: R6  
**Status**: ✅ Confirmed

#### Final Decision

- **Package Name**: `discuss-for-specs`
- **Language**: Node.js (TypeScript optional)
- **Dependencies**: Minimized, may only need `commander` or native parsing

> 📎 **Original Discussion**: [D05-npm-package-design.md](../../.discuss/2026-01-19/spec-kit-evaluation/decisions/D05-npm-package-design.md)

---

### D6: Pre-built Content in npm Package

**Decision Time**: R7  
**Status**: ✅ Confirmed

#### Final Decision

Include **pre-built content** in the npm package. The package will contain complete `SKILL.md` files for each platform, generated during the package build/publish process.

> 📎 **Original Discussion**: See [D05-npm-package-design.md](../../.discuss/2026-01-19/spec-kit-evaluation/decisions/D05-npm-package-design.md) (combined with D5)

---

## 3. Updated Architecture Decisions (2026-01-28)

### D7: Skill Architecture Merge

**Decision Time**: 2026-01-28 R4  
**Status**: ✅ Confirmed  
**Supersedes**: Original 2-skill architecture (`discuss-coordinator` + `discuss-output`)

#### Background

The original design split discussion mode into two Skills:
- `discuss-coordinator` - handles discussion facilitation and problem tracking
- `discuss-output` - handles outline rendering and file management

This caused issues with cross-cutting concerns (constraints, principles) not fitting neatly into either.

#### Final Decision

Merge into a **single `discuss-mode` Skill** with template separation.

#### New Structure

```
skills/
└── discuss-mode/
    ├── SKILL.md              # Main file (~8KB): principles + logic
    ├── headers/
    │   ├── claude-code.yaml
    │   └── cursor.yaml
    └── references/
        ├── outline-template.md
        ├── decision-template.md
        └── meta-schema.yaml
```

#### Rationale

1. Key principles (discussion-first) need to permeate the entire Skill
2. Templates are only needed at specific moments (creating files)
3. Separation allows templates to be updated independently

> 📎 **Original Discussion**: [D01-skill-architecture.md](../../.discuss/2026-01-28/discuss-mode-optimization/decisions/D01-skill-architecture.md)

#### Impact on npm Package

```
discuss-for-specs/
├── dist/
│   ├── claude-code/
│   │   └── discuss-mode/         # Changed from discuss-coordinator + discuss-output
│   │       └── SKILL.md
│   └── cursor/
│       └── discuss-mode/
│           └── SKILL.md
└── ...
```

---

### D8: Discussion Directory Structure

**Decision Time**: 2026-01-28 R2  
**Status**: ✅ Confirmed  
**Supersedes**: Original `discuss/YYYY-MM-DD/` structure

#### Background

The original implementation used `discuss/` as the base directory for discussion artifacts.

#### Final Decision

Use **`.discuss/YYYY-MM-DD/[topic-slug]/`** as the standardized directory structure.

#### Structure

```
.discuss/
└── YYYY-MM-DD/
    └── [topic-slug]/
        ├── outline.md      # Discussion outline (state-priority order)
        ├── meta.yaml       # Metadata (fully automated by Hooks)
        ├── decisions/      # Decision documents
        │   ├── D01-xxx.md
        │   └── D02-xxx.md
        └── notes/          # Reference materials (optional)
            └── topic-analysis.md
```

#### Rationale

1. Hidden directory (`.discuss/`) keeps project root clean
2. Date-based organization helps track discussion chronology
3. Topic slug provides clear identification

> 📎 **Original Discussion**: [D02-directory-structure.md](../../.discuss/2026-01-28/discuss-mode-optimization/decisions/D02-directory-structure.md)

---

### D9: meta.yaml Programmatic Automation

**Decision Time**: 2026-01-28 R7  
**Status**: ✅ Confirmed  
**Supersedes**: Original agent-maintained meta.yaml

#### Background

The original design required the AI agent to manually maintain `meta.yaml`, including topic name, decision tracking, and round counting.

#### Final Decision

Make `meta.yaml` **fully automated through Hooks**, with zero agent responsibility.

#### Data Structure

```yaml
# meta.yaml - Fully maintained by Hooks

# Basic info (auto-derived from directory structure)
topic: "discuss-mode-optimization"  # From directory name
created: 2026-01-28                  # Auto-set on first creation

# Round management
current_round: 6                     # Current round number
# Rule: +1 per conversation where outline is updated (multiple edits = +1)

# Configuration
config:
  stale_threshold: 3                 # Remind if N rounds without update

# Decisions file tracking (auto-scanned from decisions/ directory)
decisions:
  - path: "decisions/D01-skill-merge.md"
    name: "D01-skill-merge.md"
    last_modified: "2026-01-28T01:30:00Z"
    last_updated_round: 5

# Notes file tracking (auto-scanned from notes/ directory)
notes:
  - path: "notes/template-analysis.md"
    name: "template-analysis.md"
    last_modified: "2026-01-28T00:45:00Z"
    last_updated_round: 3
```

#### Session Management

Temporary session files organized by platform + sessionID:

```
.discuss/.sessions/
├── claude-code/
│   └── {sessionID}.json
└── cursor/
    └── {sessionID}.json
```

> 📎 **Original Discussion**: [D03-meta-yaml-design.md](../../.discuss/2026-01-28/discuss-mode-optimization/decisions/D03-meta-yaml-design.md)

---

### D10: Hook Refactoring

**Decision Time**: 2026-01-28 R7  
**Status**: ✅ Confirmed

#### Background

Current hooks have issues with round counting and discussion mode detection.

#### Final Decision

Refactor hooks to support:
1. Session-based round counting (one increment per conversation)
2. Discussion mode detection (based on outline updates)
3. Fully automated meta.yaml maintenance

#### New Architecture

```
hooks/
├── common/
│   ├── file_utils.py
│   ├── meta_parser.py        # Refactored for new schema
│   ├── session_manager.py    # NEW: Session file management
│   └── platform_utils.py
├── file-edit/
│   └── track_file_edit.py    # Updates meta.yaml + session file
└── stop/
    └── check_precipitation.py # Round-based staleness check
```

#### Trigger Mechanism

| Trigger | Hook | Action |
|---------|------|--------|
| Outline edited | file-edit | 1. Find meta.yaml<br>2. Record in session<br>3. If first update, current_round +1 |
| Decision edited | file-edit | Update decisions[] with last_updated_round |
| Notes edited | file-edit | Update notes[] with last_updated_round |
| Conversation ends | stop | Check round difference, emit reminder if needed |

---

### D11: Post-Discussion Guidance

**Decision Time**: 2026-01-28 R8  
**Status**: ✅ Confirmed

#### Background

After a discussion concludes (all questions resolved/rejected/deferred), the system should guide users toward next steps rather than directly asking if they want to execute.

#### Final Decision

Add a **guidance response template** to the Skill. When discussion is detected as complete, include a response section that:

1. Informs user where discussion artifacts are located
2. Suggests multiple paths forward
3. Explains how to leverage the discussion context

#### Guidance Template

```markdown
## 🎉 Discussion Complete!

Your discussion has been captured. Here's what you can do next:

### 📁 Your Discussion Artifacts
Location: `.discuss/YYYY-MM-DD/[topic]/`

### 🚀 Recommended Next Steps
- **Option 1**: Generate Technical Specs (use SDD tools)
- **Option 2**: Create Execution Plan (switch to Plan mode)
- **Option 3**: Direct Execution (reference decisions as needed)
- **Option 4**: Archive for Later
```

#### Key Principles

1. **Boundary Clarity**: Discussion responsibility ends here; guide but don't implement downstream
2. **Tool Agnostic**: Suggest categories of tools, not specific products
3. **Context Emphasis**: Always tell users where files are and how to reference them
4. **No Lock-in**: Users can use any SDD tool or planning approach

> 📎 **Original Discussion**: [D05-post-discussion-guidance.md](../../.discuss/2026-01-28/discuss-mode-optimization/decisions/D05-post-discussion-guidance.md)

---

### D12: Response Depth Enhancement

**Decision Time**: 2026-01-28 R10-R11  
**Status**: ✅ Confirmed

#### Background

User feedback indicated that responses in discussion mode were too simple, lacking:
- Solution analysis when presenting options
- Trade-off explanations
- Relevant experience and case references

#### Final Decision

Add three key elements to improve discussion depth:

#### 1. Three Roles

| Role | Function | Example |
|------|----------|---------|
| **Socratic Questioner** | Clarify ideas through questioning | "You mentioned X, could you elaborate?" |
| **Devil's Advocate** | Challenge assumptions | "Are you sure this is the only solution?" |
| **Knowledge Connector** | Link related concepts | "This reminds me of the X pattern..." |

> The Devil's Advocate role is essential for depth - it prevents the agent from simply agreeing with everything.

#### 2. Problem Type Differentiation

| Problem Type | Strategy |
|--------------|----------|
| Factual | Answer directly |
| Design/Decision | Guide thinking, analyze tradeoffs |
| Open-ended | Challenge assumptions, explore alternatives |

#### 3. Discussion-First Principle

When user says "帮我写..." or "Generate...":
- ❌ Don't output multiple versions immediately
- ✅ Ask clarifying questions first
- ✅ Understand intent before producing output

#### Rationale

1. Role-based thinking provides clear behavioral guidance
2. Problem type differentiation prevents one-size-fits-all responses
3. Discussion-first prevents wasted rounds of guessing

> 📎 **Original Discussion**: [D06-response-depth.md](../../.discuss/2026-01-28/discuss-mode-optimization/decisions/D06-response-depth.md)

---

## 4. Platform Header Templates

### 4.1 Claude Code (`headers/claude-code.yaml`)

```yaml
---
name: discuss-mode
description: "In-depth conversation assistant for structured discussions with decision precipitation. Use when user requests discussion mode or wants to track decisions."
---
```

### 4.2 Cursor (`headers/cursor.yaml`)

```yaml
---
name: discuss-mode
description: "In-depth conversation assistant for structured discussions with decision precipitation. Use when user requests discussion mode or wants to track decisions."
alwaysApply: false
---
```

---

## 5. Compatibility Considerations

### 5.1 Feature Status

| Platform | Skills Feature | Stability |
|----------|----------------|-----------|
| Claude Code | ✅ Fully available | Stable |
| Cursor | ⚠️ May require Nightly | Beta |
| GitHub Copilot | ✅ Fully available | Stable |
| Windsurf | ✅ Fully available | Stable |
| Gemini CLI | ⚠️ Needs manual enable | Stable (once enabled) |

---

## 6. References

- [Technical Research](./2-technical-research.md)
- [spec-kit Project](https://github.com/spec-kit/spec-kit)
- [Original Discussion Records](../.discuss/2026-01-19/spec-kit-evaluation/)
- [2026-01-28 Update Discussion](../.discuss/2026-01-28/discuss-mode-optimization/)

---

**Last Updated**: 2026-01-28
