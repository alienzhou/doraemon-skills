# Hooks Architecture Design

**Decision Time**: R10  
**Status**: ⚠️ PARTIALLY SUPERSEDED  
**Superseded By**: [D04: Hook Refactoring](./../../../2026-01-28/discuss-mode-optimization/decisions/D04-hook-refactoring.md) (2026-01-28)  
**Related Outline**: [Back to Outline](../outline.md)

> **⚠️ UPDATE (2026-01-28)**: The hooks architecture has been updated:
> - Added session-based round counting (one increment per conversation)
> - Removed `pending_update` in favor of `last_updated_round` comparison
> - Added session management via temporary files
> - Core design principle remains valid: "Intelligence work for Agent, process work for Hook"

---

## 📋 Background

During discussions, outline updates are timely but decisions/notes are easily forgotten. Hooks mechanism is needed to enforce precipitation.

---

## 🎯 Decisions

### D3: Hooks Configuration Placed Globally

**Decision**: hooks configuration placed in user-level global directory

| Platform | Config File Location |
|------|-------------|
| Claude Code | `~/.claude/settings.json` |
| Cursor | `~/.cursor/hooks.json` |

**Rationale**: 
- Discussion feature is cross-project
- No need for individual project configuration

### D4: Definition of run

**Decision**: one "run" = one AI conversation ends (when Stop Hook triggers)

**Description**:
- After user starts conversation, AI may call multiple rounds of tools
- Until Stop Hook triggers, this entire process counts as one run
- This is when `current_run` increments

### D5: Two Hooks Collaboration

**Decision**: Use two hooks collaboration to complete precipitation detection

| Hook | Platform | Responsibilities |
|------|----------|------|
| File edit tracking | Cursor: `afterFileEdit`<br>Claude Code: `PostToolUse` | Detect file changes, update `pending_update` |
| Conversation end detection | Cursor: `stop`<br>Claude Code: `Stop` | Increment run, detect precipitation status |

**Workflow**:
```
File edit hook                      stop hook
     │                                │
     ▼                                ▼
Detect file path                     Check pending_update
     │                                │
     ▼                                ▼
Set pending_update: true        Increment current_run
                                      │
                                      ▼
                                 Detect precipitation status
                                      │
                                      ▼
                                 Remind when necessary
```

---

## 📊 Platform Hook Comparison

### File Edit Tracking

**Cursor** (`afterFileEdit`):
```json
{
  "file_path": "/path/to/file.md",
  "edits": [{"old_string": "...", "new_string": "..."}]
}
```

**Claude Code** (`PostToolUse` + `matcher: "Edit|Write|MultiEdit"`):
```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.md",
    "old_string": "...",
    "new_string": "..."
  }
}
```

### Conversation End Detection

**Cursor** (`stop`):
```json
{
  "status": "completed",
  "loop_count": 0
}
// Output
{ "followup_message": "Reminder message" }
```

**Claude Code** (`Stop`):
```json
{
  "hook_event_name": "Stop",
  "stop_hook_active": false
}
// Output
{ "decision": "block", "reason": "Reminder message" }
```

---

## 📋 Implementation Details

### Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Conversation Process                   │
├─────────────────────────────────────────────────────────────┤
│  User sends message → AI responds → (possibly multiple tool calls) → AI stops |
│                  │                              │           │
│                  ▼                              ▼           │
│         afterFileEdit hook              stop hook           │
│         (triggered on each file edit)   (triggered on conversation end) │
└─────────────────────────────────────────────────────────────┘
```

### Hook 1: File Edit Tracking

**Trigger Timing**: After each AI file edit

**Responsibilities**:
1. Check edited file path
2. Determine if it belongs to a discussion directory
3. Update `file_status.pending_update` in corresponding meta.yaml

**Platform Configuration**:

| Platform | Hook Name | Matcher |
|----------|-----------|---------|
| **Cursor** | `afterFileEdit` | No matcher needed |
| **Claude Code** | `PostToolUse` | `Edit\|Write\|MultiEdit` |

### Hook 2: Stop Detection

**Trigger Timing**: When AI conversation ends

**Responsibilities**:
1. Read all discussion directories marked as modified in the session
2. Accumulate `current_run` for these directories
3. Detect precipitation status, block and remind when necessary

**State Passing Solution**: Use `pending_update` flag in meta.yaml
- afterFileEdit sets `pending_update: true` in meta.yaml
- stop hook scans all discussion directories, finds those with `pending_update: true`
- Clear flags after processing

### Platform Configuration Examples

**Claude Code** (`~/.claude/settings.json`):
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/check_precipitation.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/track_file_edit.py"
          }
        ]
      }
    ]
  }
}
```

**Cursor** (`~/.cursor/hooks.json`):
```json
{
  "version": 1,
  "hooks": {
    "stop": [
      {
        "command": "python3 ~/.cursor/hooks/check_precipitation.py"
      }
    ],
    "afterFileEdit": [
      {
        "command": "python3 ~/.cursor/hooks/track_file_edit.py"
      }
    ]
  }
}
```

---

## 🔗 Related

- [D02-meta-yaml-schema.md](./D02-meta-yaml-schema.md)
- [D03-detection-mechanism.md](./D03-detection-mechanism.md)
- [Platform Hooks Comparison](../notes/platform-hooks-comparison.md)
