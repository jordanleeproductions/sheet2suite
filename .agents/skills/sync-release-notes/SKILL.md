---
name: sync-release-notes
description: Synchronizes user-facing release notes in src/lib/releaseNotes.ts whenever versions are bumped, ensuring high-level, non-technical, security-safe descriptions.
---

# Sync Release Notes Skill

Use this skill whenever bumping the application version (`bump:patch`, `bump:minor`, `bump:major`), reviewing release notes, or preparing a release commit for Sheet2Vow.

---

## 🎯 Core Principles

1. **Always Match the Active Version**:
   - `src/lib/releaseNotes.ts` MUST always contain an entry matching the active version in `package.json` and `src/lib/buildInfo.ts` (`vX.Y.Z`).
   - The newest release must have `badge: 'Latest'`. Prior releases should use category badges (e.g. `'Feature'`, `'Seating'`, `'Financials'`, `'Update'`).

2. **Strictly Non-Technical, User-Facing Tone**:
   - **NO Code or Method Names**: Never mention function or variable names (e.g., do NOT write `getResolvedGuestSeatsForTable`, `verifyActiveSession`, `parseTimeOrSerial`, etc.).
   - **NO Technical Error Classes**: Never cite internal exception types (e.g., do NOT write `TypeError`, `NullPointerException`, `UnhandledPromiseRejection`).
   - **NO Sensitive Security Details or Vulnerability Jargon**: Never reveal vulnerability specifics or attack surface descriptions (e.g., do NOT write `unauthenticated admin database endpoints`, `postMessage wildcard token leakage`, or cite `/api/admin/db`). Instead, write friendly, reassuring summaries like *"Platform security and access safeguards"* or *"Strengthened account connection and authentication flow"*.
   - **Focus on User Benefits & UX**: Describe what the couple or planner experiences: smoother guest seating, clearer financial contribution breakdowns, mobile layout improvements, and reliable background synchronization.

---

## 🛠️ Step-by-Step Workflow

### Step 1: Run Version Bump
When bumping the version, run the appropriate npm script:
```powershell
npm run bump:patch   # For fixes, styling tweaks, minor cleanups
npm run bump:minor   # For new features, tab additions, schema updates
npm run bump:major   # Only when explicitly requested for major bundles
```
*Note: `scripts/bumpVersion.ts` automatically adds a boilerplate entry for the new version in `src/lib/releaseNotes.ts`.*

### Step 2: Refine the Release Notes Entry
Open `src/lib/releaseNotes.ts` and customize the new entry at the top of `RELEASE_NOTES`:

```typescript
{
  version: 'vX.Y.Z',
  title: 'User-Friendly Feature or Fix Title',
  date: 'MMM D, YYYY',
  badge: 'Latest',
  badgeColor: '#10B981', // Emerald for latest / feature
  category: 'feature',    // 'major' | 'feature' | 'enhancement' | 'fix'
  highlights: [
    'User benefit highlight 1 (e.g. 1-tap contributor tracking in expenses)',
    'User benefit highlight 2 (e.g. Redesigned mobile seating view)',
    'User benefit highlight 3 (e.g. General platform reliability improvements)',
  ],
  details: 'One or two sentence friendly summary of what was delivered.',
}
```

### Step 3: Self-Audit Checklist Before Committing
Before committing, verify against this checklist:
- [ ] Does `RELEASE_NOTES[0].version` exactly match `package.json` version?
- [ ] Are all bullet points written in plain English understandable by a wedding couple?
- [ ] Are there ZERO method names, function names, file paths, or code references?
- [ ] Are there ZERO security vulnerability disclosures or internal architecture leaks?
- [ ] Does `npm run build` pass cleanly?
