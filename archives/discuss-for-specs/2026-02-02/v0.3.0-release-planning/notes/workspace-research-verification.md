# Workspace Detection Research Verification

**Date**: 2026-02-02  
**Purpose**: Verify that the workspace detection scheme in the v0.3.0 outline is accurate and implementable.

## Verification Methods

1. **Web search**: Cursor docs, Claude Code (Anthropic) hooks reference
2. **Codebase**: open-coding-agent repo at `/Users/zhouhongxuan/program/repos/open-coding-agent` (Cline, Gemini CLI)

---

## Results by Platform

### 1. Cursor — ✅ Verified

**Source**: Web search (cursor.com docs, third-party hooks, blog posts).

- **stdin**: Hooks receive JSON with `workspace_roots` (array of workspace root paths).
- **Env**: `CURSOR_PROJECT_DIR`, `CLAUDE_PROJECT_DIR` documented.
- **Conclusion**: Outline is correct. Use `workspace_roots[0]` and env vars as fallback.

### 2. Claude Code — ✅ Verified

**Source**: [Anthropic Hooks reference](https://docs.anthropic.com/en/docs/claude-code/hooks).

- **stdin**: Common input fields are `session_id`, `transcript_path`, **`cwd`**, `permission_mode`, `hook_event_name`. No `workspace_roots` in stdin.
- **Env**: Documented "Reference scripts by path": **`$CLAUDE_PROJECT_DIR`** = the project root.
- **Conclusion**: Outline is correct. Rely on `CLAUDE_PROJECT_DIR`; stdin only has `cwd`, not workspace roots.

### 3. Cline — ✅ Verified (code)

**Source**: `open-coding-agent/cline/`.

- **Hook input**: `src/core/hooks/hook-factory.ts` — `completeParams()` builds HookInput:
  - Reads `StateManager.get().getGlobalStateKey("workspaceRoots")` (array of `{ path, name?, vcs? }`).
  - Sends `workspaceRoots: roots.map((root) => root.path)` → **string[]** of paths.
- **Stdio**: `HookProcess.run(inputJson)` sends this JSON to hook stdin.
- **Tests**: `hook-management.test.ts`, `taskcomplete.test.ts` etc. assert `input.workspaceRoots !== undefined`.
- **Conclusion**: Outline is correct. Cline stdin has `workspaceRoots: string[]`; use first element for workspace root.

### 4. Gemini CLI — ✅ Verified (code)

**Source**: `open-coding-agent/gemini-cli/packages/core/src/hooks/`.

- **HookInput** (`types.ts` 105–112): Only `session_id`, `transcript_path`, **`cwd`**, `hook_event_name`, `timestamp`. No `workspace_roots` or `workspaceRoots`.
- **Creation**: `hookEventHandler.ts` — `createBaseInput()` uses `this.config.getWorkingDir()` for `cwd`. No workspace array.
- **IDE**: `GEMINI_CLI_IDE_WORKSPACE_PATH` exists in vscode-ide-companion for IDE integration; not passed to hook stdin.
- **Conclusion**: Outline is correct. Gemini CLI hooks do not receive workspace in stdin; hook runs with `cwd` only. Our fallback (env then PWD then `Path.cwd()`) is appropriate.

---

## Summary

| Platform     | Outline claim                         | Verification |
|-------------|----------------------------------------|--------------|
| Cursor      | stdin `workspace_roots`, env vars     | ✅ Web docs  |
| Claude Code | No stdin workspace, `CLAUDE_PROJECT_DIR` | ✅ Official docs |
| Cline       | stdin `workspaceRoots: string[]`      | ✅ Cline code + tests |
| Gemini CLI  | No workspace in hooks, use CWD         | ✅ Gemini CLI types + hookEventHandler |

**Recommendation**: Proceed with the proposed implementation. Priority order (stdin → env → PWD → cwd) and field names (`workspace_roots` / `workspaceRoots`) are correct and backed by docs/code.
