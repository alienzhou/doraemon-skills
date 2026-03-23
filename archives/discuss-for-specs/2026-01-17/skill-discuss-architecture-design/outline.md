# 🎯 skill-discuss-for-specs Architecture Design

| 📅 Date | ⏱️ Round | Status |
|---------|---------|--------|
| 2026-01-17 | R11 | ✅ Converged |

---

## 📊 Current Status

```
Pending: 0 ✅    Confirmed: 10    Rejected: 1

 R1    R2    R3    R4    R5    R6    R7    R8    R9   R10   R11
  │     │     │     │     │     │     │     │     │     │     │
4 ●─────●     │     │     │     │     │     │     │     │     │
  │     │╲    │     │     │     │     │     │     │     │     │
3 │     │ ╲───●─────●─────●     │     │     │     │     │     │
  │     │     │     │     │╲    │     │     │     │     │     │
2 │     │     │     │     │ ╲───●     │     │─────●     │     │
  │     │     │     │     │     │╲    │     │     │╲    │     │
1 │     │     │     │     │     │ ╲───●     │     │ ╲───●     │
  │     │     │     │     │     │     │╲    │     │     │╲    │
0 │     │     │     │     │     │     │ ╲───●     │     │ ╲───● ← Current
  │     │     │     │     │     │     │     │     │     │     │
```

> 🎉 All questions resolved! V1 architecture design complete.

---

## 📌 Session Recovery Guide

If you're a new session, please read the following to quickly restore context:

1. Read this outline to understand discussion progress
2. Read decision documents in `decisions/` directory to understand confirmed solutions
3. Focus on "Questions" section to continue unfinished discussions

> **Project Goal**: In the skill-discuss-for-specs repository, based on existing Claude Skills Discuss series, design and implement a discussion mode Skill system adapted for Cursor  
> **Background**: There are currently 6 disc-* Skills in `~/.claude/skills/` (coordinator, doc-writer, file-manager, outline-renderer, problem-tracker, trend-tracker)

---

## ❓ Questions

```
🟢 Q1   Skill Granularity → 2 Skills (Coordinator Layer + Output Layer)
🟢 Q1.1 Skill Naming → discuss-coordinator + discuss-output
🟢 Q5   Recording Mechanism → Hook-based, Agent focuses on discussion
🟢 Q6   Responsibility Boundary → Intelligence work to Agent, process work to Hook
🟢 Q7   Precipitation Detection → meta.yaml structured annotation + script checking
🟢 Q8   doc_path Update Timing → Update simultaneously when creating document
🟢 Q9   Unprecipitated Reminder Threshold → Default 3 rounds, supports customization
🟢 Q10  Global Configuration → Hook detects and initializes on first run
🟢 Q11  Directory Structure → Mechanism-based (skills/ + hooks/ + platforms/)
🟢 Q12  Multi-Platform → Header separation + build-time merge
🟢 Q13  Implementation Language → Python for Hooks, TypeScript for VS Code Extension
```

> 🎉 All questions resolved

---

## 🔄 Discussing (0)

> (None)

---

## 🧪 Exploring (0)

> (None)

---

## ⏸️ Deferred (0)

> (None)

---

## Below: Completed Content

---

### ✅ Confirmed (10)

**📌 Skill Architecture** `#R3-R4` → [See Details](./decisions/01-skill-architecture.md)
- Adopt 2-Skill layering: Coordinator Layer + Output Layer
- Coordinator Layer: Process coordination + Problem tracking + Trend tracking
- Output Layer: Rendering + File management + Document generation

**📌 Skill Naming** `#R8` → [See Details](./decisions/02-skill-naming.md)
- Coordinator Layer: `discuss-coordinator`
- Output Layer: `discuss-output`

**📌 Design Principle: Intelligence vs Process Separation** `#R5` → [See Details](./decisions/03-intelligence-vs-process-separation.md)
- Agent focuses on discussion (understanding, analysis, decision-making)
- Hook handles processes (counting, checking, reminders)

**📌 Precipitation Detection Mechanism** `#R6-R7` → [See Details](./decisions/04-precipitation-detection-mechanism.md)
- Maintain decisions list in meta.yaml
- Each decision has doc_path field
- Hook/script checks if doc_path is null and if file exists
- Update doc_path simultaneously when creating document

**📌 Reminder Mechanism** `#R7` → [See Details](./decisions/05-reminder-mechanism.md)
- Default: Remind if unprecipitated for more than 3 rounds
- Supports custom configuration

**📌 Global Configuration Mechanism** `#R7` → [See Details](./decisions/06-global-configuration-mechanism.md)
- Hook detects configuration on first run
- Initialize default values if no configuration exists
- Use existing configuration if present

**📌 Project Directory Structure** `#R9-R11` → [See Details](./decisions/07-project-directory-structure.md)
- Mechanism-based: skills/ (Markdown) + hooks/ (Python) + platforms/ (adaptation)
- Skill = Markdown files, instructions for AI
- Hook = Python scripts, automation code

**📌 Multi-Platform Output** `#R9-R11` → [See Details](./decisions/08-multi-platform-output.md)
- Skill core content shared across platforms
- Header separation, merged at build time
- platforms/ only handles platform differences

**📌 Implementation Language** `#R10-R11` → [See Details](./decisions/09-implementation-language.md)
- Hook scripts: Python
- VS Code Extension (future): TypeScript

**📌 Version Strategy** `#R7`
- Current version is V1, build foundation framework first
- Continuous iteration in the future

---

### ❌ Rejected (1)

**╳ Trend Tracker as Standalone Skill** `#R4`
- Reason: Scope too narrow, functionality too lightweight, better merged into coordinator layer

---

### 📄 Detailed Documents

```
decisions/
├─ 01-skill-architecture.md           ← Skill architecture design
├─ 02-skill-naming.md                 ← Skill naming solution
├─ 03-intelligence-vs-process-separation.md  ← Intelligence vs process separation
├─ 04-precipitation-detection-mechanism.md   ← Precipitation detection mechanism
├─ 05-reminder-mechanism.md           ← Reminder mechanism
├─ 06-global-configuration-mechanism.md      ← Global configuration
├─ 07-project-directory-structure.md  ← Project directory structure
├─ 08-multi-platform-output.md        ← Multi-platform output
└─ 09-implementation-language.md      ← Implementation language selection
```
