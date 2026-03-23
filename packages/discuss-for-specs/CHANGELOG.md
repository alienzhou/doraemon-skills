# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-02-24

### Changed

- **Directory structure migration** - Migrated all installation directories to unified `.vibe-x/discuss-for-specs` namespace
  - User-level hooks: `~/.vibe-x/discuss-for-specs/hooks/`
  - User-level logs: `~/.vibe-x/discuss-for-specs/logs/` (unified for all installation modes)
  - Project-level hooks: `${projectDir}/.vibe-x/discuss-for-specs/hooks/`
  - Project-level hooks now use unified structure regardless of platform

- **Automatic migration on upgrade** - Added `cleanupOldHooksConfig()` to automatically remove old hooks configuration during upgrade
  - Prevents duplicate hook triggers when upgrading from older versions
  - Cleans up references to old path `~/.discuss-for-specs/hooks/` in platform settings

### Breaking Changes

- Old installation path `~/.discuss-for-specs/` is no longer used
- Old project-level hooks path `${projectDir}/.{platform}/hooks/` is replaced with `${projectDir}/.vibe-x/discuss-for-specs/hooks/`
- Upgrade will automatically remove old hooks configuration to prevent duplicate triggers

## [0.4.2] - 2026-02-24

### Added

- **Config command** - New `config` command for updating `.discuss/.snapshot.yaml` without manual editing
  - `discuss-for-specs config` - Show current config
  - `discuss-for-specs config --stale-threshold <n>` - Set reminder threshold (0=disabled)
  - `discuss-for-specs config -t <dir>` - Target specific project directory

## [0.4.0] - 2026-02-12

### Added

- **New platform support** - Added CodeFlicker (L1) platform support
  - Skills-only capability (no hooks)
  - Config directory: `.codeflicker/skills`

## [0.3.0] - 2026-02-03

### Added

- **New platform support** - Added support for 4 additional platforms:
  - Cline (L2) - Full support with Skills + TaskComplete hook
  - Trae (L1) - Skills only
  - Qoder (L1) - Skills only
  - Roo-Code (L1) - Skills only

- **Export command** - New `export` command for raw directory export
  - `discuss-for-specs export <dir>` - Export skills directly to target directory
  - `--include-l1-guidance` - Optional flag to include L1 platform guidance
  - Useful for unsupported platforms or custom deployment scenarios

- **Workspace detection improvement** - Enhanced workspace root detection
  - Now supports stdin JSON (`workspace_roots`, `workspaceRoots`) from platforms
  - Priority-based detection: stdin > environment variables > cwd

- **Integration tests enhancement** - Improved test coverage
  - Python: 107 tests
  - Node.js: 61 tests

### Changed

- **CLI simplification** - Streamlined CLI options
  - Removed `--project-level` flag (use `--target .` instead)
  - `--platform` is now required for `install` and `uninstall` commands
  - Unified project-level installation via `--target` flag

- **CLI help output optimization** - Improved help scannability
  - Added "Get Started" section at top of main help for quick orientation
  - Simplified platform list in main help (inline format)
  - Added table format for `platforms` command output
  - Applied color emphasis to key elements (section headers, commands, platforms, flags)
  - Reorganized help structure: new users see quick start, experienced users find detailed options in subcommand help

- **SKILL.md workspace guidance** - Updated workspace root guidance in SKILL.md to prevent incorrect `.discuss/` directory creation

### Removed

- **Auto-detect platform behavior** - Removed automatic platform detection for install/uninstall commands
  - Users must now explicitly specify `--platform` to avoid ambiguity
  - `discuss-for-specs platforms` command shows available platforms

### Documentation

- Added D04 decision document for CLI simplification and export command
- Added D05 decision document for CLI help output optimization
- Updated VERIFICATION.md with new test scenarios

## [0.2.0] - 2026-02-01

### Added

- **Multi-platform L1 support** - Added installation support for Kilocode, OpenCode, and Codex CLI platforms
  - L1 platforms support skill installation only (no hooks/auto-tracking)
  - L2 platforms (Claude Code, Cursor) retain full functionality with hooks support

### Changed

- **Snapshot-based detection** - Replaced session-based tracking with snapshot-based detection mechanism
  - Removed `session_manager.py`, added `snapshot_manager.py`
  - Discussion state changes are now tracked via `.discuss/.snapshot.yaml`
  - Simplified `check_precipitation.py` logic

- **Unified installation entry** - Consolidated platform-specific installation scripts into a single entry point
  - Removed separate `platforms/*/install.sh` scripts
  - All platform installations are now handled through the npm package

### Removed

- **curl-based installation** - Removed curl installation method in favor of npm-only installation
  - Deleted standalone `install.sh` script
  - Updated all documentation to reflect npm-only installation

### Documentation

- Finalized multi-agent platform support discussion and decisions
- Updated documentation for snapshot-based architecture

## [0.1.0] - 2026-01-29

### Added

- Initial release of `@vibe-x/discuss-for-specs` npm package
- **Discussion facilitation system** with structured templates
- **Hooks system** for automatic precipitation detection
  - Stop hook for checking pending decisions
  - File edit tracking
- **Multi-platform support**
  - Claude Code (L2 - full support)
  - Cursor (L2 - full support)
- **CLI tool** with beautiful output (colors, spinners)
  - `discuss-for-specs install` - Install skill and hooks
  - `discuss-for-specs uninstall` - Remove skill and hooks
  - `discuss-for-specs status` - Check installation status
- **Skill templates** for structured discussions
  - State-priority format for decision tracking
  - Outline, decisions, and notes organization
- Cross-platform distribution architecture
- Comprehensive test suite

[0.4.2]: https://github.com/alienzhou/skill-discuss-for-specs/compare/v0.4.1...v0.4.2
[0.3.0]: https://github.com/alienzhou/skill-discuss-for-specs/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/alienzhou/skill-discuss-for-specs/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/alienzhou/skill-discuss-for-specs/releases/tag/v0.1.0
