# D05: CLI Help Output Optimization

## Status
✅ Confirmed

## Date
2026-02-03

## Decision

Improve CLI help output scannability through tiered structure and color emphasis, without hiding information.

## Background

The current CLI help output dumps all information on screen, making it difficult to find key information. Users reported:
- Information overload in main help
- Hard to quickly find what they need
- Wall of text without visual hierarchy

## Design Goals

### For New Users (Quick Orientation)
- One-liner to get started
- Platform list to check if their tool is supported

### For Experienced Users (Deep Reference)
- Flag names and syntax
- Examples of specific use cases

### Constraint
- Do NOT hide information - reorganize and highlight instead

## Changes

### 1. Main Help Structure

Reorganize main `--help` with clear sections:

```
Usage: discuss-for-specs [options] [command]

Cross-platform skills and hooks installer for AI assistants.

Get Started:
  $ npx discuss-for-specs install -p cursor   # Quick install (no global setup)
  $ discuss-for-specs install -p cursor       # If installed globally

Supported Platforms:
  L2 (auto-reminder):  claude-code, cursor, cline
  L1 (skills only):    kilocode, opencode, codex, trae, qoder, roo-code

  Run 'discuss-for-specs platforms' for platform details.

Commands:
  install      Install skills and hooks to your environment
  uninstall    Remove skills and hooks from your environment
  export       Export skills to a raw directory
  platforms    List all supported platforms
  status       Show installation status

Options:
  -v, --version   Show version number
  --no-color      Disable colored output
  -h, --help      Display help for command

Run 'discuss-for-specs <command> --help' for detailed options and examples.
```

### 2. Platform Command with Table Format

The `platforms` command shows detailed table:

```
Supported Platforms:

  Level  Platform      Description
  ─────  ────────────  ─────────────────────────────
  L2     claude-code   Claude Code / Claude Desktop
  L2     cursor        Cursor Editor
  L2     cline         Cline (VS Code Extension)
  L1     kilocode      Kilocode
  L1     opencode      OpenCode
  L1     codex         Codex CLI (OpenAI)
  L1     trae          Trae (ByteDance AI IDE)
  L1     qoder         Qoder
  L1     roo-code      Roo-Code

L2 platforms support auto-reminder via hooks.
L1 platforms provide discussion skills without auto-reminder.
```

### 3. Color Emphasis

Add minimal color coding using chalk:

| Element | Color | Purpose |
|---------|-------|---------|
| Section Headers | `chalk.bold` | Visual anchors |
| Commands | `chalk.cyan` | Highlight executable commands |
| Platform names | `chalk.green` | Highlight platform list |
| Example `$` | `chalk.gray` | Reduce noise |
| Flags | `chalk.yellow` | Highlight options |

Respects existing `--no-color` flag for accessibility.

### 4. Subcommand Help (Unchanged Structure)

Keep detailed information in subcommand help (`install --help`, etc.):
- Full options with descriptions
- Platform paths for troubleshooting
- Multiple examples covering common use cases

## Implementation

### cli.js Changes

1. Update program description with new structure
2. Add "Get Started" section at top
3. Simplify platform list (inline format)
4. Add footer directing to subcommand help
5. Apply chalk colors to key elements

### platforms Command Changes

1. Format output as table with columns: Level, Platform, Description
2. Add detection status if `--status` flag present
3. Add explanatory footer for L1/L2 distinction

## Design Rationale

### Why Two Example Formats?

```
$ npx discuss-for-specs install -p cursor   # Quick install (no global setup)
$ discuss-for-specs install -p cursor       # If installed globally
```

- `npx` version: Most universal, works without global install
- Non-npx version: For users who have installed globally
- Comments clarify when to use each

### Why Inline Platform List in Main Help?

- New users only need to quickly confirm "my platform is in the list"
- Detailed info available via `platforms` command
- Keeps main help scannable

### Why Colors?

- Colors are for structure, not decoration
- Limited to 3-4 colors for consistency
- Existing `--no-color` flag ensures accessibility

## Success Criteria

1. Main help fits in terminal without scrolling (typical 80x24 terminal)
2. New users can find "Get Started" in < 3 seconds
3. Platform list scannable at a glance
4. No information is hidden, only reorganized
