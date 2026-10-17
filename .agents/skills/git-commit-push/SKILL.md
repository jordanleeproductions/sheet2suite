---
name: git-commit-push
description: Analyzes git changes, commits with a summary message, and pushes to the current branch.
---

# Git Commit and Push Skill

When the user asks you to commit and push changes, follow these steps:

1. **Check Status & Diff**: 
   - Run `git status` to see what files are modified.
   - Run `git diff` and `git diff --cached` to understand the actual changes.
2. **Version Bump**:
   - For bug fixes, styling tweaks, minor cleanups: run `npm run bump:patch`.
   - For features added, removed, or updated: run `npm run bump:minor`.
   - For significant changes / new release bundles (only when user explicitly mentions major release): run `npm run bump:major`.
3. **Generate Summary**:
   - Analyze the diff and generate a concise, conventional commit message (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
   - If there are many changes, include a brief bulleted list in the commit body.
4. **Commit & Push to Develop**:
   - Run `git add .` to stage all changes.
   - Run `git commit -m "your generated summary"` to commit the changes.
   - Run `git push origin HEAD` to push the changes to `develop`.
5. **Deploy to Production (main)**:
   - Run `git checkout main ; git merge develop ; git push origin main ; git checkout develop` to merge the changes into `main`, push to production, and return to `develop`.

*Note: Use PowerShell syntax (e.g., separating commands with `;` instead of `&&`) when executing these commands.*
