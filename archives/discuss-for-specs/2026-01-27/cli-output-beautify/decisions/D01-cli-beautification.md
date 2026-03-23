# CLI Beautification Implementation Plan

**Decision Date**: R5 (2026-01-28)  
**Status**: ✅ Confirmed  
**Related Outline**: [../outline.md](../outline.md)

---

## 📋 Background

### Problem
The current CLI output is functional but too plain:
- No colors
- No dynamic indicators (spinners)
- No visual branding (ASCII banner)
- Static, text-only output

### Goal
Make the CLI output visually appealing and professional, comparable to mainstream CLI tools like npm, pnpm, or cargo.

---

## 🎯 Decisions

### D01: Dependency Strategy
**Decision**: Use npm libraries instead of hand-coding

**Rationale**:
- Professional, battle-tested output
- Easier maintenance
- Rich feature set

### D02: ASCII Art Banner
**Decision**: Block font style for "DISCUSS"

```
  ██████╗ ██╗███████╗ ██████╗██╗   ██╗███████╗███████╗
  ██╔══██╗██║██╔════╝██╔════╝██║   ██║██╔════╝██╔════╝
  ██║  ██║██║███████╗██║     ██║   ██║███████╗███████╗
  ██║  ██║██║╚════██║██║     ██║   ██║╚════██║╚════██║
  ██████╔╝██║███████║╚██████╗╚██████╔╝███████║███████║
  ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
```

### D03: Color Scheme
**Decision**: Single highlight color (cyan) + restrained semantic colors

| Element | Color |
|---------|-------|
| Banner | Cyan |
| Progress/In-progress | Cyan |
| Success (✔) | Green |
| Error (✖) | Red (symbol only) |
| Hints/Tips | Dim/Gray |
| Normal text | Default |

### D04: Library Stack
**Decision**: `chalk` + `ora` + `figlet` + `boxen`

| Library | Purpose | Size |
|---------|---------|------|
| `chalk` | Terminal colors | Well-maintained |
| `ora` | Spinners | Industry standard |
| `figlet` | ASCII art | Many fonts |
| `boxen` | Success boxes | Clean frames |

### D05: Spinner Style
**Decision**: dots

```
⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏
```

Most common, universally recognized.

### D06: Error Output Style
**Decision**: No border, arrow style, minimal red

```
✖ Installation failed

  Python 3 is required but was not found.

  To fix:
    brew install python3
```

- Only `✖` symbol in red
- Error message in default color
- Hints in dim/gray or cyan

### D07: Non-Color Terminal Fallback
**Decision**: Auto-detect + `--no-color` flag

- `chalk` auto-detects terminal capabilities
- Add `--no-color` flag for manual override
- Graceful degradation to plain text

---

## 📐 Implementation Spec

### New Dependencies

```json
{
  "dependencies": {
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "figlet": "^1.7.0",
    "boxen": "^8.0.0"
  }
}
```

### File Changes

1. **`package.json`**: Add new dependencies
2. **`src/ui.js`** (new): UI utilities module
   - `showBanner()`: Display ASCII banner
   - `createSpinner(text)`: Create ora spinner
   - `success(msg)`: Green checkmark message
   - `error(msg, hint?)`: Red error with optional hint
   - `info(msg)`: Cyan info message
3. **`src/installer.js`**: Refactor to use new UI utilities
4. **`bin/cli.js`**: Add `--no-color` global option

### Output Flow

```
[Banner - cyan]
              
[Spinner] Checking Python environment...
✔ Python environment OK

[Spinner] Installing Skills...
  ✔ Installed discuss-coordinator
  ✔ Installed discuss-output

[Spinner] Installing Hooks...
  ✔ Copied hooks
  ✔ Created logs directory

╭──────────────────────────────────────────╮
│                                          │
│   ✅ Installation complete!              │
│                                          │
│   Installed:                             │
│     • Skills: ~/.claude/skills           │
│     • Hooks:  ~/.discuss-for-specs/hooks │
│                                          │
│   Next: Open Claude Code and start!      │
│                                          │
╰──────────────────────────────────────────╯
```

---

## 🔗 Related

- Original discussion: [outline.md](../outline.md)
