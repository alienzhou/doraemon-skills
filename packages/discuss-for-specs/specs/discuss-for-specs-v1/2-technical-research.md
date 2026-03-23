# Technical Research: AI Coding Platform Skills/Rules Mechanism Comparison

> **Research Date**: 2026-01-19  
> **Last Updated**: 2026-01-28  
> **Data Sources**: Official platform documentation and community feedback (2024-2025)

---

## 1. Research Background and Objectives

### 1.1 Background

The `skill-discuss-for-specs` project needs to distribute discussion capabilities across different AI coding assistant platforms. Before designing the distribution architecture, we need to understand the Skills/Rules mechanisms supported by each platform.

> **Note (2026-01-28)**: The original design mentioned `discuss-coordinator` and `discuss-output` as two separate Skills. 
> These have been merged into a single `discuss-mode` Skill. See [Architecture Decision D7](./3-architecture.md#d7-skill-architecture-merge).

### 1.2 Research Objectives

1. Understand the Skill/Rule mechanisms of mainstream AI coding platforms
2. Identify commonalities and differences across platforms
3. Provide a decision basis for cross-platform distribution architecture

---

## 2. Platform Support Overview

| Platform | Skills Support | Rules Support | Auto Read | Directory Structure | File Format | Trigger Method |
|----------|---------------|---------------|-----------|---------------------|-------------|-----------------|
| **Claude Code** | ✅ | ✅ | ✅ | `.claude/skills/`<br>`.claude/rules/` | `SKILL.md` (YAML frontmatter)<br>`.md` (Rules) | Skills: Auto discovery (model-invoked)<br>Rules: Auto load |
| **Cursor** | ✅ (Beta) | ✅ | ✅ | `.cursor/skills/<name>/`<br>`.cursor/rules/` | `SKILL.md` (YAML frontmatter)<br>`.mdc` (Rules) | Skills: Auto trigger<br>Rules: Auto load |
| **GitHub Copilot** | ✅ | ✅ | ✅ | `.github/skills/<name>/`<br>`.github/instructions/` | `SKILL.md` (YAML frontmatter)<br>`.instructions.md` | Skills: Auto detection and load<br>Instructions: Auto load |
| **Windsurf** | ✅ | ✅ | ✅ | `.windsurf/skills/<name>/`<br>`.windsurf/rules/` | `SKILL.md` (YAML frontmatter)<br>`.md` (Rules) | Skills: Auto trigger (`@skill-name` explicit)<br>Rules: Auto load |
| **Gemini CLI** | ✅ | ⚠️ (Policy Engine) | ⚠️ | `.gemini/skills/<name>/`<br>`~/.gemini/policies/` | `SKILL.md` (YAML frontmatter)<br>`.toml` (Policies) | Skills: CLI enable/disable, supports auto discovery<br>Policies: Rule engine |

---

## 3. Detailed Platform Analysis

### 3.1 Claude Code

#### Skills Mechanism
- **Directory**: `.claude/skills/` (project-level) or `~/.claude/skills/` (global)
- **File Format**: `SKILL.md` with YAML frontmatter
  ```yaml
  ---
  name: skill-name
  description: "Skill description (need to explain when to use)"
  allowed-tools: [Read, Write]  # Optional
  ---
  ```
- **Trigger Method**: **Auto Discovery** (model-invoked)
  - Claude automatically determines whether to use based on `description` and user request
  - Supports "progressive loading": loads index first, loads full content only when needed
- **Features**:
  - Supports three types: project-level, global, plugin-level
  - Naming recommendation: use gerund-noun form (e.g., `processing-pdfs`)

#### Rules Mechanism
- **Directory**: `.claude/rules/`
- **File Format**: `.md` file with optional YAML frontmatter for path matching
- **Trigger Method**: **Auto Load** (high priority)
- **Features**: Supports path matching, modular organization

### 3.2 Cursor

#### Skills Mechanism
- **Directory**: `.cursor/skills/<skill-name>/`
- **File Format**: `SKILL.md` with YAML frontmatter
- **Trigger Method**: **Auto Trigger** (based on context matching)
- **Status**: Beta/Nightly (early 2026)
- **Known Issues**: Some features (like `globs`) may be unstable

#### Rules Mechanism
- **Directory**: `.cursor/rules/`
- **File Format**: `.mdc` (Markdown with frontmatter)
  ```yaml
  ---
  description: "Rule description"
  globs: ["src/**/*.ts"]  # Optional
  alwaysApply: true  # Optional
  ---
  ```
- **Features**: Supports nested rules directories, each file < 500 lines recommended

### 3.3 GitHub Copilot

#### Agent Skills Mechanism
- **Directory**: `.github/skills/<skill-name>/`
- **File Format**: `SKILL.md` with YAML frontmatter
- **Trigger Method**: **Auto Detection and Load** (when prompt matches)
- **Features**:
  - Supports project-level and global
  - Folder names must be lowercase, hyphen-separated

#### Custom Instructions Mechanism
- **Directory**: `.github/copilot-instructions.md` or `.github/instructions/*.instructions.md`
- **Features**: Supports path-specific instructions with `applyTo` frontmatter

### 3.4 Windsurf

#### Skills Mechanism
- **Directory**: `.windsurf/skills/<skill-name>/`
- **File Format**: `SKILL.md` with YAML frontmatter
- **Trigger Method**: **Auto Trigger** + explicit call `@skill-name`
- **Features**: Supports multi-step workflows, can include templates and scripts

#### Rules Mechanism
- **Directory**: `.windsurf/rules/` or root directory `.windsurfrules`
- **Features**: Supports workspace and global rules

### 3.5 Gemini CLI

#### Agent Skills Mechanism
- **Directory**: `.gemini/skills/` (project) or `~/.gemini/skills/` (user)
- **File Format**: `SKILL.md` with YAML frontmatter
- **Trigger Method**: **CLI Control** (`enable`/`disable`), but supports auto discovery after enabling
- **Features**: Three-tier priority: project > user > extension

#### Policy Engine Mechanism
- **Directory**: `~/.gemini/policies/`
- **File Format**: `.toml` file
- **Features**: Controls tool permissions (read/write/execute), rule-based evaluation

---

## 4. Frontmatter Field Comparison

### 4.1 Required Fields (Common to all platforms)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique skill identifier |
| `description` | string | Describes what it does + when to use |

### 4.2 Platform-Specific Fields

| Field | Claude Code | Cursor | GitHub Copilot | Windsurf | Gemini CLI |
|-------|-------------|--------|----------------|----------|------------|
| `allowed-tools` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `model` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `alwaysApply` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `globs` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `license` | ❌ | ❌ | ✅ | ❌ | ❌ |

### 4.3 Validation Rules (Claude Code)

| Field | Rules |
|-------|-------|
| `name` | Max 64 characters; only lowercase letters, numbers, hyphens; cannot contain "anthropic" or "claude" |
| `description` | Non-empty; max 1024 characters; **must be single line**; cannot contain XML tags |

---

## 5. Key Findings

### 5.1 Commonalities

1. **Skills Standardization Trend**
   - All platforms adopt `SKILL.md` file
   - All use YAML frontmatter (at minimum includes `name` and `description`)
   - Similar directory structure: `.<platform>/skills/<skill-name>/`

2. **Auto Read Mechanism**
   - All platforms support "context auto read" (not explicit commands)
   - Both Skills and Rules are auto-discovered/loaded
   - Clearly different from Slash Commands

3. **Layered Configuration**
   - Project-level > User-level > System-level/Extension-level
   - Supports both global and project-specific configuration

### 5.2 Differences

1. **Rules Naming and Format**
   - Claude Code: `.claude/rules/*.md`
   - Cursor: `.cursor/rules/*.mdc` (special extension)
   - GitHub Copilot: `.github/instructions/*.instructions.md`
   - Windsurf: `.windsurf/rules/*.md` or `.windsurfrules`
   - Gemini CLI: Policy Engine (`.toml`)

2. **Skills Trigger Mechanism**
   - Claude Code: Fully automatic (model-invoked)
   - Cursor: Auto trigger (Beta, may be unstable)
   - GitHub Copilot: Auto detection and load
   - Windsurf: Auto trigger + explicit call
   - Gemini CLI: Needs CLI enable, then auto discovery

3. **Path Matching Support**
   - Claude Code, Cursor, GitHub Copilot, Windsurf: ✅ Supported
   - Gemini CLI: ❌ Not path-based

---

## 6. Difference from Slash Commands

| Feature | Skills/Rules | Slash Commands |
|---------|-------------|----------------|
| **Trigger Method** | Automatic (based on context) | Explicit (user input `/xxx`) |
| **File Location** | `.<platform>/skills/` or `.<platform>/rules/` | `.<platform>/commands/` |
| **Use Cases** | Capability extension, rule constraints | Workflow automation, task execution |
| **Platform Support** | All major platforms support | Most platforms support |

---

## 7. Research Conclusions

### 7.1 Skills is the Mainstream Direction

- ✅ All major platforms support Skills mechanism
- ✅ High standardization (`SKILL.md` + YAML frontmatter)
- ✅ Supports auto discovery and loading

### 7.2 Recommended Cross-Platform Strategy

1. **Use Skills as Primary Distribution Format**
   - Aligns with mainstream trend
   - Auto trigger, good user experience
   - Gemini CLI needs extra enable step (acceptable)

2. **Maintain Separate Headers for Each Platform**
   - Different platforms have different optional fields
   - Build-time concatenation: `headers/<platform>.yaml` + `SKILL.md`

3. **Adopt Each Platform's Standard Directory Conventions**
   - Claude Code: `.claude/skills/`
   - Cursor: `.cursor/skills/`
   - GitHub Copilot: `.github/skills/`
   - Windsurf: `.windsurf/skills/`
   - Gemini CLI: `.gemini/skills/`

---

## 8. References

- [Claude Code Skills Documentation](https://docs.claude.com/en/docs/claude-code/skills)
- [Claude Code Rules Directory](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Windsurf Skills Documentation](https://docs.windsurf.com/windsurf/cascade/skills)
- [Gemini CLI Skills Documentation](https://geminicli.com/docs/cli/skills/)

---

**Last Updated**: 2026-01-19
