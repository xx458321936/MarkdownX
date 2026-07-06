# CLAUDE.md

# Project

MarkFlow

A local-first Markdown editor.

Inspired by Typora and Obsidian.

Stack:

- React 19
- TypeScript
- Tauri 2
- Rust
- Zustand
- TailwindCSS

---

# Read Order

Before writing any code, always read:

1. PRD.md
2. TECH_DESIGN.md
3. TASKS.md
4. CODING_RULE.md
5. CLAUDE.md

---

# Current Goal

Only implement MVP.

Do NOT implement future features.

---

# Current Scope

Implement only:

- Workspace
- File Tree
- Markdown Editor
- Auto Save
- Search
- Drag & Drop
- Settings

Ignore:

- Plugin
- Cloud Sync
- Image
- Math
- Mermaid
- Collaboration

---

# Development Rules

Follow TASKS.md.

Only implement ONE task at a time.

Never skip tasks.

Never merge multiple tasks.

---

# Before Coding

Always check:

- Existing implementation
- Related interfaces
- Existing types

Do not duplicate code.

---

# After Coding

Must:

- Build successfully
- Pass TypeScript
- Pass ESLint

No warnings.

---

# If Refactoring

Only refactor code directly related to current task.

Never refactor unrelated modules.

---

# If Creating Files

Follow existing folder structure.

Avoid unnecessary files.

---

# If Editing

Prefer modifying existing modules.

Avoid creating duplicate logic.

---

# Naming

Use existing naming style.

Never introduce new naming conventions.

---

# State

Business state:

Zustand

Component state:

React State

Never mix them.

---

# File System

Never access disk directly.

Always call Tauri service.

---

# Rust

Rust only handles:

- File
- Folder
- Search
- Watch

No UI logic.

---

# Editor

All editing happens on Document Model.

Never edit DOM directly.

---

# Performance

Avoid unnecessary rendering.

Memoize expensive calculations.

Keep components small.

---

# Error Handling

Never ignore exceptions.

Always handle Promise rejection.

Always provide user feedback.

---

# Commit

One task

↓

One commit

---

# Output Format

After finishing a task, output:

Summary

Modified Files

New Files

Deleted Files

Risk

Next Task

---

# Never

Never use any.

Never bypass Store.

Never bypass Service.

Never modify unrelated modules.

Never rewrite working code.

Never introduce breaking changes.

---

# Goal

Write maintainable code.

Prefer simplicity.

Prefer readability.

Long-term maintainability is more important than short-term speed.