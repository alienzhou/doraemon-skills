# D03: Simplify Levels to L1 and L2

## Status
✅ Confirmed

## Decision
Cancel original L3 level, simplify to two-tier capability classification:
- **L1 Basic**: Skills only, no Hooks
- **L2 Standard**: Skills + Stop Hook (snapshot scheme)

## Background
Original three-tier design:
- L1: Skills only, AI self-maintained
- L2: Skills + Stop Hook (fallback detection)
- L3: Skills + Dual Hook (full tracking)

The emergence of the snapshot scheme eliminated the difference between L2 and L3:
- Snapshot scheme only needs stop hook
- Detection accuracy comparable to original L3
- No longer need file-edit hook

## Solution

### L1: Basic Capability (Skills Only)
- **Required Hooks**: None
- **Applicable Platforms**: Kilocode, Codex CLI, Roo Code, Windsurf, Trae
- **User Experience**:
  - Complete discussion facilitation features
  - No automatic reminders
  - Relies on user/AI to maintain decisions consciously

### L2: Standard Capability (Snapshot Scheme)
- **Required Hooks**: Stop only
- **Applicable Platforms**: Claude Code, Cursor, Cline, Gemini CLI, OpenCode, CodeBuddy
- **User Experience**:
  - Complete discussion facilitation features
  - Automatically detect "outline changed but decisions not updated"
  - Automatically remind user to precipitate decisions

## Platform Distribution

| Platform | Level | Reason |
|----------|-------|--------|
| Claude Code | L2 | Supports Stop hook |
| Cursor | L2 | Supports stop hook |
| Cline | L2 | Supports PostToolUse/TaskCancel, etc. |
| Gemini CLI | L2 | Supports AfterAgent hook |
| Kilocode | L1 | No Hooks |
| Codex CLI | L1 | Only notify (not a real Hook) |
| Windsurf | L1 | No Hooks |

## Related Decisions
- D01: Snapshot scheme
