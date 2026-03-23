# Backlog: Cross-Platform Skills Distribution

> **Created**: 2026-01-19  
> **Last Updated**: 2026-01-28  
> **Purpose**: Items not included in current version (v0.1.0)

---

## Recent Changes (2026-01-28)

| Change | Impact on Backlog |
|--------|-------------------|
| Skill merged into single `discuss-mode` | F5 (Skill selection) less relevant now |
| meta.yaml fully automated | Reduces agent burden, simplifies usage |
| Session-based round counting | More accurate discussion tracking |

---

## Feature Backlog

Items that could be implemented in future versions:

| ID | Feature | Priority | Reason for Deferral | Status |
|----|---------|----------|---------------------|--------|
| F1 | Slash Command support | Medium | D1 decided to focus on Skills first; can be added later | Open |
| F2 | Uninstall command | Low | Can be done manually; not critical for MVP | Open |
| F3 | Update command | Medium | Version checking adds complexity; defer to later | Open |
| F4 | Interactive platform selection | Low | Nice to have, but flag-based works well | Open |
| F5 | ~~Skill selection (install specific skills)~~ | ~~Medium~~ | ~~For now, install all skills together~~ | Closed (single Skill now) |
| F6 | TypeScript implementation | Medium | Plain JS works; can migrate later if needed | Open |
| F7 | Post-discussion guidance customization | Low | Allow users to customize guidance message | NEW |
| F8 | Multi-language template support | Low | Templates currently in English only | NEW |

---

## Technical Optimization Backlog

Future technical improvements:

| ID | Optimization | Priority | Notes | Status |
|----|--------------|----------|-------|--------|
| O1 | Zero-dependency implementation | Medium | Remove `commander` dependency, use native arg parsing | Open |
| O2 | Add unit tests | High | Important for maintenance, but not blocking initial release | Partial (some tests exist) |
| O3 | Add CI/CD pipeline | Medium | Automate testing and publishing | Open |
| O4 | Support global installation | Low | User-level Skills installation | Open |
| O5 | Add progress indicators | Low | Visual feedback for long operations | Open |
| O6 | Session file cleanup automation | Medium | Auto-clean old session files | NEW |
| O7 | Hook logging improvements | Low | Better structured logging for debugging | NEW |

---

## Open Questions

Long-term questions to research or discuss:

| ID | Question | Context | Status |
|----|----------|---------|--------|
| Q1 | Should we support Rules distribution alongside Skills? | Some platforms have distinct Rules mechanisms | Open |
| Q2 | How to handle platform version differences? | e.g., Cursor Beta vs Stable | Open |
| Q3 | ~~Should Skills be bundled into a single file or kept modular?~~ | ~~Trade-off between simplicity and flexibility~~ | Resolved (merged into single Skill) |
| Q4 | How to handle Skill updates for existing installations? | Need migration/update strategy | Open |
| Q5 | Should we add telemetry for usage analytics? | Helpful for understanding adoption, but privacy concerns | Open |
| Q6 | How to integrate with SDD tools (spec generators)? | Post-discussion flow needs integration guidance | NEW |
| Q7 | Should session files be stored globally or per-project? | Currently proposed per-project in `.discuss/.sessions/` | NEW |

---

## Platform-Specific Backlog

Deferred platform-specific features:

### Cursor
- [ ] Add `globs` support for file-specific activation
- [ ] Test with Cursor Stable (currently targeting Nightly)

### Gemini CLI
- [ ] Create post-install script to remind users to enable Skills
- [ ] Explore auto-enable possibility

### GitHub Copilot
- [ ] Create header file for `discuss-mode`
- [ ] Test installation and activation

### Windsurf
- [ ] Create header file for `discuss-mode`
- [ ] Test installation and activation

### All Platforms
- [ ] Create platform-specific README files
- [ ] Add troubleshooting guides per platform

---

## Resolved Items (Moved from Backlog)

Items that were in backlog but have been addressed:

| ID | Item | Resolution | Date |
|----|------|------------|------|
| Q3 | Single vs modular Skills | Merged into single `discuss-mode` Skill (D7) | 2026-01-28 |
| F5 | Skill selection | No longer needed with single Skill | 2026-01-28 |

---

## References

- [Architecture Design - D7: Skill Merge](./3-architecture.md#d7-skill-architecture-merge)
- [Discussion: 2026-01-28 Optimization](../.discuss/2026-01-28/discuss-mode-optimization/)
- [Task List](./4-task-list.md)

---

**Last Updated**: 2026-01-28
