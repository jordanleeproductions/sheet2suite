<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workspace Guidelines & Rules for Sheet2Vow

## Documentation Synchronization Rule (Mandatory)
- **Mandatory Documentation Sync**: Every major feature addition, schema modification, API route update, or architectural change MUST be immediately synchronized with the authoritative project documentation (`docs/tech_spec.md`, `docs/vow/features.md`, and `docs/vow/master_spreadsheet_schema.md`). Every significant change completed is added as a completed task in the docs.
- **Never Leave Stale Docs**: Whenever new modules, tabs, endpoints, or data models are introduced or refactored, update the corresponding markdown documentation as part of the core implementation workflow before completing the task.
