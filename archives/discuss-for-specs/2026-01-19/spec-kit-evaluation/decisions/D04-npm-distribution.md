# Distribute Installation Commands via npm

**Decision Time**: #R5
**Status**: ✅ Confirmed
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

Users need to install Skills into their projects. Need to determine the distribution and installation method.

### Constraints

- Good user experience required
- Low maintenance cost
- Reference spec-kit's `specify` CLI

---

## 🎯 Objective

Provide a convenient installation method so users can install Skills with a single command.

---

## 📊 Solution Comparison

| Solution | Description | Advantages | Disadvantages | Decision |
|----------|-------------|------------|---------------|----------|
| npm package | `npx discuss-for-specs install` | Standardized; no download needed; good version management | Requires Node.js environment | ✅ |
| Installation script | `./install.sh --platform cursor` | Simple | Need to download script first | ❌ |
| Manual copy | Users manually copy files | Simplest | Poor experience; error-prone | ❌ |
| Git clone | Run build after `git clone` | Good version control | Users need to understand build process | ❌ |

---

## ✅ Final Decision

### Chosen Solution

Publish `discuss-for-specs` package via npm, providing bin commands.

### Decision Rationale

1. **User Experience**: `npx discuss-for-specs install` - done with one command
2. **Version Management**: npm has built-in version management
3. **No Pre-download**: `npx` runs directly
4. **Industry Standard**: Like `create-react-app`, `specify`, etc.

### Expected Outcome

```bash
# Install to current project
npx discuss-for-specs install --platform cursor

# Install to specific directory
npx discuss-for-specs install --platform claude-code --target ~/my-project

# View supported platforms
npx discuss-for-specs platforms
```

---

## 🔗 Related Links

- [D05: npm package design](./D05-npm-package-design.md)
