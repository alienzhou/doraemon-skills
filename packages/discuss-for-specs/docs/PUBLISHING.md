# Publishing Guide

This document provides step-by-step instructions for publishing the `@vibe-x/discuss-for-specs` npm package.

## Prerequisites

Before publishing, ensure you have:

- Node.js >= 16.0.0
- npm CLI installed
- npm account with publish access to `@vibe-x` scope
- Clean git working directory

## Pre-publish Checklist

| Item | Command | Expected |
|------|---------|----------|
| Git status | `git status` | Working tree clean |
| npm login | `npm whoami` | Your npm username |
| Current version | `npm view @vibe-x/discuss-for-specs version` | Previous version |
| Local version | Check `npm-package/package.json` | New version number |

## Step-by-Step Publishing

### Step 1: Update Version (if needed)

Edit `npm-package/package.json` to set the new version:

```json
{
  "version": "x.y.z"
}
```

> **Note**: The build system automatically injects this version into all platform headers and config files via the `{{version}}` template mechanism.

### Step 2: Run Tests

```bash
cd npm-package
npm test
```

Ensure all tests pass before proceeding.

### Step 3: Build the Package

```bash
npm run build
```

This will:
- Copy hooks to `hooks/`
- Build skills for all 5 platforms (claude-code, cursor, kilocode, opencode, codex)
- Process config files with version injection

### Step 4: Verify Package Contents

```bash
npm pack --dry-run
```

Expected output should include:
- `bin/cli.js`
- `src/` directory
- `dist/` directory (built skills)
- `hooks/` directory
- `config/` directory

### Step 5: Publish to npm

```bash
npm publish --access public
```

> The `prepublishOnly` hook automatically runs `npm run build` before publishing.

### Step 6: Verify Publication

```bash
npm view @vibe-x/discuss-for-specs version
```

Should display the newly published version.

### Step 7: Create Git Tag

```bash
cd ..  # Return to repository root
git tag vX.Y.Z
git push origin vX.Y.Z
```

Replace `X.Y.Z` with the published version number.

## Version Management

### Template Mechanism

The project uses a single source of truth for version numbers:

1. **Source**: `npm-package/package.json` contains the authoritative version
2. **Templates**: Source files use `{{version}}` placeholder
   - `config/default.yaml`
   - `skills/discuss-for-specs/headers/*.yaml`
3. **Build**: `npm run build` injects the version into all templates

### Files with Version Templates

| Source File | Build Output |
|-------------|--------------|
| `config/default.yaml` | `npm-package/config/default.yaml` |
| `skills/discuss-for-specs/headers/claude-code.yaml` | `npm-package/dist/claude-code/*/SKILL.md` |
| `skills/discuss-for-specs/headers/cursor.yaml` | `npm-package/dist/cursor/*/SKILL.md` |
| `skills/discuss-for-specs/headers/kilocode.yaml` | `npm-package/dist/kilocode/*/SKILL.md` |
| `skills/discuss-for-specs/headers/opencode.yaml` | `npm-package/dist/opencode/*/SKILL.md` |
| `skills/discuss-for-specs/headers/codex.yaml` | `npm-package/dist/codex/*/SKILL.md` |

## Troubleshooting

### npm ERR! 403 Forbidden

You may not have publish access to the `@vibe-x` scope. Contact the package owner to be added as a collaborator.

### npm ERR! 402 Payment Required

Scoped packages require either:
- A paid npm account, OR
- Publishing with `--access public` flag

### Version Already Exists

npm does not allow republishing the same version. Increment the version number in `package.json` and try again.

## Related

- [README](../README.md) - Quick start and installation
- [HOW-IT-WORKS](./HOW-IT-WORKS.md) - Technical architecture
- [CHANGELOG](../CHANGELOG.md) - Version history
