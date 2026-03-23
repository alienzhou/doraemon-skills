# Platform Hook Research

> Research conducted: R10 (2026-02-21)

## Cursor

### Available Hooks
| Hook | Payload Fields | Status |
|------|---------------|--------|
| `stop` | `conversation_id`, `generation_id`, `hook_event_name`, `workspace_roots` | Stable |
| `afterFileEdit` | `file_path` | **Beta** (Cursor 1.7+) |
| `beforeSubmitPrompt` | TBD | Available |
| `beforeReadFile` | TBD | Available |

### Key Findings
- `conversation_id` in `stop` hook is a natural Session ID
- Payload is delivered via stdin as JSON
- `afterFileEdit` could enable per-edit hook triggers in the future, but:
  - Currently beta, API may change
  - Payload only contains `file_path`, no AI capability
  - Not suitable as primary commit trigger for MVP

### Configuration
```json
// .cursor/hooks.json
{
  "version": 1,
  "hooks": {
    "stop": [{ "command": "python3 ./scripts/check.py" }]
  }
}
```

## Claude Code

### Available Hooks
| Hook | Payload Fields | Status |
|------|---------------|--------|
| `SessionStart` | TBD | Stable |
| `PreToolUse` | `tool_name`, `tool_input`, `hook_event_name` | Stable |
| `PostToolUse` | `tool_name`, `tool_input`, `hook_event_name` | Stable |
| `Stop` | TBD | Stable |
| `UserPromptSubmit` | TBD | Stable |

### Key Findings
- No `session_id` explicitly documented in hook stdin JSON
- CLI supports `-r "session-id"` for resuming sessions, confirming session IDs exist internally
- `PostToolUse` with `write`/`edit` tool matcher could serve as per-edit hook
- `SessionStart` hook could potentially capture and cache session ID

### Configuration
```json
// .claude/settings.json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{ "type": "command", "command": "python3 ./scripts/check.py" }]
    }]
  }
}
```

## Implications for Agent Better Checkpoint

1. **MVP**: Use `stop` hook on both platforms for fallback detection only
2. **Future**: Cursor `afterFileEdit` + Claude Code `PostToolUse(write)` could enable finer-grained automatic checkpointing
3. **Session ID**: Platform-provided IDs are inconsistent; self-generation may be needed long-term
