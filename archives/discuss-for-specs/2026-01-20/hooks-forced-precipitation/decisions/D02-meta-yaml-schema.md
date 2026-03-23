# meta.yaml Schema Design

**Decision Time**: R10  
**Status**: ⚠️ SUPERSEDED  
**Superseded By**: [D03: meta.yaml Programmatic Design](./../../../2026-01-28/discuss-mode-optimization/decisions/D03-meta-yaml-design.md) (2026-01-28)  
**Related Outline**: [Back to Outline](../outline.md)

> **⚠️ UPDATE (2026-01-28)**: The meta.yaml schema has been significantly redesigned:
> - Added session-based round counting
> - Added file tracking with `last_updated_round` field
> - Removed `pending_update` in favor of round difference calculation
> - meta.yaml is now fully automated by Hooks (zero agent burden)

---

## 📋 Background

In the original plan, meta.yaml was maintained by AI and prone to being forgotten to update. The new plan changes to be generated and maintained by Hook programs.

---

## 🎯 Decisions

### D1: meta.yaml Only Records Status

**Decision**: meta.yaml only records runtime status, remove semantic fields (e.g., topic)

**Rationale**:
- topic can be inferred from directory name (directory name is topic)
- Reduce content AI needs to maintain
- Status information is automatically maintained by Hook programs

### D7: State Passing Uses meta.yaml

**Decision**: Two hooks pass state via `pending_update` field in meta.yaml

**Rationale**:
- No need for additional temporary files
- State persistence, can recover even if program is interrupted
- Convenient for debugging and viewing

---

## 📊 Schema Definition

```yaml
# Automatically generated and maintained by Hook program
created_at: "2026-01-20T14:30:00+08:00"  # ISO timestamp
current_run: 5                            # Incremented by program

# Configuration
config:
  suggest_update_runs: 3   # Suggest update trigger run threshold
  force_update_runs: 10    # Force update trigger run threshold

# File status tracking
file_status:
  outline:
    last_modified_run: 4     # Last modified run
    pending_update: false    # Whether updated in this session
  decisions:
    last_modified_run: 2
    pending_update: false
```

### Field Description

| Field | Type | Maintainer | Description |
|-------|------|------------|-------------|
| `created_at` | string | Hook | Discussion creation time (ISO format) |
| `current_run` | int | stop hook | Current run number, incremented at end of each conversation |
| `config.*` | int | User/Default | Configuration items |
| `file_status.*.last_modified_run` | int | stop hook | Last modified run of file |
| `file_status.*.pending_update` | bool | afterFileEdit | Whether updated in this session |

### Workflow

1. **afterFileEdit hook**: Detect file update → Set `pending_update: true`
2. **stop hook**: 
   - Check `pending_update`
   - If true → Update `last_modified_run = current_run`
   - Clear `pending_update = false`
   - Increment `current_run`

---

## 🔗 Related

- [D01-hooks-architecture.md](./D01-hooks-architecture.md)
- [D03-detection-mechanism.md](./D03-detection-mechanism.md)
