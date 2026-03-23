# Discussion: Adopting spec-kit's cross-platform distribution architecture

> Status: Concluded | Round: R6 | Date: 2026-01-19

## 🔵 Current Focus

(Discussion completed, moving to implementation phase)

## ⚪ Pending (Implementation Tasks)

- [ ] Create `config/platforms.yaml`
- [ ] Add header files for Cursor
- [ ] Create npm package `discuss-for-specs`
- [ ] Implement CLI commands (Node.js)

## ✅ Confirmed

- D1: Skill as primary distribution format → [D01-skill-as-primary-format](./decisions/D01-skill-as-primary-format.md)
- D2: Preserve headers separation design → [D02-headers-separation](./decisions/D02-headers-separation.md)
- D3: Adopt centralized configuration management → [D03-centralized-config](./decisions/D03-centralized-config.md)
- D4: Distribute installation commands via npm → [D04-npm-distribution](./decisions/D04-npm-distribution.md)
- D5: npm package design → [D05-npm-package-design](./decisions/D05-npm-package-design.md)

## ❌ Rejected

(None)

## 📁 Archive

| Topic | Conclusion | Details |
|-------|-----------|---------|
| spec-kit distribution architecture | Three-tier architecture: Config layer + Template layer + Build layer | [→ Platform config draft](./notes/platforms-config-draft.md) |
| Platform Skills support | All mainstream platforms support SKILL.md | [→ Comparison study](./notes/platform-skills-rules-comparison.md) |
| Claude vs Cursor | Minor differences, need separate header maintenance | [→ Detailed comparison](./notes/claude-vs-cursor-skills.md) |

---

## 📚 References

- [Platform Skills/Rules comparison study](./notes/platform-skills-rules-comparison.md)
- [Claude vs Cursor Skills comparison](./notes/claude-vs-cursor-skills.md)
- [Platform config draft](./notes/platforms-config-draft.md)
