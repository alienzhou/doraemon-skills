# Platform Hooks API Comparative Analysis

**Related Outline**: [Back to Outline](../outline.md)

---

## Claude Code vs Cursor Hooks Comparison

| Feature | Claude Code | Cursor |
|---------|-------------|--------|
| Config File | `~/.claude/settings.json` | `~/.cursor/hooks.json` |
| Stop Hook | ✅ `Stop` event | ✅ `stop` event |
| **Block Stop & Continue** | ✅ `decision: "block"` + `reason` | ✅ `followup_message` |
| After File Edit | `PostToolUse` + matcher | `afterFileEdit` |
| Session Lifecycle | `SessionStart/End` | `sessionStart/sessionEnd` |

## ⭐ Key Finding: Claude Code Also Supports Blocking Stop!

> Reference: [Claude Code Hooks - Stop Decision Control](https://code.claude.com/docs/en/hooks#stop%2Fsubagentstop-decision-control)
> Reference: [ralph-wiggum stop-hook.sh](https://github.com/anthropics/claude-code/blob/main/plugins/ralph-wiggum/hooks/stop-hook.sh)

**Claude Code Stop Hook Input**:
```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../xxx.jsonl",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true  // Important: prevent infinite loop
}
```

**Claude Code Stop Hook Output**:
```json
{
  "decision": "block",  // Block Claude from stopping
  "reason": "Detected precipitation omission, please complete decisions documentation..."  // Send to Claude
}
```

**Key Points**:
- `decision: "block"` blocks Claude from stopping
- `reason` is sent as a message to Claude, letting it know how to continue
- `stop_hook_active: true` indicates this is already a hook-triggered continuation, **must check to prevent infinite loop**

## ⭐ Key Finding: Cursor's `followup_message`

> Reference: [Cursor Hooks Documentation](https://cursor.com/cn/docs/agent/hooks)

Cursor's `stop` hook supports returning `followup_message`, and the system will **automatically submit it as the next user message**!

```json
// stop hook input
{
  "status": "completed" | "aborted" | "error",
  "loop_count": 0  // Number of automatic followup messages triggered
}

// stop hook output
{
  "followup_message": "<automatically submitted message>"
}
```

**Limit**: Maximum 5 automatic followup messages (prevent infinite loop)

### What Does This Mean?

In **Cursor**, we can achieve:

```
AI completes response → stop hook detects omission → returns followup_message 
→ Cursor automatically submits message → AI receives reminder and supplements
```

This is true "forced precipitation"! Not waiting for next round manual trigger, but **automatically triggering remediation**.

## Platform Difference Handling

| Platform | Implementation |
|----------|----------------|
| **Cursor** | stop hook + followup_message (automatic remediation trigger) |
| **Claude Code** | Stop hook + exit code 1 + prompt message (requires manual trigger) |

## File Edit Tracking Hook Comparison

**Cursor** (`afterFileEdit`):
```json
{
  "file_path": "/path/to/discuss/2026-01-20/topic/outline.md",
  "edits": [{"old_string": "...", "new_string": "..."}]
}
```

**Claude Code** (`PostToolUse`):
```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../xxx.jsonl",
  "cwd": "/current/working/dir",
  "hook_event_name": "PostToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/discuss/2026-01-20/topic/outline.md",
    "old_string": "...",
    "new_string": "..."
  }
}
```
