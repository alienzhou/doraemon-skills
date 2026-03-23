# D05: L1 Platform Skill Guidance Design

## Status
✅ Confirmed

## Decision
Design additional Skill guidance content for platforms without Hooks (L1), using a two-layer separation design:
1. **Metadata layer** (for human/installer): Explains installation conditions and purpose
2. **Content layer** (for Agent): Pure behavioral guidance, no internal concepts

## Background
L1 platforms lack stop hooks and cannot automatically detect "outline changed but decisions not updated" situations. Need to add guidance in the Skill to let the Agent proactively complete decision precipitation.

**Problem**: If we directly write in the Skill "because your platform is L1, no Hook...", the Agent won't understand these product concepts.

## Solution

### Metadata Layer (File Header Comments)

```yaml
# references/l1-guidance.md
#
# Purpose: Provide additional guidance for platforms without Hooks
# Installation condition: Inject when target platform doesn't support stop hook
# Injection location: After "Your Responsibilities" section in SKILL.md
#
# Note: The following content is for the Agent, don't include internal concepts like L1/L2/Hook
```

### Content Layer (For Agent)

```markdown
## 📝 Precipitation Discipline

### Proactive Documentation
Don't wait to be reminded. After each round, ask yourself:
- "Did we reach any consensus this round?"
- "Have I documented confirmed decisions in `decisions/`?"

### Self-Check Trigger
Every 2-3 rounds of discussion, review:
- If outline shows multiple ✅ Confirmed items but `decisions/` is empty → Create documents now
- If a decision was confirmed 3+ rounds ago but not documented → Document it immediately

### The Rule
**Consensus reached = Decision documented.**
No delay, no exceptions.
```

## Design Principles

| Principle | Description |
|-----------|-------------|
| **Concept isolation** | Agent doesn't need to understand internal concepts like L1/L2/Hook |
| **Behavior-oriented** | Only describe "what to do", not "why" |
| **Universality** | The content itself is good practice, won't conflict even on platforms with Hooks |
| **Injectable** | Decide whether to inject based on platform type during installation |

## Installation Logic

```javascript
// npm-package/src/installer.js pseudocode
function buildSkill(platform) {
  let content = readFile('SKILL.md');

  if (!platformSupportsStopHook(platform)) {
    const guidance = readFile('references/l1-guidance.md');
    content = injectAfterSection(content, 'Your Responsibilities', guidance);
  }

  return content;
}
```

## Impact
- Add `skills/discuss-for-specs/references/l1-guidance.md`
- Modify `npm-package/src/installer.js` to add injection logic
- Modify `platforms/*/build.sh` to support conditional injection

## Related Decisions
- D03: Simplify levels