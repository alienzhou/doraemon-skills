# D04: Snapshot Scheme Design Parameters

## Status
✅ Confirmed

## Decision
Specific design parameters for the snapshot scheme:

| Parameter | Decision | Description |
|-----------|----------|-------------|
| Detection scope | Within 24 hours | Only check discussions with file modifications in the last 24h |
| Change detection | mtime | Use file modification time, not hash |
| Tracking scope | outline + decisions + notes | Track all three |
| Reset logic | Reset on decisions or notes change | Any change → change_count = 0 |

## Discussion Records

### Detection Scope: 24 Hours
- **Considered Options**:
  - Scan all discussions: May have lots of historical noise
  - Scan only today's: May miss cross-day discussions
  - 24-hour window: Balanced coverage and precision
- **Final Choice**: 24 hours, covers most scenarios

### Change Detection: mtime
- **Considered Options**:
  - Use only mtime: Fast, accurate in most scenarios
  - Add hash: More accurate, but increases I/O overhead
- **Final Choice**: Use only mtime, simplicity first

### Tracking Scope: All
- **Considered Options**:
  - Track only decisions: Simple
  - decisions + notes: Complete
- **Final Choice**: Track both, notes changes also indicate discussion progress

### Reset Logic
- **Semantics**: As long as decisions or notes have any changes (add, modify, delete), it means user is precipitating content
- **Effect**: Reset outline's change_count to avoid false positives

## Edge Case Handling

### File Discarded
- When mtime decreases, handle conservatively, don't increase change_count

### Discussion Directory Deleted
- Remove corresponding record from snapshot

### New Discussion Directory
- change_count starts from 0

### decisions/notes Files Deleted
- Treat as "changed", reset change_count

## Related Decisions
- D01: Snapshot scheme
