# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.4] - 2026-03-17

### Added

- **`--activate` command**: Lightweight project activation — injects checkpoint rules into `AGENTS.md` without full project-local install. Requires prior global or project-level installation. Includes installation status diagnosis with actionable guidance when prerequisites are missing.
- **Hunk-level checkpoint flow (V1)**: Add `alloc_patch` helper scripts and `--patch-file` / `-PatchFile` support so agents can commit selected hunks through a unified diff patch instead of always staging the full workspace.

### Changed

- Stop hook reminder and `SKILL.md` now guide agents through the patch allocation → selected hunk patch → checkpoint flow, and explicitly instruct them to hand control back to the user when `ABC_PATCH_*` errors indicate unsafe partial commits.

### Fixed

- **UTF-8 prompt truncation (Unix)**: Fix garbled text when truncating multi-byte prompts (e.g., Chinese) under `LC_ALL=C` / C locale by forcing UTF-8 locale during truncation.

---

## [0.3.3] - 2026-03-05

### Added

- **AGENTS.md auto-injection**: Project-level installs (`--target`) now automatically inject a checkpoint rule block into `AGENTS.md`
- Block uses HTML comments for precise identification: `<!-- [ABC:agent-better-checkpoint:start/end] -->`
- Uninstall automatically removes the injected block (preserves other content)

### Changed

- Improved `description` field following skill guide pattern: `[What it does] + [When to use it] + [Trigger phrases]`
- Description now includes user trigger phrases: "commit changes", "create checkpoint", "save my progress"

### Fixed

- **Platform detection**: Use runtime env vars instead of `command -v` / `Get-Command`. Priority: `CURSOR_AGENT` / `CURSOR_TRACE_ID` → cursor; `CLAUDE_CODE` → claude-code. Fixes misdetection when claude CLI is installed but running in Cursor.

---

## [0.3.2] - 2026-02-24

### Changed

- CLI always installs both `.sh` and `.ps1` scripts regardless of current OS, enabling seamless cross-platform use
- SKILL.md: improved installation check — instructs agents to use file-listing/read tools instead of shell `test -f` (avoids CWD mismatch)
- SKILL.md: simplified "How to Commit" section with table format, prefer project-local paths in examples

---

## [0.3.1] - 2026-02-24

### Changed

- `--target` is now project-only: installs skill, hooks, scripts only to the target directory (`.cursor/skills/`, `.cursor/hooks.json`, `.vibe-x/`), no global writes; use without `--target` for global install
- Project-level hooks use `.cursor/hooks/` with relative path commands, following [Cursor project hooks](https://cursor.com/docs/agent/hooks) convention
- Project-level skill installed to `.cursor/skills/` (or `.claude/skills/`), following [Cursor project skills](https://cursor.com/docs/context/skills) convention
- All scripts (checkpoint + stop hook) always install both `.sh` and `.ps1` regardless of current OS, for both global and project modes

### Fixed

- Uninstall with `--target` auto-detects platform from project directory when `--platform` is omitted
- Removed dead `alreadyRegistered` variable in `registerCursorHook`

---

## [0.3.0] - 2026-02-24

### Added

- `--target` option for project-level install
- Project-local mode: `.vibe-x/agent-better-checkpoint/` can be committed with project

### Changed

- Renamed `--project-local` / `--dir` to unified `--target` option

### Fixed

- Uninstall now correctly cleans all installed platforms

---

## [0.2.0] - 2025

### Added

- **ABC** (Agent Better Checkpoint) acronym in branding
- Passive file filtering and threshold trigger in stop hook: configurable via `.vibe-x/config/checkpoint.yaml`
- `discuss-for-specs` skill with hooks infrastructure for discussion facilitation

### Changed

- Restructured project with `.vibe-x` local scripts layout
- Stop hook: passive patterns (e.g. `.discuss/**`, `.vibe-x/**`) and `min_changed_lines` threshold

---

## [0.1.1] - 2025

### Fixed

- Claude: install skill to standard skills directory

### Chore

- Ignore `.agentlens` directory
- Add agent skills configuration

---

## [0.1.0] - 2025

### Added

- Node.js CLI installer (`npx @vibe-x/agent-better-checkpoint`)
- Unix stop hook: Bash `check_uncommitted.sh`
- Windows stop hook: PowerShell scripts
- SKILL.md with bootstrap and platform commands
- npm package layout: `bin/`, `platform/`, `skill/`
- Core MVP: checkpoint.sh commit script, Conventional Commits + Git Trailers format
- README in English and Chinese
- CONTRIBUTING.md developer handbook
