# Hook Refactoring Plan

**Decision Time**: #R7  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

Current hooks have several issues:
1. `current_run` not incrementing (hooks may not be executing correctly)
2. Decisions with `doc_path: null` not triggering reminders
3. No session management for "same conversation" detection
4. Logic doesn't account for discussion mode detection

### Constraints

- Hooks must work with both Claude Code and Cursor
- Need to access session_id from hook input
- Must handle multiple discussion directories in one workspace

---

## 🎯 Objective

Refactor hooks to support:
1. Fully automated meta.yaml maintenance
2. Accurate round counting (one increment per conversation)
3. Discussion mode detection (based on outline updates)
4. Stale file reminders based on round difference

---

## 📊 Current vs New Architecture

### Current Hooks

```
hooks/
├── file-edit/
│   └── track_file_edit.py    # Sets pending_update flag
├── post-response/
│   ├── check_stale.py        # Checks for stale decisions
│   └── update_round.py       # Increments current_run
└── stop/
    └── check_precipitation.py # Checks and reminds
```

### New Architecture

```
hooks/
├── common/
│   ├── __init__.py
│   ├── file_utils.py
│   ├── meta_parser.py        # Refactored for new schema
│   ├── session_manager.py    # NEW: Session file management
│   └── platform_utils.py
├── file-edit/
│   └── track_file_edit.py    # Refactored
└── stop/
    └── check_precipitation.py # Refactored
```

---

## ✅ Final Decision

### Changes Summary

| Component | Current Behavior | New Behavior |
|-----------|------------------|--------------|
| `track_file_edit.py` | Sets `pending_update` flag | Updates meta.yaml entries + session file |
| `update_round.py` | Increments every response | **Removed** - merged into file-edit |
| `check_stale.py` | Standalone check | **Removed** - merged into stop hook |
| `check_precipitation.py` | Based on `pending_update` | Based on round difference + session |
| Session management | None | **New**: Platform-specific session files |

### New Module: session_manager.py

```python
# Key functions:
def get_session_id(hook_input: dict, platform: str) -> str:
    """Extract session ID from hook input"""

def get_session_path(platform: str, session_id: str) -> Path:
    """Get path: ~/.discuss-for-specs/sessions/{platform}/{session_id}.json"""

def load_session(platform: str, session_id: str) -> dict | None:
    """Load session file if exists"""

def save_session(platform: str, session_id: str, data: dict) -> None:
    """Save session file"""

def delete_session(platform: str, session_id: str) -> None:
    """Clean up session file"""

def mark_outline_updated(platform: str, session_id: str, outline_path: str) -> bool:
    """Mark outline as updated, returns True if first update in session"""
```

### Refactored: track_file_edit.py

**Trigger**: When any file in `.discuss/` is edited

**Logic**:
```python
1. Detect file type (outline / decision / note)
2. Find corresponding meta.yaml
3. Get session_id from hook input

If file is outline:
    - Check session file for outline_updated
    - If first update: current_round += 1
    - Mark outline_updated = true in session

If file is decision/note:
    - Update corresponding entry in meta.yaml
    - Set last_updated_round = current_round
    - If entry doesn't exist, create it
```

### Refactored: check_precipitation.py

**Trigger**: When conversation ends (stop hook)

**Logic**:
```python
1. Get session_id and platform
2. Load session file
3. If no session file or outline_updated == false:
    - User not in discussion mode
    - Skip all checks
    - Exit

4. For each discussion with outline update:
    - Load meta.yaml
    - For each decision/note entry:
        - Calculate: current_round - last_updated_round
        - If > stale_threshold: add to reminder list

5. If reminder list not empty:
    - Block and emit reminder message

6. Clean up session file
```

### Decision Rationale

1. Merging hooks reduces complexity and execution overhead
2. Session files provide reliable "same conversation" detection
3. Round-based staleness is more intuitive than timestamp-based
4. Outline update as discussion mode indicator is clean and accurate

### Expected Outcome

- Accurate round counting (verified via session files)
- Proper discussion mode detection
- Meaningful stale file reminders
- Cleaner hook architecture

---

## 🔄 Implementation Notes

### Platform-Specific Session ID Extraction

**Claude Code**:
```python
session_id = hook_input.get("session_id")
```

**Cursor**:
```python
# Need to verify: check cursor hook input format
session_id = hook_input.get("conversation_id") or hook_input.get("session_id")
```

### Edge Cases

1. **Multiple outlines in one conversation**: Session file tracks all updated outline paths
2. **Hook execution failure**: Session files persist until next conversation cleans them
3. **Missing session_id**: Fall back to timestamp-based session (less accurate but functional)

---

## 🔗 Related Links

- [D03-meta-yaml-design.md](./D03-meta-yaml-design.md)
