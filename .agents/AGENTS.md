<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workspace Guidelines & Rules for Sheet2Vow

## Documentation Synchronization Rule (Mandatory)
- **Mandatory Documentation Sync**: Every major feature addition, schema modification, API route update, or architectural change MUST be immediately synchronized with the authoritative project documentation (`docs/tech_spec.md`, `docs/vow/features.md`, and `docs/vow/master_spreadsheet_schema.md`). Every significant change completed is added as a completed task in the docs.
- **Never Leave Stale Docs**: Whenever new modules, tabs, endpoints, or data models are introduced or refactored, update the corresponding markdown documentation as part of the core implementation workflow before completing the task.

## Production Deployment Rule (Mandatory)
- **Always Push Changes to PROD (main)**: Every completed change or feature that is committed and pushed to `develop` must immediately be pushed to production (`main`) afterwards:
  1. Commit and push changes to `develop` (`git push origin develop`).
  2. Switch to `main` (`git checkout main`).
  3. Merge `develop` (`git merge develop`).
  4. Push to production (`git push origin main`).
  5. Return to `develop` (`git checkout develop`).

## Versioning Policy & Automation (Mandatory)
- **Patch Version** (`npm run bump:patch`): Increment patch (`X.Y.Z` -> `X.Y.Z+1`) with every patch change, bug fix, styling tweak, or minor cleanup.
- **Minor Version** (`npm run bump:minor`): Increment minor (`X.Y.Z` -> `X.Y+1.0`) whenever features are added, removed, or updated.
- **Major Version** (`npm run bump:major`): Increment major (`X.Y.Z` -> `X+1.0.0`) for significant changes / "New release bundles", ONLY when the USER explicitly mentions it is a major release.
- **Always Update Build Metadata**: Running the bump script automatically updates both `package.json` and `src/lib/buildInfo.ts` with the new version and current formatted deployment timestamp (`MMM D, YYYY • H:MM A`).
