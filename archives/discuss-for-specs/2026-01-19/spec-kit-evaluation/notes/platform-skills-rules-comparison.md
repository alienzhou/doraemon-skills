# AI Coding Assistant Platform Skill/Rules Mechanism Comparison Study

> Research Date: 2026-01-19
> Data Sources: Official platform documentation and community feedback (2024-2025)

## 📊 Platform Support Overview Table

| Platform | Skills Support | Rules Support | Auto Read | Directory Structure | File Format | Trigger Method |
|----------|---------------|---------------|-----------|---------------------|-------------|-----------------|
| **Claude Code** | ✅ | ✅ | ✅ | `.claude/skills/`<br>`.claude/rules/` | `SKILL.md` (YAML frontmatter)<br>`.md` (Rules) | Skills: Auto discovery (model-invoked)<br>Rules: Auto load (high priority) |
| **Cursor** | ✅ (Beta) | ✅ | ✅ | `.cursor/skills/<name>/`<br>`.cursor/rules/` | `SKILL.md` (YAML frontmatter)<br>`.mdc` (Rules) | Skills: Auto trigger<br>Rules: Auto load (high priority) |
| **GitHub Copilot** | ✅ | ✅ | ✅ | `.github/skills/<name>/`<br>`.github/instructions/` | `SKILL.md` (YAML frontmatter)<br>`.instructions.md` | Skills: Auto detection and load<br>Instructions: Auto load |
| **Windsurf** | ✅ | ✅ | ✅ | `.windsurf/skills/<name>/`<br>`.windsurf/rules/` | `SKILL.md` (YAML frontmatter)<br>`.md` (Rules) | Skills: Auto trigger (`@skill-name` explicit)<br>Rules: Auto load |
| **Gemini CLI** | ✅ | ⚠️ (Policy Engine) | ⚠️ | `.gemini/skills/<name>/`<br>`~/.gemini/policies/` | `SKILL.md` (YAML frontmatter)<br>`.toml` (Policies) | Skills: CLI enable/disable, supports auto discovery<br>Policies: Rule engine, controls tool permissions |

---

## 🔍 Detailed Comparison

### 1. Claude Code

#### Skills Mechanism
- **Directory**: `.claude/skills/` (project-level) or `~/.claude/skills/` (global)
- **File Format**: `SKILL.md`, must include YAML frontmatter:
  ```yaml
  ---
  name: skill-name
  description: "Skill description (need to explain when to use)"
  allowed-tools: [Read, Write]  # Optional
  ---
  ```
- **Trigger Method**: **Auto Discovery** (model-invoked)
  - Claude automatically determines whether to use based on `description` and user request
  - Supports "progressive loading": loads index first (name + description), loads full content only when needed
- **Features**:
  - Supports three types: project-level, global, plugin-level
  - Naming recommendation: use gerund-noun form (e.g., `processing-pdfs`)
  - Description should clearly state "what it does" and "when to use"

#### Rules Mechanism
- **Directory**: `.claude/rules/`
- **File Format**: `.md` file, supports YAML frontmatter path matching:
  ```yaml
  ---
  paths:
    - src/api/**/*.ts
  ---
  ```
- **Trigger Method**: **Auto Load** (high priority, same level as `CLAUDE.md`)
- **Features**:
  - Supports path matching, only affects specific files
  - Modular organization (e.g., `testing.md`, `security.md`)
  - Avoids overly large single `CLAUDE.md` file

#### Commands Mechanism
- **Directory**: `.claude/commands/` (speculated, not detailed)
- **Trigger Method**: Explicit trigger (Slash Command)

---

### 2. Cursor

#### Skills Mechanism
- **Directory**: `.cursor/skills/<skill-name>/`
- **File Format**: `SKILL.md`, must include YAML frontmatter:
  ```yaml
  ---
  name: skill-name
  description: "Skill description"
  ---
  ```
- **Trigger Method**: **Auto Trigger** (based on context matching)
- **Status**: Beta/Nightly (early 2026)
- **Known Issues**:
  - Some features (like `globs`) may be unstable
  - Auto-attach functionality may be incomplete

#### Rules Mechanism
- **Directory**: `.cursor/rules/`
- **File Format**: `.mdc` (Markdown with frontmatter)
  ```yaml
  ---
  description: "Rule description"
  globs: ["src/**/*.ts"]  # Optional
  alwaysApply: true  # Optional
  type: Always | Auto Attached | Agent Requested | Manual
  ---
  ```
- **Trigger Method**: **Auto Load** (high priority)
- **Features**:
  - Supports nested `.cursor/rules` directories (directory-level scope)
  - Recommended each rule file < 500 lines
  - Legacy format `.cursorrules` still supported but deprecated

#### Commands Mechanism
- **Directory**: `.cursor/commands/`
- **File Format**: `.<command-name>.md`
- **Trigger Method**: Explicit trigger (displayed when input `/`)

---

### 3. GitHub Copilot

#### Agent Skills Mechanism
- **Directory**: `.github/skills/<skill-name>/`
- **File Format**: `SKILL.md`, must include YAML frontmatter:
  ```yaml
  ---
  name: skill-name
  description: "Skill description (need to explain when to use)"
  license: MIT  # Optional
  ---
  ```
- **Trigger Method**: **Auto Detection and Load** (when prompt matches)
- **Features**:
  - Supports project-level and global (`~/.claude/skills/` backward compatible)
  - Folder names must be lowercase, hyphen-separated
  - Supports CLI, Code Agent, VS Code extension

#### Custom Instructions Mechanism
- **Directory**:
  - `.github/copilot-instructions.md` (project-level)
  - `.github/instructions/*.instructions.md` (path-specific)
- **File Format**: Markdown + YAML frontmatter:
  ```yaml
  ---
  applyTo: "src/**/*.ts"
  ---
  ```
- **Trigger Method**: **Auto Load**
- **Features**:
  - Path-specific instructions only effective when matching files
  - Project-level and path-specific instructions are used together (not overridden)

---

### 4. Windsurf

#### Skills Mechanism
- **Directory**: `.windsurf/skills/<skill-name>/`
- **File Format**: `SKILL.md`, includes YAML frontmatter
- **Trigger Method**: **Auto Trigger** (based on context), also supports explicit call `@skill-name`
- **Features**:
  - Supports multi-step workflows
  - Can include templates, scripts, and other auxiliary resources
  - Cascade (AI assistant) automatically determines when to use

#### Rules Mechanism
- **Directory**: `.windsurf/rules/` or root directory `.windsurfrules` (legacy)
- **File Format**: `.md` file
- **Trigger Method**: **Auto Load**
- **Features**:
  - Supports workspace rules and global rules (`~/.codeium/windsurf/memories/global_rules.md`)
  - Can trigger based on file type/glob
  - Affects code style, conventions, response format

#### Workflows Mechanism
- **Directory**: `.windsurf/workflows/`
- **File Format**: `.md` file
- **Trigger Method**: **Explicit Trigger** (`/workflow-name`)
- **Features**:
  - Repeatable sequence of steps
  - Discovery scope: workspace → parent directory → git root → system level

#### AGENTS.md Mechanism
- **File**: `AGENTS.md` or `agents.md`
- **Trigger Method**: **Auto Read** (based on file location)
- **Features**:
  - Directory-level scope (placed in subdirectory only affects that directory)
  - Root directory's `AGENTS.md` affects the entire project

---

### 5. Gemini CLI

#### Agent Skills Mechanism
- **Directory**:
  - `.gemini/skills/` (project-level)
  - `~/.gemini/skills/` (user-level)
  - Within extensions (extension-level)
- **File Format**: `SKILL.md`, includes YAML frontmatter
- **Trigger Method**: **CLI Control** (`enable`/`disable`), but supports auto discovery
- **Features**:
  - Three-tier priority: project > user > extension
  - Can be managed via CLI or interactive commands (`/skills`)
  - Needs explicit enable, but supports auto discovery after enabling

#### Policy Engine Mechanism
- **Directory**: `~/.gemini/policies/`
- **File Format**: `.toml` file
- **Trigger Method**: **Auto Evaluation** (rule engine)
- **Features**:
  - Controls tool permissions (read/write/execute)
  - Rules match tool calls, determine `allow`/`ask_user`/`deny`
  - Priority system: Default < User < Admin
  - Default behavior: read-only tools allowed, write/execute needs user confirmation

#### System Prompt Mechanism
- **File**: `.gemini/system.md` or via `GEMINI_SYSTEM_MD` environment variable
- **Trigger Method**: **Auto Load**

---

## 🎯 Key Findings

### ✅ Commonalities

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

### ⚠️ Differences

1. **Rules Naming and Format**
   - Claude Code: `.claude/rules/*.md`
   - Cursor: `.cursor/rules/*.mdc` (special extension)
   - GitHub Copilot: `.github/instructions/*.instructions.md` (special suffix)
   - Windsurf: `.windsurf/rules/*.md` or `.windsurfrules`
   - Gemini CLI: Uses Policy Engine (`.toml`), not traditional Rules

2. **Skills Trigger Mechanism**
   - Claude Code: Fully automatic (model-invoked)
   - Cursor: Auto trigger (Beta, may be unstable)
   - GitHub Copilot: Auto detection and load
   - Windsurf: Auto trigger + explicit call (`@skill-name`)
   - Gemini CLI: Needs CLI enable, but auto discovery after enabling

3. **Path Matching Support**
   - Claude Code: ✅ (Rules supports `paths` frontmatter)
   - Cursor: ✅ (Rules supports `globs`)
   - GitHub Copilot: ✅ (Instructions supports `applyTo`)
   - Windsurf: ✅ (Rules supports file type/glob)
   - Gemini CLI: ❌ (Policy Engine not based on path)

---

## 📝 Difference from Slash Commands

| Feature | Skills/Rules | Slash Commands |
|---------|-------------|----------------|
| **Trigger Method** | Automatic (based on context) | Explicit (user input `/xxx`) |
| **File Location** | `.<platform>/skills/` or `.<platform>/rules/` | `.<platform>/commands/` |
| **File Format** | `SKILL.md` (Skills) or `.md`/`.mdc` (Rules) | `.md` or `.toml` |
| **Parameter Passing** | No standard method (via context) | `$ARGUMENTS` or `{{args}}` |
| **Use Cases** | Capability extension, rule constraints | Workflow automation, task execution |
| **Platform Support** | Major platforms all support | Most platforms support |

---

## 💡 Insights for skill-discuss-for-specs

### 1. Skills is Mainstream Direction
- ✅ All major platforms support Skills mechanism
- ✅ High standardization (`SKILL.md` + YAML frontmatter)
- ✅ Supports auto discovery and loading

### 2. Cross-Platform Distribution Strategy
- **Option A**: Only distribute Skills (recommended)
  - Aligns with mainstream trend
  - Auto trigger, good user experience
  - But Gemini CLI needs extra enable step

- **Option B**: Skills + Commands dual mode
  - Covers more use cases
  - But high maintenance cost

### 3. Directory Conventions
- Directly adopt each platform's standard conventions:
  - Claude Code: `.claude/skills/`
  - Cursor: `.cursor/skills/`
  - GitHub Copilot: `.github/skills/`
  - Windsurf: `.windsurf/skills/`
  - Gemini CLI: `.gemini/skills/`

### 4. Build Process Recommendation
- Reference spec-kit's three-tier architecture:
  1. **Config Layer**: `AGENT_CONFIG` defines platform information
  2. **Template Layer**: `templates/skills/*.md` common templates
  3. **Build Layer**: Scripts generate platform-specific files

---

## 📚 Reference Resources

- [Claude Code Skills Documentation](https://docs.claude.com/en/docs/claude-code/skills)
- [Claude Code Rules Directory](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Windsurf Skills Documentation](https://docs.windsurf.com/windsurf/cascade/skills)
- [Gemini CLI Skills Documentation](https://geminicli.com/docs/cli/skills/)

---

**Last Updated**: 2026-01-19
