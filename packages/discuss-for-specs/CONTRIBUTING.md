# Contributing to skill-discuss-for-specs

Thank you for your interest in contributing! This guide will help you get started with development.

## Development Setup

### Prerequisites

- **Python 3.8+** - For hooks development
- **Node.js 16+** - For npm package development
- **Git** - Version control

### Clone and Install

```bash
# Clone the repository
git clone git@github.com:alienzhou/skill-discuss-for-specs.git
cd skill-discuss-for-specs

# Install Python dependencies (runtime + dev)
pip install -e ".[dev]"

# Install npm dependencies (for npm package)
cd npm-package
npm install
cd ..
```

## Project Structure

```
skill-discuss-for-specs/
├── skills/              # Skill definitions (Markdown instructions for AI)
│   └── discuss-for-specs/    # Unified discussion skill
│       ├── SKILL.md          # Core skill content
│       ├── headers/          # Platform-specific YAML headers
│       └── references/       # Templates and reference docs
├── hooks/               # Python automation scripts (source)
│   ├── common/          # Shared utilities
│   └── stop/            # Precipitation check (snapshot-based)
├── npm-package/         # NPM package for distribution
│   ├── src/             # Package source code
│   ├── bin/             # CLI entry point
│   ├── scripts/         # Build scripts
│   ├── dist/            # [Generated] Built skills for all platforms
│   └── hooks/           # [Generated] Copied from root hooks/
├── config/              # Configuration files
├── templates/           # File templates for new discussions
├── tests/               # Python tests
└── docs/                # Documentation
```

### Source vs Generated Files

| Path | Type | Description |
|------|------|-------------|
| `skills/` | Source | Skill Markdown files |
| `hooks/` | Source | Python hook scripts |
| `npm-package/src/` | Source | Package JS code |
| `npm-package/dist/` | Generated | Built skills (gitignored) |
| `npm-package/hooks/` | Generated | Copied hooks (gitignored) |

## Building

### NPM Package

The npm package bundles skills and hooks for distribution:

```bash
cd npm-package

# Build the package (copies hooks, builds skills for each platform)
npm run build

# This generates:
# - dist/claude-code/  - Skills built for Claude Code
# - dist/cursor/       - Skills built for Cursor
# - hooks/             - Copied from root hooks/
```

## Testing

### Python Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_meta_parser.py -v
```

### Manual Testing

1. Install the skills in Claude Code or Cursor
2. Start a discussion with the AI
3. Verify the discussion flow works as expected

## Making Changes

### Modifying Skills

Skills are pure Markdown files in `skills/*/SKILL.md`:

1. Edit the SKILL.md file
2. Test with actual discussions
3. Run `npm run build` in npm-package/ to rebuild

### Modifying Hooks

Hooks are Python scripts in `hooks/`:

1. Edit the hook script
2. Run tests: `python -m pytest tests/`
3. Run `npm run build` in npm-package/ to copy hooks

### Adding Platform Support

1. Add platform header in `skills/*/headers/<platform-name>.yaml`
2. Add platform configuration in `npm-package/src/platform-config.js`
3. Update `npm-package/scripts/build.js` to include the platform

## Code Style

- **Python**: Follow PEP 8
- **JavaScript**: ES modules, use existing patterns
- **Markdown**: Keep lines readable, use consistent formatting

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests to ensure nothing is broken
5. Commit with clear messages
6. Push and create a Pull Request

## Questions?

- Check existing [issues](https://github.com/alienzhou/skill-discuss-for-specs/issues)
- Read the [documentation](docs/)
- Open a new issue for discussion
