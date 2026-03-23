# AGENTS

## Project Overview

This is a **Skills development and management repository** for execution review and optimization.

**Purpose**: This repository focuses on the Skill Reviewer skill, which provides a three-layer analysis framework for evaluating Skill/Tool/Agent execution quality.

**Skills' Role**:

- Modular: Each skill solves a specific problem
- Reusable: Scripts and tools in skills can be reused by multiple skills
- Clear responsibilities: Agent focuses on task scheduling, complex logic is handled by skills

---

## Quick Start

### Using Existing Skills

When an Agent executes tasks, it automatically selects and loads appropriate skills based on user needs:

```
1. Agent identifies task type
2. Finds matching skill in Available Skills list
3. Uses `skill` tool to load corresponding skill
4. Skill provides detailed usage instructions, workflow, and resources
5. Agent completes task following skill instructions
```

### Installing Skills

To use skills from this repository, create a symlink:

```bash
# Install skill-reviewer
ln -s /path/to/skill-reviewer/skill-reviewer ~/.claude/skills/skill-reviewer
```

---

## Project Structure

```
skill-reviewer/
├── skill-reviewer/               # Skill Reviewer skill
│   ├── SKILL.md                 # Main skill definition
│   └── references/              # Supporting documents
│
├── assets/                       # Static resources (images, PDFs)
├── .discuss/                     # Discussion records and decision documents
│
├── AGENTS.md                     # This file, project overview and skill management
├── README.md                     # Project overview (English)
└── README_CN.md                  # Project overview (Chinese)
```

---

## Skill Development Standards

### Design Principles

1. **Single Responsibility** - Each skill solves a specific problem
2. **Reusability** - Tools and scripts in skills should be independent and reusable
3. **Clear Input/Output** - SKILL.md must clearly state what the Agent needs to provide and what results it will get
4. **Practice-Oriented** - Write specific steps to solve specific problems, not generic tutorials

### SKILL.md Required Content

A usable SKILL.md must include the following, **cannot be missing**:

#### 1. Function Description (Required)

Clearly state what specific problem this skill solves.

**Bad Example**:

```markdown
## Function Description
This skill is for document processing
```

**Good Example**:

```markdown
## Function Description
Structure messy discussion thread information into decision documents, including decision content, solution comparison, and implementation plan
```

#### 2. Usage Scenarios (Required)

Explain in what specific situations to use this skill, including prerequisites.

**Good Example**:

```markdown
## Usage Scenarios
- Agent has identified clear decision points from discussions
- Need to document decision process and conclusions
- Discussion content includes: problem description, multiple solutions, decision rationale
```

#### 3. Workflow (Required)

Specific steps for Agent to execute this skill. Each step should include:

- Specific operations (not "consider")
- Expected results or output
- Possible edge case handling

#### 4. Resource List (Required if scripts or templates exist)

List all tools included in the skill, each with purpose and usage conditions.