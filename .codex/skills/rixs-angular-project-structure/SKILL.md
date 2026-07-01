---
name: rixs-angular-project-structure
description: Build or modify Angular features in the RixsFinTrack Client project using the repository's actual structure, standalone Angular components, lazy routes, PrimeNG UI, NgRx signal stores, translation files, API response wrapper, pagination, sorting, date/time, and menu conventions. Use when Codex needs to inspect, create, extend, or explain frontend project structure, feature folders, routes, menus, services, stores, pages, forms, tables, or i18n for src/RixsFinTrack.Client.
---

# Rixs Angular Project Structure

## Overview

Follow the existing `src/RixsFinTrack.Client` Angular structure before creating or changing frontend code. Prefer feature-local models, services, signal stores, standalone pages, lazy route files, PrimeNG controls, and translation keys that match the live project.

For detailed folder maps, step-by-step build order, and file-level conventions, read `references/project-structure.md`.

## Workflow

1. Inspect the requested feature type and choose the closest existing pattern:
   - Simple CRUD/master list: compare with `features/banks`.
   - User administration: compare with `features/user-manage`.
   - Reports: compare with `features/report`.
   - Dashboard widgets/charts: compare with `features/dashboard`.
2. Read `references/project-structure.md` before adding or moving frontend files.
3. Confirm the API contract from backend DTOs/controllers when available; otherwise infer conservatively from the existing feature family.
4. Create feature files under `src/RixsFinTrack.Client/src/app/features/<feature-folder>/`.
5. Add or update route registration in the feature route file and, when navigation is required, in `src/app/app.routes.ts`.
6. Add or update sidebar menu entries in `src/app/layout/component/app.menu.ts` only when the feature should be visible in navigation.
7. Add matching translation keys in `public/assets/i18n/en.json` and `public/assets/i18n/mm.json` for visible labels, table headers, dialog text, validation, warnings, and toast details.
8. Run a frontend build or type check from `src/RixsFinTrack.Client` when practical.

## Guardrails

- Use Angular standalone components and existing imports/aliases such as `@core/*`, `@env/*`, `@shared_services/*`, `@shared_component/*`, and `@/*`.
- Keep feature-specific models inside the owning feature folder. Do not create shared master model folders unless the existing project already has the exact shared contract.
- Use `RootModel` for HTTP responses and unwrap `res.data` in stores/services as the current pattern does.
- Keep lazy tables server-backed: preserve `page`, `take`, `search`, `sortField`, `sortOrder`, `totalCount`, and `totalPages`.
- Use `LocalDateTimePipe` for server UTC display and `toServerUtcIso` for local date/time input sent back to the API.
- Keep all visible UI text behind translation keys. Do not hardcode new English/Myanmar labels directly in templates except temporary debugging text that will be removed.
- Prefer PrimeNG components already used by nearby pages: `p-table`, `p-dialog`, `p-confirmDialog`, `p-splitbutton`, `p-button`, `p-message`, `p-select`, `p-tag`, and input modules.
- Do not invent backend code from this frontend skill. If backend changes are needed, use the relevant backend skill and preserve the Hybrid Clean Architecture rules.

## Related Skills

- Use `master-service-feature` for generating a simple CRUD/master feature from the established banks-style pattern.
- Use `user-manage-angular` for user-management-specific pages, stores, and services.
- Use `report-angular` if present for report pages and report grid behavior.
