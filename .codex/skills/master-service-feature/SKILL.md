---
name: master-service-feature
description: Generate or update Angular master-service CRUD feature files for RixsFinTrack Client. Use when Codex needs to create frontend feature folders with model, service, NgRx signal store, standalone page, route, sortable table, dialog form, pagination, search, create, update, delete, or adapt an existing master feature pattern for later services.
---

# Master Service Feature

## Overview

Generate Angular master-data CRUD features for `src/RixsFinTrack.Client` by following the existing `banks` feature pattern. Keep the output aligned with the project's Angular standalone components, PrimeNG UI, NgRx signal store, and API response wrapper conventions.

For exact templates, naming rules, and implementation details, read `references/angular-master-feature-pattern.md`.

## Workflow

1. Inspect the requested feature name, API route, id field, display fields, form fields, validation rules, and list columns from the user's request or nearby backend DTOs/controllers.
2. Read the existing `banks` feature if the reference seems stale or the project pattern has changed.
3. Create or update these files:
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/models/<feature>.ts`
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/services/<feature>.service.ts`
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/stores/<feature>.store.ts`
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/pages/pages.ts`
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/pages/pages.html`
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/pages/pages.scss`
   - `src/RixsFinTrack.Client/src/app/features/<feature-plural>/<feature-plural>.routes.ts`
4. Put all feature-specific model interfaces and types in that feature-local `models/<feature>.ts` file. Do not create or import from `src/app/core/models/master`.
5. Import feature models from local relative paths such as `../models/<feature>` or `../../other-feature/models/<other-feature>` when a page needs another feature's model.
6. Add the feature route under the `AppLayout` children in `src/RixsFinTrack.Client/src/app/app.routes.ts` when the user asks for navigation or a usable page route.
7. Use `RootModel` for API responses and extract paged list data from `res.data as PagedResultModel<T>`.
8. Keep lists lazy, paginated, searchable, sortable, and backed by `page`, `take`, `search`, `sortField`, `sortOrder`, `totalCount`, and `totalPages` store state.
9. Run formatting or build checks when practical, preferably from `src/RixsFinTrack.Client`.
10. After generating a feature, compare it against the current `banks` page/store/service and update this skill reference if the live pattern changed.

## Guardrails

- Do not expose backend EF entities or invent unrelated backend code from this frontend skill.
- Do not create CQRS, repository, or backend service code here.
- Do not hand-write a different frontend architecture unless the user explicitly asks.
- Prefer the current project's import aliases such as `@core/...` and `@env/environment`.
- Keep feature-specific Angular models inside the owning feature folder at `features/<feature-plural>/models/<feature>.ts`; do not add shared master models under `core/models/master`.
- Keep controllers/API response assumptions consistent with the backend standard: every endpoint returns `success`, `code`, `message`, and `data`.
- Dialog forms must default to vertical controls. Use horizontal/grid side-by-side controls only when the form has many controls and the grouping improves scanning.
- Master CRUD actions must support Myanmar translation for Create, Edit, Update, Delete, Save, confirmation, warnings, and common validation text.
- When a feature needs action-specific error text such as create/update/delete context, set the request context to skip the global HTTP error toast and show exactly one feature-level contextual error toast.
- Treat server date/time values as UTC on the Angular side and display them in browser local time as `dd/MMM/yyyy hh:mm a`, e.g. `08/Jun/2026 08:27 PM`.
- When sending date/time values back to the API, convert local UI dates to UTC ISO strings before building the request payload.
