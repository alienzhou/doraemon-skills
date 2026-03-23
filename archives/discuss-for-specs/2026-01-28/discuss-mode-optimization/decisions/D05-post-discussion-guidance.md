# Post-Discussion Guidance Response

**Decision Time**: #R8  
**Status**: ✅ Confirmed  
**Related Outline**: [Back to Outline](../outline.md)

---

## 📋 Background

### Problem/Requirement

After a discussion concludes (all questions resolved/rejected/deferred), the current system directly asks if user wants to execute. This misses an opportunity to guide users toward better practices.

### Constraints

- Our boundary is the "discussion" phase only
- We should not implement complex downstream features
- Many mature tools exist for specs generation and planning
- Solution should be a guidance response, not new functionality

---

## 🎯 Objective

Provide a helpful guidance response when discussion ends that:
1. Informs user where discussion artifacts are located
2. Suggests multiple paths forward
3. Explains how to leverage the discussion context

---

## ✅ Final Decision

### Chosen Solution

**Add a guidance response template to the Skill**

When discussion is detected as complete, include a response section like:

```markdown
---

## 🎉 Discussion Complete!

Your discussion has been captured. Here's what you can do next:

### 📁 Your Discussion Artifacts

Location: `.discuss/YYYY-MM-DD/[topic]/`

Files:
- `outline.md` - Discussion summary and decisions index
- `decisions/` - Detailed decision documents
- `notes/` - Reference materials (if any)

### 🚀 Recommended Next Steps

**Option 1: Generate Technical Specs**
Use a Spec-Driven Development (SDD) tool to convert this discussion into a formal specification:
- Reference the discussion directory as context
- Tools like [cursor-spec-kit](https://github.com/example/cursor-spec-kit) or similar can help
- Command example: `use your SDD tool with context from .discuss/...`

**Option 2: Create Execution Plan**
Switch to Plan mode or use a planning agent:
- Provide the discussion directory as context
- Generate a step-by-step implementation plan
- Example: "Based on decisions in .discuss/..., create an execution plan"

**Option 3: Direct Execution**
Start implementing immediately:
- Reference specific decision documents as needed
- Use the discussion as your design reference

**Option 4: Archive for Later**
No action needed now - your discussion is saved and can be revisited anytime.

---

Which path would you like to take?
```

### Key Principles

1. **Boundary Clarity**: Our responsibility ends at discussion; we guide but don't implement downstream
2. **Tool Agnostic**: Suggest categories of tools, not specific products (unless user asks)
3. **Context Emphasis**: Always tell users where files are and how to reference them
4. **No Lock-in**: Users can use any SDD tool or planning approach they prefer

### Integration Points

| Downstream Need | How User Can Proceed |
|-----------------|---------------------|
| Specs Generation | Use any SDD tool with discussion context |
| Planning | Switch to plan mode or use planning agent |
| Execution | Start coding, reference decisions as needed |
| Collaboration | Share discussion directory with team |

### Decision Rationale

1. Discussion is valuable context that shouldn't be wasted
2. Guiding users to proper next steps improves their workflow
3. We don't need to build what already exists
4. A template response is simple to implement (just add to Skill)

### Expected Outcome

- Users know where their discussion artifacts are
- Users understand their options for next steps
- Smooth handoff to downstream tools/modes
- No additional implementation complexity

---

## 🔄 Implementation

Add the guidance response template to the Skill's `<reminders>` or create a new `<post_discussion>` section.

The agent should:
1. Detect when discussion appears complete (all questions resolved)
2. Include the guidance section in its response
3. Let user choose their preferred path

---

## 🔗 Related Links

- [D01-skill-architecture.md](./D01-skill-architecture.md)
