# Reminder Mechanism

**Decision Time**: #R7  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Need to define when to remind about unprecipitated decisions. The question: **How many rounds without precipitation is considered "needing a reminder"?**

### Constraints
- Should not be too aggressive (every round)
- Should not be too lax (never reminds)
- Should be configurable for different use cases

---

## 🎯 Objective

Establish a reasonable default threshold for precipitation reminders while supporting customization.

---

## ✅ Final Decision

### Threshold Configuration

**Default: 3 rounds without precipitation triggers reminder**

**Rationale**:
- 1 round: Too aggressive, normal discussion flow
- 2 rounds: Still reasonable for complex decisions
- 3 rounds: Clear signal that precipitation is overdue
- 5+ rounds: Too lax, risks losing context

### Configuration Support

```yaml
# Global config (discuss-config.yaml or similar)
stale_detection:
  enabled: true
  max_stale_rounds: 3      # Configurable threshold
```

---

## 📊 Reminder Logic

### Calculation

```python
# For each decision with doc_path == null
current_round = 6
confirmed_at = 3
stale_rounds = current_round - confirmed_at  # = 3

if stale_rounds >= max_stale_rounds:
    trigger_reminder()
```

### Reminder Message Format

```
⚠️ Precipitation Reminder

The following decisions have been confirmed but not yet documented:

□ D1: Skill Granularity (confirmed at #R3, now #R6 - 3 rounds ago)
□ D3: Detection Mechanism (confirmed at #R4, now #R6 - 2 rounds ago)

Recommendation:
- If ready to document: Create decision documents now
- If needs more discussion: Reconsider status
- If postponing: Acknowledge and set expectation
```

---

## 📊 Configuration Scenarios

| Scenario | Recommended Threshold | Reason |
|----------|----------------------|--------|
| Fast-paced decisions | 2 rounds | Quick iterations, immediate documentation |
| Deep architecture discussions | 3 rounds (default) | Balanced approach |
| Exploratory research | 4-5 rounds | Allow more time for ideas to mature |
| Low priority | Disable (infinity) | Manual documentation only |

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Too frequent reminders annoy user | Low | Medium | Default 3 rounds is conservative |
| User ignores reminders | Medium | Low | Make reminders actionable, not just warnings |
| Threshold too lax, context lost | Low | High | Default 3 rounds based on experience |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R7 | 2026-01-17 | Set default threshold to 3 rounds | Balanced approach |
| #R7 | 2026-01-17 | Added configuration support | Flexibility for different use cases |

---

## 🔗 Related Links

- [Decision 04: Precipitation Detection Mechanism](./04-precipitation-detection-mechanism.md)
- [Decision 06: Global Configuration Mechanism](./06-global-configuration-mechanism.md)
