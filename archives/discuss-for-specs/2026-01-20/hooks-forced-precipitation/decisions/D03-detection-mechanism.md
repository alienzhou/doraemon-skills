# Detection Mechanism Design

**Decision Time**: R10  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

Need to detect when outline.md or decisions/ directory hasn't been updated for a while, and automatically remind AI to update.

---

## 🎯 Decisions

### D2: Decisions Detection Only Cares About "Any Updates"

**Decision**: Detection mechanism only checks if files have been updated, doesn't distinguish between new/old decisions

**Rationale**:
- Simpler detection logic
- Focus on update frequency, not content analysis
- File modification time is sufficient indicator

### D6: Infer Discussion Directory From File Path

**Decision**: Infer discussion directory by searching upward from file path for directory containing meta.yaml

**Implementation**:
```python
def find_discuss_dir_from_path(file_path):
    """Infer discussion directory from file path"""
    path = Path(file_path)
    
    # Search upward for directory containing meta.yaml
    for parent in path.parents:
        if (parent / "meta.yaml").exists():
            return parent
    
    return None
```

---

## 📊 Detection Logic

### Core Detection Function

```python
def check_precipitation_status(discuss_path):
    """Check precipitation status"""
    meta_path = discuss_path / "meta.yaml"
    
    # Load or initialize meta
    if meta_path.exists():
        import yaml
        meta = yaml.safe_load(meta_path.read_text())
    else:
        return None  # No meta.yaml, skip
    
    current_run = meta.get('current_run', 0)
    config = meta.get('config', {})
    suggest_runs = config.get('suggest_update_runs', 3)
    force_runs = config.get('force_update_runs', 10)
    
    file_status = meta.get('file_status', {})
    issues = []
    
    # Detect outline.md
    outline_last_run = file_status.get('outline', {}).get('last_modified_run', 0)
    outline_stale = current_run - outline_last_run
    if outline_stale >= suggest_runs:
        issues.append(('outline.md', outline_stale, outline_stale >= force_runs))
    
    # Detect decisions/ directory (overall)
    decisions_last_run = file_status.get('decisions', {}).get('last_modified_run', 0)
    decisions_stale = current_run - decisions_last_run
    if decisions_stale >= suggest_runs:
        issues.append(('decisions/', decisions_stale, decisions_stale >= force_runs))
    
    return issues
```

### Two-Stage Trigger Logic

| Stage | Threshold | Behavior | Message Style |
|-------|-----------|----------|---------------|
| **Suggest Stage** | `suggest_update_runs` (default 3) | Block and ask | "Do you need me to help update?" |
| **Force Stage** | `force_update_runs` (default 10) | Block and require | "Please update discussion progress" |

### Prevent Infinite Loop

**Key**: Check `stop_hook_active` field

```python
if input_data.get('stop_hook_active'):
    # Already hook triggered continuation, allow to pass
    print(json.dumps({}))
    return
```

---

## 🔧 File Edit Detection

### File Type Detection

```python
def on_file_edit(file_path):
    # 1. Infer discussion directory from path
    discuss_dir = find_discuss_dir_from_path(file_path)
    if not discuss_dir:
        return  # Not discussion-related file
    
    # 2. Determine file type
    relative_path = file_path.relative_to(discuss_dir)
    
    if relative_path.name == "outline.md":
        update_file_status(discuss_dir, "outline", "modified")
    elif relative_path.parts[0] == "decisions":
        update_file_status(discuss_dir, "decisions", "modified")
    elif relative_path.parts[0] == "notes":
        update_file_status(discuss_dir, "notes", "modified")
```

### Platform-Specific Input Handling

```python
def get_file_path_from_input(input_data):
    """Extract file_path from different platform inputs"""
    # Cursor: directly has file_path
    if "file_path" in input_data:
        return input_data["file_path"]
    # Claude Code: in tool_input
    if "tool_input" in input_data:
        return input_data["tool_input"].get("file_path")
    return None
```

---

## ⚠️ Exception Handling

**Case**: Neither outline nor decisions updated throughout the conversation

**Detection**: stop hook finds no discussion with `pending_update: true`

**Handling**:
```python
if not modified_discussions:
    # Possible cases:
    # 1. User is just chatting, not having a discussion
    # 2. AI forgot to update files
    # 3. File operation failed
    
    # Don't remind, exit silently
    return {}
```

---

## 🔗 Related

- [D01-hooks-architecture.md](./D01-hooks-architecture.md)
- [D02-meta-yaml-schema.md](./D02-meta-yaml-schema.md)
- [Platform Hooks Comparison](../notes/platform-hooks-comparison.md)
