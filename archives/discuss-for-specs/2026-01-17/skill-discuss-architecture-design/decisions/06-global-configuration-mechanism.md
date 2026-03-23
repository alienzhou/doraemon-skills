# Global Configuration Mechanism

**Decision Time**: #R7  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
The Skill system needs global configuration for:
- Precipitation reminder thresholds
- Hook behavior
- Output formats
- Default paths

Question: **How should configuration be initialized and managed?**

### Constraints
- First-time users shouldn't need to manually configure
- Advanced users should be able to customize
- Configuration should be discoverable and well-documented

---

## 🎯 Objective

Design an automatic configuration initialization mechanism that provides sensible defaults while supporting customization.

---

## ✅ Final Decision

### Initialization Strategy

**Hook first-run detection and auto-initialization**

```
Hook Triggers
    │
    ▼
┌─────────────────────┐
│ Check if config exists │
└─────────────────────┘
    │
    ├─── Does not exist ───▶ Create default config
    │
    └─── Exists ─────▶ Read config
    │
    ▼
Continue with detection logic...
```

### Configuration File Structure

```yaml
# ~/.claude/skills/discuss-config.yaml (or similar location)

# Version
version: "1.0.0"

# Precipitation reminder configuration
stale_detection:
  enabled: true
  max_stale_rounds: 3      # Rounds without precipitation before reminder
  
# Hook configuration
hooks:
  post_response: true      # Run checks after each response
  auto_init_config: true   # Auto-initialize config on first run
  
# Output configuration
output:
  outline_format: "markdown"  # Outline format
  doc_template: "standard"    # Document template
  
# Path configuration
paths:
  discuss_dir: "discuss"      # Discussion directory
  decisions_dir: "decisions"  # Decision documents directory
  templates_dir: "templates"  # Template directory
```

---

## 📊 Initialization Process

### First Run Behavior

```python
# Hook script pseudocode
def initialize_config():
    config_path = get_config_path()
    
    if not exists(config_path):
        # Create default configuration
        default_config = load_default_config()
        write_config(config_path, default_config)
        log("Initialized default configuration")
    else:
        # Load existing configuration
        config = load_config(config_path)
        log("Loaded existing configuration")
    
    return config
```

### Default Configuration Generation

The default configuration should:
1. **Be sensible**: Work well for 80% of use cases
2. **Be documented**: Include inline comments explaining each option
3. **Be minimal**: Only include essential settings
4. **Be extensible**: Easy to add new options later

---

## 📊 Configuration Priority

When multiple configuration sources exist:

```
1. Project-specific config (./discuss/.config)
   ↓ overrides
2. User config (~/.claude/skills/discuss-config.yaml)
   ↓ overrides
3. Default config (built-in)
```

---

## 📊 Configuration Validation

Hook should validate configuration on load:

```python
def validate_config(config):
    errors = []
    
    # Check required fields
    if 'version' not in config:
        errors.append("Missing version field")
    
    # Check value ranges
    if config['stale_detection']['max_stale_rounds'] < 1:
        errors.append("max_stale_rounds must be >= 1")
    
    # Check paths exist (or can be created)
    for path_key, path_value in config['paths'].items():
        if not is_valid_path(path_value):
            errors.append(f"Invalid path: {path_key}={path_value}")
    
    if errors:
        raise ConfigValidationError(errors)
```

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Config file corruption | Low | High | Validate on load, backup on update |
| Version incompatibility | Medium | Medium | Include version in config, migration path |
| User confusion about location | Medium | Low | Clear documentation, log file path on init |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R7 | 2026-01-17 | Established Hook first-run initialization | Automatic setup for first-time users |
| #R7 | 2026-01-17 | Defined configuration structure | Sensible defaults with customization support |

---

## 🔗 Related Links

- [Decision 05: Reminder Mechanism](./05-reminder-mechanism.md)
- [Decision 07: Project Directory Structure](./07-project-directory-structure.md)
