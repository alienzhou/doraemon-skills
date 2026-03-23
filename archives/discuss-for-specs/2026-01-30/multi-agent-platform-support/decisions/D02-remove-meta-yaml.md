# D02: Remove meta.yaml, Merge Configuration into snapshot.yaml

## Status
✅ Confirmed

## Decision
meta.yaml is no longer needed; all state and configuration are stored in `.discuss/.snapshot.yaml`.

## Background
Original meta.yaml functions:
1. Track `current_round` and `last_updated_round` → Replaced by snapshot scheme
2. Store configuration (e.g., `stale_threshold`) → Can be moved to snapshot.yaml
3. Store `topic` and `created` → Optional, doesn't affect core functionality

## Solution
Merge configuration into snapshot.yaml:

```yaml
# .discuss/.snapshot.yaml
version: 1
config:
  stale_threshold: 3        # Configuration from original meta.yaml

discussions:
  "2026-01-30/topic-name":
    outline:
      mtime: 1706621400.0
      change_count: 2
    decisions:
      - name: "D01-xxx.md"
        mtime: 1706620000.0
    notes:
      - name: "analysis.md"
        mtime: 1706619000.0
```

## Advantages
- Simplify data structure, reduce files to maintain
- AI doesn't need to learn how to maintain meta.yaml
- Centralized management of configuration and state

## Impact
- Delete `templates/meta.yaml`
- Simplify `hooks/common/meta_parser.py` (keep only utility functions or delete)
- SKILL.md no longer requires creating meta.yaml

## Related Decisions
- D01: Snapshot scheme
