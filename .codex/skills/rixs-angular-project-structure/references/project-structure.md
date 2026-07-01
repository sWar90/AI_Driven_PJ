# RixsFinTrack Angular Project Structure

Use this reference when creating, updating, or explaining frontend structure in `src/RixsFinTrack.Client`.

## Project Baseline

- Framework: Angular 21 standalone application.
- Package manager declared in `package.json`: `pnpm@11.1.1`.
- UI stack: PrimeNG 21, PrimeIcons, `@primeuix/themes`, Tailwind CSS 4 with `tailwindcss-primeui`.
- State: `@ngrx/signals` and `@ngrx/signals/entities`.
- i18n: `@ngx-translate/core` loading `assets/i18n/en.json` and `assets/i18n/mm.json`.
- HTTP: `provideHttpClient(withFetch(), withInterceptors([...]))`.
- Routing: standalone `Routes` arrays, feature-level lazy route files, hash location strategy.
- Change detection: zoneless via `provideZonelessChangeDetection()`.

## Top-Level Client Layout

```text
src/RixsFinTrack.Client/
  angular.json
  package.json
  tsconfig.json
  src/
    app/
      app.config.ts
      app.routes.ts
      app.ts
      core/
      features/
      layout/
      shared/
    assets/
      styles.scss
      tailwind.css
      layout/
    environments/
      environment.ts
      environment.staging.ts
      environment.prod.ts
  public/
    assets/
      i18n/
        en.json
        mm.json
```

## App Bootstrap and Core Services

- `src/app/app.config.ts` registers router, HTTP interceptors, PrimeNG theme, translation loader, `MessageService`, zoneless change detection, and `HashLocationStrategy`.
- `src/app/app.routes.ts` defines top-level routes:
  - public/home and auth route groups load outside the shell.
  - authenticated app routes live under `AppLayout`.
  - feature pages usually lazy-load `./features/<feature>/<feature>.routes`.
- `src/app/core/` contains cross-cutting auth, interceptors, HTTP error handling, encryption, and shared core models.
- `src/app/shared/` contains reusable components, pipes, and services. Use existing shared pipes such as `LocalDateTimePipe` instead of duplicating date logic.

## Feature Folder Shape

Use this shape for ordinary feature pages:

```text
src/app/features/<feature-plural>/
  <feature-plural>.routes.ts
  models/
    <feature>.ts
  services/
    <feature>.service.ts
  stores/
    <feature>.store.ts
  pages/
    pages.ts
    pages.html
    pages.scss
```

For specialized domains, follow the existing local variant:

- `features/report/<ReportName>/model|service|store|page`
- `features/dashboard/components/...` for dashboard widgets and charts
- `features/auth/pages/...` for auth-only standalone pages

## Naming Rules

- Folder names: plural kebab case, such as `banks`, `account-types`, `bank-accounts`.
- Route files: `<feature-plural>.routes.ts`.
- Model file: singular kebab case, such as `bank.ts`.
- Service class: singular PascalCase plus `Service`, such as `BankService`.
- Store export: singular PascalCase plus `Store`, such as `BankStore`.
- Page class: match existing feature style when present; banks uses `BankPage`, many older features may use `Page`.
- Selector: use `app-<feature>-page` for new pages.
- API paths: start from `environment.main_url`, for example `${environment.main_url}/banks`.

## Build Order for a New Feature

1. Choose the source pattern.
   - For master CRUD, use `features/banks`.
   - For complex screens, inspect the closest existing feature with similar UI and store behavior.
2. Create the model file.
   - Define response, request, query, status/option, and paged-result interfaces.
   - Include audit fields only if the API returns them.
   - Keep DTO property names aligned with backend response names.
3. Create the service.
   - Inject `HttpClient`.
   - Return `Observable<RootModel>`.
   - Build `HttpParams` with `Page`, `Take`, optional trimmed `Search`, optional `SortField`, and optional `SortOrder`.
   - Use `HttpContext` with `SKIP_GLOBAL_ERROR_TOAST` when the feature store shows contextual errors.
4. Create the signal store.
   - Use `signalStore`, `withState`, `withComputed`, `withMethods`, and `rxMethod`.
   - Use `withEntities<T>()` plus `setAllEntities`, `addEntity`, `updateEntity`, and `removeEntity` for list CRUD.
   - Keep state for `selectedValue`, `isSubmitting`, `isModalVisible`, `isEdit`, `isLoading`, `error`, `page`, `take`, `search`, `sortField`, `sortOrder`, `totalCount`, and `totalPages`.
   - Default `page` to `1`, `take` to `20`, `search` to `''`, and `sortOrder` to `1`.
5. Create the page component and template.
   - Use standalone components.
   - Use Reactive Forms for dialog forms.
   - Use PrimeNG table, dialog, confirm dialog, buttons, inputs, select, tag, and message components as needed.
   - Use `TranslatePipe` in templates and `TranslateService` for menu items, confirmations, and toast text.
6. Create the feature route file.
   - Export a default `Routes` array.
   - Put `data.title` as a translation key.
7. Register app route if the feature should be reachable from the shell.
   - Add lazy route under the `AppLayout` children in `src/app/app.routes.ts`.
   - Add `canActivate: [AuthGuardService]` for authenticated pages.
8. Register menu item when needed.
   - Add an item in `NAVIGATION_MENU` with translation label, PrimeIcon class, and `routerLink`.
9. Add i18n keys.
   - Update both `public/assets/i18n/en.json` and `public/assets/i18n/mm.json`.
   - Include menu label, page title, fields, placeholders, validations, empty message, warnings, confirmation text, and contextual error text.
10. Verify.
   - Run `pnpm build` from `src/RixsFinTrack.Client` when feasible.
   - If the task is UI-heavy, run the app and inspect the page in browser.

## Model Pattern

```ts
export interface EntityModel {
  entityId: number;
  name: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface EntityRequestModel {
  name: string;
}

export interface EntityQueryParams {
  page: number;
  take: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
}

export interface PagedResultModel<T> {
  items: T[];
  page: number;
  take: number;
  totalCount: number;
  totalPages: number;
}
```

## Service Pattern

```ts
get(queryParams: EntityQueryParams): Observable<RootModel> {
  let params = new HttpParams()
    .set('Page', queryParams.page)
    .set('Take', queryParams.take);

  if (queryParams.search?.trim()) {
    params = params.set('Search', queryParams.search.trim());
  }

  if (queryParams.sortField?.trim()) {
    params = params
      .set('SortField', queryParams.sortField.trim())
      .set('SortOrder', queryParams.sortOrder ?? 1);
  }

  return this.httpClient.get<RootModel>(`${environment.main_url}/entities`, { params });
}
```

Also add `getById`, `create`, `update`, and `delete` only when the API supports those operations.

## Table and Pagination Rules

- Use `p-table` with lazy server pagination.
- Bind `[value]` to store entities, `[rows]` to store take, `[first]` to `(page - 1) * take`, and `[totalRecords]` to total count.
- Bind `[sortField]` and `[sortOrder]`.
- Handle `(onLazyLoad)` by computing page from `first` and `rows`, preserving search, sort field, and sort order.
- Use `[rowsPerPageOptions]="[10, 20, 30, 50, 100]"`.
- Use sortable headers with both `pSortableColumn="<field>"` and `<p-sortIcon field="<field>"></p-sortIcon>`.
- Do not rely on client-side-only sort for server-paginated tables.

## Dialog and Form Rules

- Use vertical form controls by default with `flex flex-col gap-2`.
- Use `Validators.required`, `Validators.maxLength`, and any backend-aligned validators.
- Mark invalid controls dirty on submit before returning.
- Submit create/update through the store, not directly from the component.
- Use `p-message` for field validation text.
- Use translated labels, placeholders, and validation messages.

## Date and Time Rules

- Treat server date/time strings as UTC.
- Display server values with `LocalDateTimePipe`.
- Use `{{ value | localDateTime }}` for audit columns.
- If sending local UI date/time values to the API, convert them with `toServerUtcIso`.
- Do not use raw Angular `date` pipe for server UTC strings in new feature list/detail pages.

## Toast and Error Rules

- Success toasts should use `environment.default_toastKey`.
- Translate summaries and details.
- For action-specific errors, set `SKIP_GLOBAL_ERROR_TOAST` in the service and show exactly one contextual feature-level error toast in the store.
- Otherwise let the global HTTP error interceptor own generic API errors.

## Route Pattern

```ts
import { Routes } from '@angular/router';
import { EntityPage } from './pages/pages';

export default [
  {
    path: '',
    component: EntityPage,
    data: { title: 'MENU.MANAGEMENT.ENTITIES' },
  },
] as Routes;
```

App shell route:

```ts
{
  path: 'entities',
  loadChildren: () => import('./features/entities/entities.routes'),
  canActivate: [AuthGuardService],
}
```

## Menu Pattern

Add menu entries in `src/app/layout/component/app.menu.ts` only when the user asks for navigation or when a new page must be discoverable:

```ts
{
  label: 'MENU.MANAGEMENT.ENTITIES',
  icon: 'pi pi-fw pi-list',
  routerLink: ['/entities'],
}
```

Choose a PrimeIcon that matches the domain and keep labels as translation keys.

## Verification Commands

Run from `src/RixsFinTrack.Client`:

```powershell
pnpm build
```

If `pnpm` is not on PATH, use the Codex bundled pnpm path from workspace dependencies.
