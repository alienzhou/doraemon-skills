# Version Management Optimization

## 🔵 Current Focus
(Implementation complete)

## ⚪ Pending
(None)

## ✅ Confirmed
- **C1**: Skills MD must retain version information
- **C2**: Use template variables in headers, inject at build time
- **C3**: package.json is the single source of truth for version
- **C4**: Template syntax: `{{version}}` (Mustache style)
- **C5**: config/default.yaml also uses template
- **C6**: Only inject `version` for now, no other variables

## 🎉 Implementation Complete
- Modified `build.js` with `injectVersion()` function
- All 5 platform headers now use `{{version}}` template
- `config/default.yaml` uses `{{version}}` template
- Build output correctly shows version: `0.2.0`

## ❌ Rejected
- ~~Remove version from headers entirely~~ (skills need version info)
- ~~Other template variables (author, buildDate)~~ (not needed now)

---

## Context

### Current State
When updating version (e.g., 0.1.0 → 0.2.0), need to update:
1. `npm-package/package.json` - npm package version
2. `config/default.yaml` - project config version
3. `npm-package/config/default.yaml` - built config version
4. `skills/discuss-for-specs/headers/claude-code.yaml`
5. `skills/discuss-for-specs/headers/cursor.yaml`
6. `skills/discuss-for-specs/headers/kilocode.yaml`
7. `skills/discuss-for-specs/headers/opencode.yaml`
8. `skills/discuss-for-specs/headers/codex.yaml`

Then run `pnpm run build` to regenerate dist/ files.

### Pain Points
- Easy to miss files
- Manual editing is error-prone
- Version can get out of sync
