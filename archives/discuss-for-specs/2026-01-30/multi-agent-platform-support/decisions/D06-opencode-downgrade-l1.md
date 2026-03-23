# D06: OpenCode Downgrade to L1

## Decision
**OpenCode is downgraded from L2 to L1**, providing only Skills support without Hooks auto-reminder functionality.

## Status
✅ Confirmed

## Date
2026-01-31

## Context
After in-depth research on OpenCode's Hooks mechanism, two critical issues were discovered:

### Issue 1: Hook Type Misalignment
OpenCode's Hooks are plugin-based, supporting these types:
- `event` - Subscribe to all system events
- `chat.message` - New message received
- `tool.execute.before` - Before tool execution
- `tool.execute.after` - After tool execution
- `permission.ask` - On permission request

**Missing Critical Event**: No "session end" event like Claude Code's `Stop` or Cline's `TaskComplete`.

### Issue 2: Requires TypeScript Implementation
OpenCode's Hooks must be written as TypeScript plugins, cannot directly call external Python scripts. This means:
- Need to maintain two codebases (Python + TypeScript)
- Testing costs double
- Violates the project principle of "minimize maintenance costs"

## Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. TS Wrapper** | Use TypeScript to wrap Python calls | Reuse existing logic | Still need TS code, Hook misaligned |
| **B. Pure TS Rewrite** | Completely rewrite in TypeScript | Native integration | High workload, high maintenance cost |
| **C. Downgrade to L1** | Provide only Skills | Zero extra work | No auto-reminder |

## Decision Rationale

Chose **Option C** for these reasons:
1. **Hook fundamentally misaligned**: Even with TS implementation, there's no suitable trigger timing
2. **Avoid doubled testing costs**: Maintaining a single language stack (Python) is more sustainable
3. **L1 still has value**: Users can still use full discussion functionality, just without auto-reminders

## Impact
- OpenCode users need to manually check for unprecipitated decisions
- Can add guidance in SKILL.md to prompt users to precipitate proactively (see D05 L1 Skill Guidance)

## References
- [D05: L1 Skill Guidance](./D05-l1-skill-guidance.md)
- [Platform Research Notes](../notes/platform-research.md)
