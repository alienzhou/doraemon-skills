# D08: Batch Implementation Strategy - Batch 1 Platforms Confirmed

> **Status**: 📁 Historical (Superseded by D09 → D10)
> This decision was later revised - see D10 for final platform list.

## Decision
**Confirm Batch 1 platform list**: Focus on the following 7 platforms for priority implementation, other platforms deferred.

## Status
📁 Historical (Superseded)

## Date
2026-01-31

## Batch 1 Platforms

| Platform | Level | Hook Type | Adaptation Work |
|----------|-------|-----------|-----------------|
| **Claude Code** | L2 | Stop | ✅ Already supported |
| **Cline** | L2 | TaskComplete | 🆕 Need Hook script |
| **Gemini CLI** | L2 | AfterAgent | 🆕 Need Hook script |
| **OpenCode** | L1 | - | 🆕 Need Skill file |
| **Codex** | L1 | - | 🆕 Need Skill file |
| **Kilocode** | L1 | - | 🆕 Need Skill file |
| **Roo Code** | L1 | - | 🆕 Need Skill file (pure guidance) |

## Context
User wants to implement platform support in batches to avoid taking on too much work at once.

### Platform Selection Rationale
1. **Claude Code**: Already supported, serves as reference baseline
2. **Cline**: Code research confirms `TaskComplete` Hook, can directly integrate
3. **Gemini CLI**: Has `AfterAgent` Hook, similar protocol
4. **OpenCode**: Although Hook misaligned, Skills fully supported
5. **Codex**: Skills fully supported, has clear directory structure
6. **Kilocode**: Skills fully supported, has Marketplace integration
7. **Roo Code**: User requested support, will use pure guidance Skill

### Deferred Platforms
The following platforms have not been researched in detail yet:
- Trae (unclear documentation)
- Amp (needs MCP research)
- Windsurf (Rules-based only)
- Qoder CLI (TBD)
- CodeBuddy CLI (TBD)

## Implementation Plan

### L2 Platform Adaptation (Cline, Gemini CLI)
1. Create Hook script template
2. Script calls existing Python `check_precipitation.py`
3. Communication protocol: JSON stdin/stdout

### L1 Platform Adaptation (OpenCode, Codex, Kilocode, Roo Code)
1. Generate SKILL.md file
2. Add guidance in Skill instructions to prompt users to precipitate decisions proactively
3. Reference D05's L1 Skill Guidance design

### Roo Code Special Handling
Since Roo Code doesn't support native Skills mechanism, will use:
- Pure guidance SKILL.md (loaded via AGENTS.md or other entry points)
- Or provide documentation on how to manually configure

## Success Criteria
- [ ] Cline users can receive precipitation reminders via `TaskComplete` Hook
- [ ] Gemini CLI users can receive precipitation reminders via `AfterAgent` Hook
- [ ] OpenCode users can use discuss-for-specs Skill
- [ ] Codex users can use discuss-for-specs Skill
- [ ] Kilocode users can use discuss-for-specs Skill
- [ ] Roo Code users can use discuss-for-specs functionality

## References
- [D05: L1 Skill Guidance](./D05-l1-skill-guidance.md)
- [D06: OpenCode Downgrade](./D06-opencode-downgrade-l1.md)
- [Platform Research Notes](../notes/platform-research.md)
