# MVP Scope Definition

**Decision Time**: #R13
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Define the minimum viable product scope for Agent Better Checkpoint — what to build first to validate the core idea.

---

## 🎯 Objective

Deliver a working Skill + Hook system that turns AI Agent edits into transparent, operable Git commits.

---

## ✅ MVP Deliverables

### 1. Skill File (Markdown)

Instructs the AI Agent to:
- Autonomously commit after meaningful edits
- Generate commit messages in Conventional Commits format: `checkpoint(scope): description`
- Include a body with intent and change description
- Call the commit script with the message and user prompt as CLI arguments

### 2. Commit Script (Shell)

Responsibilities:
- Receive AI-generated message (`$1`) and user prompt (`$2`)
- Truncate user prompt to ≤60 characters (head + tail with `...`)
- Append Git Trailers via `git interpret-trailers`:
  - `Agent: <platform>`
  - `Checkpoint-Type: auto | fallback`
  - `User-Prompt: <truncated>`
- Execute `git add -A && git commit -F -`

### 3. Stop Hook Script (Python)

Responsibilities:
- Run at conversation end (triggered by platform's stop hook)
- Check `git status` for uncommitted changes
- If uncommitted changes exist, output reminder text to stdout
- Agent reads the reminder and performs a fallback commit

---

## ❌ Explicitly NOT in MVP

| Feature | Reason | Decision |
|---------|--------|----------|
| Session ID | Platform support inconsistent | [D04](./D04-session-id-deferred.md) |
| Branch strategy | Too complex; single-session first | [D05](./D05-branch-strategy-deferred.md) |
| `afterFileEdit` hook trigger | Cursor beta; not reliable | [notes](../notes/platform-hook-research.md) |
| `Files-Changed` trailer | Nice-to-have; `git show` already provides this | - |
| `Checkpoint-Seq` trailer | Depends on Session ID | - |
| Multi-platform support | Start with Cursor only | - |

---

## 📊 Commit Message Format (MVP)

```
checkpoint(<scope>): <AI-generated short description>

<AI-generated detailed description>

Agent: cursor
Checkpoint-Type: auto
User-Prompt: <head>...<tail>
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────┐
│ Skill (Markdown)                    │
│ Guides AI: when to commit,         │
│ how to format message               │
│         │                           │
│         ▼                           │
│ AI generates message + calls script │
└────────────┬────────────────────────┘
             │ ./checkpoint.sh "msg" "prompt"
             ▼
┌─────────────────────────────────────┐
│ Commit Script (Shell)               │
│ Truncate prompt, append trailers,   │
│ git add + git commit                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Stop Hook (Python)                  │
│ On conversation end:                │
│ git status → uncommitted? → remind  │
└─────────────────────────────────────┘
```

---

## 🔗 Related Links

- [D01 - Trigger Strategy](./D01-trigger-strategy.md)
- [D02 - AI/Script Responsibility](./D02-ai-script-responsibility.md)
- [D03 - Commit Message Format](./D03-commit-message-format.md)
