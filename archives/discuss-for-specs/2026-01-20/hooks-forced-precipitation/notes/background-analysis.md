# Background Analysis

**Related Outline**: [Back to Outline](../outline.md)

---

## Existing Hooks Mechanism

| Hook | Function | Trigger Timing |
|------|------|----------|
| `update_round.py` | Update round counter | post-response |
| `check_stale.py` | Check stale decisions | post-response |

## Existing Issues

1. **check_stale.py only checks recorded decisions** - If AI forgets to record in meta.yaml, detection fails
2. **Missing consistency check between outline and meta.yaml** - They may become out of sync
3. **Detection is passive** - Only checks existing records, doesn't proactively find omissions

## User Proposed Solution

1. Update meta.yaml after each generation
2. Hooks define and update current round
3. Update decisions list and update time
4. Compare decisions list on next execution, alert if no changes
