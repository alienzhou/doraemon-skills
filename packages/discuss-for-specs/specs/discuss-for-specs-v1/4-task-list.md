# Task List: Cross-Platform Skills Distribution Implementation

> **Created**: 2026-01-19  
> **Last Updated**: 2026-01-28  
> **Status**: In Progress

---

## Recent Changes (2026-01-28)

Based on [discuss-mode-optimization decisions](../.discuss/2026-01-28/discuss-mode-optimization/):

| Change | Impact |
|--------|--------|
| Skill merged into single `discuss-mode` | T1.x header tasks simplified |
| Directory changed to `.discuss/` | Hook-related tasks need update |
| meta.yaml fully automated | Hook refactoring tasks added |
| Session-based round counting | New implementation tasks |

---

## Development Tasks

### Phase 1: Configuration Setup

| ID | Task | Priority | Status | Notes |
|----|------|----------|--------|-------|
| T1.1 | Create `config/platforms.yaml` | P0 | 🟢 Done | Defined all 5 platforms |
| T1.2 | Create `discuss-mode` header for Cursor | P0 | 🟢 Done | `skills/discuss-mode/headers/cursor.yaml` |
| T1.3 | Create `discuss-mode` header for GitHub Copilot | P1 | 🔴 TODO | `skills/discuss-mode/headers/github-copilot.yaml` |
| T1.4 | Create `discuss-mode` header for Windsurf | P1 | 🔴 TODO | `skills/discuss-mode/headers/windsurf.yaml` |
| T1.5 | Create `discuss-mode` header for Gemini | P1 | 🔴 TODO | `skills/discuss-mode/headers/gemini.yaml` |

> **Note**: Old tasks for `discuss-coordinator` and `discuss-output` headers are obsolete. 
> Only single `discuss-mode` Skill headers needed now.

### Phase 2: Build System (D6)

| ID | Task | Priority | Status | Notes |
|----|------|----------|--------|-------|
| T2.1 | Create build script (`scripts/build.js`) | P0 | 🟢 Done | Concatenates headers + content → `dist/` |
| T2.2 | Generate `dist/<platform>/discuss-mode/SKILL.md` | P0 | 🟢 Done | Pre-built for all platforms |
| T2.3 | Add build to prepublish hook | P1 | 🟢 Done | Auto-build before npm publish |
| T2.4 | Update build for single Skill | P0 | 🔴 TODO | Remove old coordinator/output builds |

### Phase 3: npm Package Implementation

| ID | Task | Priority | Status | Notes |
|----|------|----------|--------|-------|
| T3.1 | Create npm package directory structure | P0 | 🟢 Done | `npm-package/` directory |
| T3.2 | Implement `package.json` | P0 | 🟢 Done | Package metadata, bin config, files list |
| T3.3 | Implement CLI entry point (`bin/cli.js`) | P0 | 🟢 Done | Uses commander |
| T3.4 | Implement `install` command | P0 | 🟢 Done | Copies pre-built files from `dist/` |
| T3.5 | Implement `platforms` command | P1 | 🟢 Done | Lists supported platforms |
| T3.6 | Add error handling and validation | P1 | 🟢 Done | User-friendly error messages |
| T3.7 | Update installer for single Skill | P0 | 🔴 TODO | Remove old coordinator/output installation |

### Phase 4: Hook Refactoring (NEW - D10)

| ID | Task | Priority | Status | Notes |
|----|------|----------|--------|-------|
| T4.1 | Create `session_manager.py` | P0 | 🔴 TODO | Session file management by platform + sessionID |
| T4.2 | Refactor `track_file_edit.py` | P0 | 🔴 TODO | Update meta.yaml + session file on outline edit |
| T4.3 | Refactor `check_precipitation.py` | P0 | 🔴 TODO | Round-based staleness check with session support |
| T4.4 | Update `meta_parser.py` for new schema | P0 | 🔴 TODO | Support `last_updated_round`, file tracking |
| T4.5 | Test session-based round counting | P0 | 🔴 TODO | Verify one increment per conversation |
| T4.6 | Update `.discuss/` directory detection | P1 | 🔴 TODO | Changed from `discuss/` to `.discuss/` |

### Phase 5: Testing

| ID | Task | Priority | Status | Notes |
|----|------|----------|--------|-------|
| T5.1 | Test build script | P0 | 🟢 Done | Verified `dist/` output |
| T5.2 | Local testing with `npm link` | P0 | 🟢 Done | All commands work |
| T5.3 | Test installation for each platform | P0 | 🟡 Partial | Claude Code tested, others pending |
| T5.4 | Test `npx` execution | P1 | 🔴 TODO | Verify works without prior install |
| T5.5 | Test hook refactoring | P0 | 🔴 TODO | Verify new session-based logic |

### Phase 6: Documentation & Release

| ID | Task | Priority | Status | Notes |
|----|------|----------|--------|-------|
| T6.1 | Update project README | P1 | 🟢 Done | Updated for single Skill |
| T6.2 | Update HOW-IT-WORKS docs | P1 | 🟢 Done | Updated for new architecture |
| T6.3 | Update VERIFICATION docs | P1 | 🟢 Done | Updated test scenarios |
| T6.4 | Create CHANGELOG | P2 | 🔴 TODO | Initial release notes |
| T6.5 | Publish to npm | P1 | 🔴 TODO | Initial release v0.1.0 |

---

## Temporary Todos

| Item | Description | Status |
|------|-------------|--------|
| npm package name availability | Verify `discuss-for-specs` is available on npm | 🔴 TODO |
| Claude Code header verification | Verified header file format | 🟢 Done |
| Remove old Skills directories | Removed `discuss-coordinator` and `discuss-output` | 🟢 Done |

---

## Task Dependencies (Updated)

```
Phase 1 (Config)       Phase 2 (Build)      Phase 3 (npm)         Phase 4 (Hooks)       Phase 5 (Test)
────────────────────────────────────────────────────────────────────────────────────────────────────────

T1.1 ─┬──────────────► T2.1 ─► T2.2 ───────► T3.1 ─► T3.2 ───────► T4.1 ─► T4.2 ──────► T5.1
      │                  │                      │                     │
T1.2 ─┼──────────────► T2.4 ─────────────────► T3.7                   ├─► T4.3 ──────► T5.5
      │                                         │                     │
T1.3 ─┤                                         ├─► T3.4 ──────────► T4.4
      │                                         │                     │
T1.4 ─┤                                         ├─► T3.5              └─► T4.5 ─► T4.6
      │                                         │
T1.5 ─┘                                         └─► T3.6

T5.3 ─► T5.4 ─► T6.1 ─► T6.4 ─► T6.5
```

---

## Priority Legend

- **P0**: Critical, must complete for MVP
- **P1**: Important, should complete for initial release
- **P2**: Nice to have, can defer if needed

## Status Legend

- 🔴 TODO: Not started
- 🟡 In Progress / Partial: Currently working on or partially complete
- 🟢 Done: Completed
- ⏸️ Blocked: Waiting on dependency

---

**Last Updated**: 2026-01-28
