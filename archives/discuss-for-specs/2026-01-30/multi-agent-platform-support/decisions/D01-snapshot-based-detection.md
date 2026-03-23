# D01: Replace Original Dual-Hook Scheme with Snapshot Scheme

## Status
✅ Confirmed

## Decision
Replace the original file-edit + stop dual-hook scheme with a snapshot comparison scheme.

## Background
The original scheme required coordination of two hooks:
- `file-edit hook`: Triggered after each file edit, recorded to session file
- `stop hook`: Read session at conversation end, check staleness

This design encountered difficulties during cross-platform adaptation:
- Many platforms (e.g., Kilocode, Codex CLI) lack file-edit hooks
- Session file management increased complexity
- meta.yaml round tracking logic was complex

## Solution
**Snapshot Comparison Scheme**: Use only stop hook, detect changes by comparing file modification times.

Core logic:
1. When stop hook triggers, scan `.discuss/` directory
2. Compare with last saved snapshot (`.discuss/.snapshot.yaml`)
3. If outline.md mtime changed → `change_count++`
4. If decisions/ or notes/ changed → `change_count = 0` (reset)
5. Trigger reminder when `change_count >= threshold`

## Advantages
| Dimension | Original Scheme | Snapshot Scheme |
|-----------|----------------|-----------------|
| Required Hooks | 2 | **1** |
| Session Management | Yes | **No** |
| Cross-platform Adaptation | Complex | **Simple** |
| Implementation Complexity | High | **Low** |

## Technical Specifications

### snapshot.yaml Data Structure

```yaml
# .discuss/.snapshot.yaml
version: 1
config:
  stale_threshold: 3        # Trigger reminder after how many outline changes

discussions:
  "2026-01-30/multi-agent-platform-support":
    outline:
      mtime: 1706621400.0   # Unix timestamp
      change_count: 2       # Number of times outline changed but decisions/notes did not
    decisions:
      - name: "D01-xxx.md"
        mtime: 1706620000.0
    notes:
      - name: "analysis.md"
        mtime: 1706619000.0
```

### Core Flow

```python
def check_precipitation():
    workspace = get_workspace_root()
    discuss_root = workspace / ".discuss"

    if not discuss_root.exists():
        return allow()

    # 1. Load snapshot
    snapshot = load_snapshot(discuss_root)

    # 2. Scan active discussions (modified within 24h)
    active_discussions = find_active_discussions(discuss_root, hours=24)

    # 3. Compare & update
    reminders = []
    for discuss_dir in active_discussions:
        key = get_discuss_key(discuss_dir, discuss_root)
        old_state = snapshot.get("discussions", {}).get(key, {})
        new_state = scan_discussion(discuss_dir)

        change_count = compare_and_update(old_state, new_state)

        if change_count >= snapshot.get("config", {}).get("stale_threshold", 3):
            reminders.append(key)

        snapshot["discussions"][key] = new_state

    # 4. Clean up deleted discussions
    cleanup_deleted_discussions(snapshot, discuss_root)

    # 5. Save snapshot
    save_snapshot(discuss_root, snapshot)

    # 6. Output reminders
    if reminders:
        return block_with_reminder(reminders)

    return allow()
```

### Edge Case Handling

| Situation | Scenario | Handling |
|-----------|----------|----------|
| File discarded | mtime decreases | Conservative handling, don't increase change_count |
| Directory deleted | snapshot has record but directory doesn't exist | Remove from snapshot |
| New discussion | no record in snapshot | change_count starts from 0 |
| File deleted | decisions/notes files reduced | Treat as "changed", reset change_count |

## Impact

```
Delete:
  - hooks/file-edit/track_file_edit.py
  - hooks/file-edit/__init__.py
  - hooks/common/session_manager.py
  - templates/meta.yaml

Add:
  - hooks/common/snapshot_manager.py

Rewrite:
  - hooks/stop/check_precipitation.py

Update:
  - skills/discuss-for-specs/SKILL.md
  - npm-package/src/platform-config.js
```

## Related Decisions
- D02: Remove meta.yaml
- D03: Level simplification
- D04: Snapshot scheme parameters
