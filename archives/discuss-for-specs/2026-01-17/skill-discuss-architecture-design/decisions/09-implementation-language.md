# Implementation Language

**Decision Time**: #R10-R11  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Need to choose implementation language(s) for:
1. Skill content (instructions for AI)
2. Hook scripts (automation)
3. Platform extensions (VS Code, etc.)

Key question: **TypeScript or Python? Or both?**

### Constraints
- Skills are Markdown, not code
- Hooks need to run in Claude Code environment (Python usually available)
- Future VS Code extension requires TypeScript
- Should be simple and maintainable

---

## 🎯 Objective

Choose implementation languages that:
- Suit each component's requirements
- Maximize simplicity
- Ensure broad compatibility
- Enable future platform support

---

## 📊 Language Comparison

### For Skill Content

| Aspect | Recommendation |
|--------|---------------|
| **Format** | **Markdown** (SKILL.md) |
| **Rationale** | Skills are instructions for AI, not executable code |

No code needed - Skills are pure natural language instructions.

### For Hook Scripts

| Aspect | Python | TypeScript |
|--------|--------|------------|
| **File operations** | ✅ Native, simple | Needs fs module |
| **YAML parsing** | ✅ PyYAML mature | Needs extra lib |
| **Environment availability** | ✅ Usually pre-installed in Claude Code | May not have Node |
| **Script simplicity** | ✅ Great for scripts | Overkill for simple scripts |
| **Portability** | ✅ Cross-platform | Requires Node runtime |

**Recommendation**: **Python** for Hook scripts

### For VS Code Extension (Future)

| Aspect | Python | TypeScript |
|--------|--------|------------|
| **VS Code requirement** | ❌ Not supported | ✅ Required by VS Code API |
| **Extension API** | ❌ No access | ✅ Full access |

**Recommendation**: **TypeScript** for VS Code extension (when needed)

---

## ✅ Final Decision

### Language Assignment

| Component | Language | Rationale |
|-----------|----------|-----------|
| **Skills** | Markdown | AI instructions, not code |
| **Hook scripts** | **Python** | Simple, available, great for file ops |
| **VS Code extension** (future) | **TypeScript** | Required by VS Code API |

### Implementation Strategy

```
skills/                  → Markdown (.md)
hooks/                   → Python (.py)
platforms/vscode/        → TypeScript (.ts) [future]
```

---

## 📊 Detailed Rationale

### Why Python for Hooks

```python
# Example: check_stale.py
import yaml
from pathlib import Path

def check_stale_decisions(discuss_path, threshold=3):
    """Simple and readable"""
    meta_path = Path(discuss_path) / "meta.yaml"
    
    with open(meta_path) as f:
        meta = yaml.safe_load(f)
    
    current_round = meta['current_round']
    stale = []
    
    for decision in meta['decisions']:
        if decision['doc_path'] is None:
            stale_rounds = current_round - decision['confirmed_at']
            if stale_rounds >= threshold:
                stale.append(decision)
    
    return stale
```

**Advantages**:
- Concise and readable
- No build process needed
- Easy to debug
- Standard library has everything we need

### Why TypeScript for VS Code (Future)

```typescript
// Example: extension.ts (future)
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'discuss-coordinator.startDiscussion',
        () => {
            // Access VS Code API
            vscode.window.showInformationMessage('Discussion started');
        }
    );
    
    context.subscriptions.push(disposable);
}
```

**Required** by VS Code extension architecture - not optional.

---

## 📊 Mixed Language Project Structure

```
skill-discuss-for-specs/
├── skills/              # Markdown
├── hooks/               # Python
│   ├── __init__.py
│   ├── post_response/
│   └── common/
├── platforms/
│   ├── claude-code/     # Python + Shell scripts
│   └── vscode/          # TypeScript (future)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
└── pyproject.toml       # Python project config
```

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Python not available | Low | High | Check/install in installation script |
| Mixed languages confusing | Low | Low | Clear directory separation |
| Future platform needs different language | Medium | Medium | Isolate in platform directories |

---

## 🔄 Change Log

| Round | Date | Changes | Reason |
|-------|------|---------|--------|
| #R10 | 2026-01-17 | Proposed Python for Hooks | Simplicity and availability |
| #R11 | 2026-01-17 | Confirmed Python + TypeScript split | Clear component requirements |

---

## 🔗 Related Links

- [Decision 07: Project Directory Structure](./07-project-directory-structure.md)
- [Decision 08: Multi-Platform Output](./08-multi-platform-output.md)
