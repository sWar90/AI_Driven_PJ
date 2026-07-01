---
name: user-manage-angular
description: Build or modify the Angular UserManage feature in RixsFinTrack Client. Use when Codex needs to create, update, or extend user-management Angular screens, services, models, routes, PrimeNG table/dialog forms, NgRx signal stores, pagination/search flows, role/department inputs, translations, or menu/route registration following the existing src/RixsFinTrack.Client/src/app/features/user-manage implementation.
---

# User Manage Angular

## Overview

Use this skill to keep Angular user-management work aligned with the existing RixsFinTrack Client pattern: standalone feature route, typed model file, HTTP service, NgRx signal store with entity state, and a PrimeNG table plus dialog form page.

For exact field and file conventions, read `references/angular-user-manage-pattern.md` before editing or generating code.

## Workflow

1. Inspect the current feature first:
   - `src/RixsFinTrack.Client/src/app/features/user-manage`
   - `src/RixsFinTrack.Client/src/app/app.routes.ts`
   - `src/RixsFinTrack.Client/src/app/layout/component/app.menu.ts`

2. Preserve the existing feature layout:
   - `models/user-manage.ts`
   - `services/user-manage.service.ts`
   - `stores/user-manage.store.ts`
   - `pages/pages.ts`
   - `pages/pages.html`
   - `pages/pages.scss`
   - `user-manage.routes.ts`

3. Use the API response and pagination contract:
   - Services return `Observable<RootModel>`.
   - List calls send `Page`, `Take`, and optional trimmed `Search`.
   - Stores cast `res.data` to `PagedResultModel<UserManageModel>`.
   - Pages use PrimeNG lazy loading and calculate page from `TableLazyLoadEvent`.

4. Keep business state in the signal store:
   - Use `withEntities<UserManageModel>()`.
   - Use `selectedValue`, `isSubmitting`, `isModalVisible`, `isEdit`, `isLoading`, `error`, `page`, `take`, `search`, `totalCount`, and `totalPages`.
   - Expose computed accessors matching the existing `$` naming style.
   - Implement load, create dialog, add, update dialog, update, delete, reset, and selection methods with `rxMethod`.

5. Keep the page focused on UI behavior:
   - Use standalone Angular components.
   - Use reactive forms and PrimeNG controls.
   - Do not put HTTP calls in the page except lookup data that the existing feature already loads there, such as department options.
   - Keep create/update/delete persistence in the store.
   - Use `TranslatePipe` and `TranslateService`; do not hard-code user-facing strings except option values such as role names when matching the current feature.

6. Update surrounding registration when needed:
   - Add or preserve lazy route registration in `app.routes.ts` with `AuthGuardService`.
   - Add or preserve menu entry in `NAVIGATION_MENU`.
   - Add translation keys wherever the active translation files live in the branch; if no translation files exist, use the key names consistently and mention the missing files in the final response.

## Checks

After changes, run the relevant Angular checks from `src/RixsFinTrack.Client` when available, such as lint, typecheck, or build. If those scripts are missing or fail for unrelated reasons, report the exact command and outcome.
