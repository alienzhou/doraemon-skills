# Implementation Guide for Multi-Agent Platform Support

> **Created**: 2026-01-31
> **Purpose**: Complete implementation guide for the next session
> **See also**: [outline.md](../outline.md) for decision summary

## Quick Start

### What to Implement

**Phase 1 (4 platforms, Skills-based)**:
1. Cline (L2) - SKILL.md + TaskComplete Hook
2. Kilocode (L1) - SKILL.md only
3. OpenCode (L1) - SKILL.md only
4. Codex CLI (L1) - SKILL.md only

**Phase 2 (Deferred)**:
- Gemini CLI, Roo-Code (require Custom Mode approach)

### Key Decisions to Follow
- D01: Snapshot-based detection
- D03: Two-level architecture (L1/L2)
- D05: L1 Skill guidance design
- D10: Final platform list (this document)

---

## Phase 1 Platform Details

### 1.1 Kilocode (v5.2.2) - L1
- [ ] Create `platforms/kilocode/` directory
- [ ] Create `platforms/kilocode/build/discuss-for-specs/SKILL.md`
- [ ] Add build script `platforms/kilocode/build.sh`
- [ ] Add install script `platforms/kilocode/install.sh`

**Key Info**:
- Skill directory: `.kilocode/skills/discuss-for-specs/` or `~/.kilocode/skills/`
- Format: Standard SKILL.md with YAML frontmatter
- Naming: lowercase, hyphens only (strict validation)

#### 1.2 OpenCode (v1.1.47)
- [ ] Create `platforms/opencode/` directory
- [ ] Create `platforms/opencode/build/discuss-for-specs/SKILL.md`
- [ ] Add build script `platforms/opencode/build.sh`
- [ ] Add install script `platforms/opencode/install.sh`

**Key Info**:
- Skill directory: `.opencode/skill/` or `.claude/skills/` (compatible)
- Format: Standard SKILL.md with YAML frontmatter
- Also supports `~/.opencode/skill/` for global

#### 1.3 Codex CLI
- [ ] Create `platforms/codex/` directory
- [ ] Create `platforms/codex/build/discuss-for-specs/SKILL.md`
- [ ] Add build script `platforms/codex/build.sh`
- [ ] Add install script `platforms/codex/install.sh`

**Key Info**:
- Skill directory: `.codex/skills/discuss-for-specs/`
- Format: Standard SKILL.md with YAML frontmatter
- Also supports AGENTS.md for project-wide guidance

---

#### 1.4 Cline (v3.56.1) - L2 with Skills + Hook
- [ ] Create `platforms/cline/` directory
- [ ] Create `platforms/cline/build/discuss-for-specs/SKILL.md`
- [ ] Create `platforms/cline/hooks/TaskComplete` (shell script)
- [ ] Add build script `platforms/cline/build.sh`
- [ ] Add install script `platforms/cline/install.sh`

**Key Info**:
- Skill directory: `.cline/skills/` or `.clinerules/skills/`
- Hook directory: `.clinerules/hooks/TaskComplete`
- Hook protocol: JSON stdin/stdout
- Platform limitation: macOS/Linux only

**Hook Input Format**:
```json
{
  "clineVersion": "3.56.1",
  "hookName": "TaskComplete",
  "timestamp": "1706700000000",
  "taskId": "task-id",
  "workspaceRoots": ["/path/to/workspace"],
  "userId": "user-id",
  "taskComplete": { "task": "task description" }
}
```

**Hook Output Format**:
```json
{
  "cancel": false,
  "contextModification": "Reminder: Check if decisions need to be precipitated",
  "errorMessage": ""
}
```

---

### Phase 2: Custom Mode Platforms (DEFERRED)

> **Note**: These platforms do NOT support Agent Skills, only Hooks or Custom Modes.
> They will be implemented after Phase 1 is complete.

#### 2.1 Gemini CLI (DEFERRED)
- [ ] Create `platforms/gemini-cli/` directory
- [ ] Create Gemini CLI configuration
- [ ] Create `platforms/gemini-cli/hooks/AfterAgent`
- [ ] Add build script `platforms/gemini-cli/build.sh`
- [ ] Add install script `platforms/gemini-cli/install.sh`

**Key Info**:
- **No Skills support** - cannot use standard SKILL.md
- Hook type: AfterAgent (triggers after agent completes)
- Hook protocol: JSON stdin/stdout (similar to Cline)

#### 2.2 Roo-Code (DEFERRED)
- [ ] Create `platforms/roo-code/` directory
- [ ] Create `.roomodes` configuration template
- [ ] Add documentation for manual setup

**Key Info**:
- **No Skills support** - cannot use standard SKILL.md
- **No Hooks support** - cannot auto-detect
- Uses Custom Mode system for adaptation

### Phase 3: Core Implementation

#### 3.1 Snapshot Manager
- [ ] Implement `hooks/common/snapshot_manager.py`
- [ ] Implement snapshot comparison logic
- [ ] Implement change_count tracking

**Snapshot Schema** (`.discuss/.snapshot.yaml`):
```yaml
version: 1
config:
  stale_threshold: 3

discussions:
  "2026-01-30/topic-name":
    outline:
      mtime: 1706621400.0
      change_count: 2
    decisions:
      - name: "D01-xxx.md"
        mtime: 1706620000.0
    notes:
      - name: "analysis.md"
        mtime: 1706619000.0
```

#### 3.2 Precipitation Checker
- [ ] Rewrite `hooks/stop/check_precipitation.py`
- [ ] Integrate with snapshot_manager
- [ ] Output reminder when change_count >= threshold

---

## Key Decisions Reference

| ID | Decision | Document |
|----|----------|----------|
| D01 | Snapshot-based detection (not file-watching) | D01-snapshot-based-detection.md |
| D02 | Remove meta.yaml, use snapshot.yaml | D02-remove-meta-yaml.md |
| D03 | Two-level architecture (L1/L2) | D03-two-level-architecture.md |
| D04 | Snapshot parameters (24h window, mtime, full tracking) | D04-snapshot-parameters.md |
| D05 | L1 Skill guidance design | D05-l1-skill-guidance.md |
| D06 | OpenCode downgrade to L1 | D06-opencode-downgrade-l1.md |
| D07 | Roo Code removed from scope | D07-roo-code-removed.md |
| D08 | Batch 1 platforms (7, later reduced) | D08-batch1-platforms.md |
| D09 | Final platform list (5 platforms) | D09-final-platform-list.md |
| D10 | Gemini CLI deferred to Phase 2 | D10-gemini-cli-deferred.md |

---

## Research Reference

For detailed platform-specific information, see:
- `notes/platform-research.md` - Complete research with version tags

Key sections:
- Version Information (Cline v3.56.1, Kilocode v5.2.2, OpenCode v1.1.47)
- Platform Capability Matrix
- Batch 1 Detailed Research (each platform's config locations, formats, etc.)
- Two-Level Architecture Summary
- Adaptation Work Summary

---

## Deferred Items

The following were researched but deferred:
- **Gemini CLI** - No Skills support, only Hooks (deferred to Phase 2)
- **Roo-Code** (v3.8.4) - No Skills/Hooks, Custom Mode only (deferred to Phase 2)
- **Cursor** - Already supported, no changes needed
- **Trae, Amp, Windsurf, Qoder CLI, CodeBuddy CLI** - Not yet researched in detail
