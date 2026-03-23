# D01: Workspace Detection Improvement

## Status
✅ Confirmed

## Date
2026-02-02

## Decision

Improve workspace detection in hook scripts by using a priority-based approach that extracts workspace information from stdin JSON data (when available) before falling back to environment variables.

## Background

The current `get_workspace_root()` function only checks environment variables (`WORKSPACE_ROOT`, `PROJECT_ROOT`, `PWD`) and falls back to `cwd()`. This approach has limitations:

1. **Multi-root workspaces**: `PWD` may not point to the correct project root
2. **Platform-specific**: Different platforms provide workspace info differently
3. **Missing best source**: stdin JSON data (provided by Cursor and Cline) is not used

## Platform Research Results

| Platform | stdin `workspace_roots` | Environment Variables |
|----------|------------------------|----------------------|
| Cursor | ✅ `workspace_roots: string[]` | `CURSOR_PROJECT_DIR` |
| Cline | ✅ `workspaceRoots: string[]` | None |
| Claude Code | ❌ | `CLAUDE_PROJECT_DIR` |
| Gemini CLI | ❌ | None (uses CWD) |
| L1 Platforms | N/A | N/A |

## Solution

Update `get_workspace_root()` to accept optional stdin data and use priority-based detection:

### Priority Order

1. **stdin JSON** (Most reliable)
   - `workspace_roots` (Cursor format)
   - `workspaceRoots` (Cline format)
   
2. **Environment Variables**
   - `CURSOR_PROJECT_DIR`
   - `CLAUDE_PROJECT_DIR`
   - `WORKSPACE_ROOT`
   - `PROJECT_ROOT`

3. **PWD** (Third priority)

4. **`Path.cwd()`** (Fallback)

### Implementation

```python
def get_workspace_root(input_data: Optional[Dict[str, Any]] = None) -> Path:
    # Priority 1: stdin JSON data
    if input_data:
        if "workspace_roots" in input_data and input_data["workspace_roots"]:
            return Path(input_data["workspace_roots"][0])
        if "workspaceRoots" in input_data and input_data["workspaceRoots"]:
            return Path(input_data["workspaceRoots"][0])
    
    # Priority 2: Environment variables
    for env_var in ["CURSOR_PROJECT_DIR", "CLAUDE_PROJECT_DIR", 
                    "WORKSPACE_ROOT", "PROJECT_ROOT"]:
        if env_var in os.environ and os.environ[env_var]:
            return Path(os.environ[env_var])
    
    # Priority 3: PWD
    if "PWD" in os.environ:
        return Path(os.environ["PWD"])
    
    # Priority 4: Fallback
    return Path.cwd()
```

## Test Cases

1. Cursor stdin with `workspace_roots` → use first root
2. Cline stdin with `workspaceRoots` → use first root
3. Cursor env var → use `CURSOR_PROJECT_DIR`
4. Claude Code env var → use `CLAUDE_PROJECT_DIR`
5. Multi-root workspace → use first root
6. Empty stdin, fallback to env → work correctly
7. All fallbacks fail → use `cwd()`

## Impact

- Modify: `hooks/stop/check_precipitation.py`
- Modify: `hooks/common/snapshot_manager.py` (if needed)
- Add: Test cases in `tests/test_hooks/test_snapshot_manager.py`

## References

- [Cursor Hooks Documentation](https://cursor.com/docs/agent/hooks)
- [Cline Hook Reference](https://docs.cline.bot/features/hooks/hook-reference)
- Platform research in outline.md
