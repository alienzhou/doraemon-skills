# Platform Config Draft

> Configuration design proposal extracted from discussion

## Background

Adopting spec-kit's `AGENT_CONFIG` pattern to centrally manage directory conventions and build information for each platform.

## Config File Draft

Suggest creating `config/platforms.yaml`:

```yaml
platforms:
  claude-code:
    name: "Claude Code"
    skills_dir: ".claude/skills"
    header_file: "claude-code.yaml"
    status: "stable"

  cursor:
    name: "Cursor"
    skills_dir: ".cursor/skills"
    header_file: "cursor.yaml"
    status: "beta"
    note: "Skills feature may require Nightly version"

  github-copilot:
    name: "GitHub Copilot"
    skills_dir: ".github/skills"
    header_file: "github-copilot.yaml"
    status: "stable"

  windsurf:
    name: "Windsurf"
    skills_dir: ".windsurf/skills"
    header_file: "windsurf.yaml"
    status: "stable"

  gemini:
    name: "Gemini CLI"
    skills_dir: ".gemini/skills"
    header_file: "gemini.yaml"
    status: "needs-enable"
    note: "Need to run `gemini skills enable <name>` to enable"
```

## Current Architecture

```
skills/
├── discuss-coordinator/
│   ├── SKILL.md                    # Common content (no frontmatter)
│   └── headers/
│       ├── claude-code.yaml        # ✅ Already exists
│       ├── cursor.yaml             # 🔴 To be added
│       ├── github-copilot.yaml     # 🔴 To be added
│       ├── windsurf.yaml           # 🔴 To be added
│       └── gemini.yaml             # 🔴 To be added
└── discuss-output/
    └── (same structure as above)
```

## Installation Method Options

| Option | Command Example | Pros | Cons |
|--------|-----------------|------|------|
| A. Manual Copy | Manually download and copy from release | Simple | Poor experience |
| B. Installation Script | `./install.sh --platform cursor --target ~/project` | Automated | Need to maintain scripts |
| C. Git Clone | User clones and runs build | Good version control | Users need to understand build process |

## To Be Decided

- [ ] Choose installation method (A/B/C)
- [ ] Whether to create `config/platforms.yaml`
- [ ] Which platforms to prioritize (recommended: Claude Code + Cursor)

---

**Created**: 2026-01-19
**Source**: spec-kit-evaluation discussion
