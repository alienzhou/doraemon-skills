# Commit Message Format: Conventional Commits + Git Trailer

**Decision Time**: #R6
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement
Need a commit message format that is both human-readable (for GitLens, git log) and machine-parseable (for querying, filtering by session/agent).

### Constraints
- AI generates descriptive content only (D02)
- Script appends structured metadata (D02)
- Should leverage existing Git tooling, not custom parsers

---

## 🎯 Objective

A standardized commit message format that combines semantic descriptions with queryable metadata.

---

## 📊 Solution Comparison

| Format | Description | Advantages | Disadvantages | Decision |
|--------|-------------|------------|---------------|----------|
| Git Trailer only | `Key: Value` at end | Git native; queryable | No standardized title convention | ❌ alone |
| Conventional Commits only | `type(scope): desc` | Widely adopted; rich tooling | No structured metadata capability | ❌ alone |
| JSON in body | Embed `{"key":"value"}` | Flexible structure | Unreadable in git log; no native support | ❌ |
| Git Notes | Separate metadata store | Doesn't pollute commit message | Not pushed by default; hard to discover | ❌ |
| **Conventional Commits + Trailer** | Combined | Best of both worlds | Slightly verbose | ✅ |

---

## ✅ Final Decision

### Chosen Solution
**Conventional Commits title format + Git Trailer for metadata**

### Format Specification

```
checkpoint(<scope>): <AI-generated short description>

<AI-generated detailed description of changes, intent, context>

Session-Id: <session-uuid>
Agent: <platform>
Checkpoint-Type: <auto|fallback>
```

**Structure**:
- **Line 1 (Title)**: `checkpoint(scope): description` — AI generates scope + description
- **Lines 3-N (Body)**: Free-form description — AI generates
- **Trailer block**: `Key: Value` pairs — Script appends via `git interpret-trailers`

### Implementation

```bash
# Script receives AI message, appends trailers, commits
echo "$AI_MESSAGE" | git interpret-trailers \
  --trailer "Session-Id: $SESSION_ID" \
  --trailer "Agent: $AGENT_PLATFORM" \
  --trailer "Checkpoint-Type: $TYPE" \
  | git commit --all -F -
```

### Querying Examples

```bash
# Find all checkpoints from a session
git log --grep="Session-Id: abc123"

# Extract session IDs
git log --format="%(trailers:key=Session-Id,valueonly)"

# List all checkpoint commits
git log --grep="^checkpoint("
```

### Decision Rationale
- Conventional Commits: mature ecosystem, recognizable prefix, scope provides context
- Git Trailer: native Git support, queryable, no custom parser needed
- Combined: human reads the title + body, machine reads the trailers

---

## 🔗 Related Links

- [D02 - AI/Script Responsibility](./D02-ai-script-responsibility.md)
- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Git Trailer Documentation](https://git-scm.com/docs/git-interpret-trailers)
