# Angular Master Feature Pattern

Use this reference to generate a simple Angular master-data CRUD feature from the existing `banks` implementation.

## Naming

- Feature folder: plural kebab case, e.g. `banks`, `account-types`, `bank-accounts`.
- Service class: singular PascalCase plus `Service`, e.g. `BankService`.
- Store export: singular PascalCase plus `Store`, e.g. `BankStore`.
- Component class: always `Page`.
- Model interfaces:
  - `<Entity>Model`
  - `<Entity>RequestModel`
  - `<Entity>QueryParams`
  - `PagedResultModel<T>` when no shared model exists.
- Id field: use the API/DTO id exactly, e.g. `bankId`, `accountTypeId`.
- API path: `${environment.main_url}/<feature-plural>`.

## Files

Create this structure:

```text
src/RixsFinTrack.Client/src/app/features/<feature-plural>/<feature-plural>.routes.ts
src/RixsFinTrack.Client/src/app/features/<feature-plural>/models/<entity>.ts
src/RixsFinTrack.Client/src/app/features/<feature-plural>/pages/pages.html
src/RixsFinTrack.Client/src/app/features/<feature-plural>/pages/pages.scss
src/RixsFinTrack.Client/src/app/features/<feature-plural>/pages/pages.ts
src/RixsFinTrack.Client/src/app/features/<feature-plural>/services/<entity>.service.ts
src/RixsFinTrack.Client/src/app/features/<feature-plural>/stores/<entity>.store.ts
```

The feature-local `models/<entity>.ts` is the source of truth for that feature's response, request, query, status, and paged result types. Do not create shared master model files under `src/app/core/models/master`, and do not re-export feature models from core.

## Model

Define response, request, and query interfaces in `src/app/features/<feature-plural>/models/<entity>.ts`. Include audit fields only if the backend returns them.

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

Import these models from nearby feature files with relative paths:

```ts
import { EntityQueryParams, EntityRequestModel } from '../models/entity';
```

If one feature needs another feature's model, import that model from the owning feature folder:

```ts
import { DepartmentModel, PagedResultModel } from '../../departments/models/department';
```

## Service

Use `HttpClient`, `HttpParams`, `RootModel`, and `environment.main_url`. Always send `Page` and `Take`; send `Search` only when trimmed text exists. Send `SortField` and `SortOrder` whenever the store/page has a sort field.

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

Also implement `getById(id)`, `create(model)`, `update(id, model)`, and `delete(id)`.

## Store

Use `signalStore`, `withEntities<T>()`, `withState`, `withComputed`, and `rxMethod`.

State should include:

```ts
selectedValue: EntityModel | null;
isSubmitting: boolean;
isModalVisible: boolean;
isEdit: boolean;
isLoading: boolean;
error: string | null;
page: number;
take: number;
search: string;
sortField: string;
sortOrder: number;
totalCount: number;
totalPages: number;
```

Defaults:

```ts
page: 1;
take: 20;
search: "";
sortField: "name";
sortOrder: 1;
```

Store methods:

- `loadAll(queryParams?: Partial<EntityQueryParams> | void)`: set loading, merge page/take/search/sortField/sortOrder, call service `get`, patch `setAllEntities`, set totals.
- `createDialog()`: clear selection, set create mode, show modal.
- `add(model)`: call service `create`, add entity, close modal, increment total, show success toast.
- `updateDialog(entity)`: set edit mode, selected entity, show modal.
- `update(modelWithId)`: call service `update`, patch entity, close modal, clear selected entity, show success toast.
- `delete({ idField })`: optimistically remove or remove on success according to current project behavior, decrement total, show success toast.
- `reset()`: clear submit/modal/edit/loading/error flags.
- `selectedChange(value)`: update selected value.

Use `MessageService` with `environment.default_toastKey` for success toasts:

- `Successfully Created`
- `Successfully Updated`
- `Successfully Deleted`

Avoid duplicate error toasts. If a feature needs action-specific context such as `Failed to create <entity>.`, set the request context to skip the global HTTP error toast and show exactly one contextual feature-level error toast. Otherwise, let the global HTTP error interceptor show the API error and keep store catch blocks limited to state cleanup.

## Page Component

Use a standalone component named `Page` with PrimeNG modules matching the current project page pattern:

- `ButtonModule`
- `SplitButtonModule`
- `InputTextModule`
- `InputIconModule`
- `IconFieldModule`
- `TableModule`
- `DialogModule`
- `ConfirmDialogModule`
- `Message`
- `TranslatePipe`
- shared UTC/local date pipe when audit or date columns are present

Use `FormBuilder`, reactive forms, `effect`, `ConfirmationService`, and `MessageService`.

Page behavior:

- `ngOnInit()` loads menu and calls store `loadAll()`.
- `create()` resets the form and opens create dialog.
- `update()` requires selected row; otherwise warn `Please choose <Entity>.`.
- `delete()` requires selected row and opens confirmation dialog.
- `submit()` marks invalid controls dirty, then calls store `add` or `update`.
- `onLazyLoad(event)` calculates page from PrimeNG `first` and `rows`, then calls store `loadAll`.
- `onLazyLoad(event)` must also read `event.sortField` and `event.sortOrder`, then pass `sortField` and `sortOrder` to `loadAll`.
- `search(value)` calls store `loadAll({ page: 1, take, search: value, sortField: store.sortField$(), sortOrder: store.sortOrder$() })`.
- `onSelectionChange(value)` calls store `selectedChange`.
- `onDialogHide()` calls store `reset()` and clears selected value.
- Inject `TranslateService` for PrimeNG menu item labels, toast/warn text, and confirmation dialog text that cannot use the template pipe.
- Use translation keys for all visible CRUD text. At minimum each generated master feature should have keys for create, edit, update, delete, save, validation, empty table message, confirmation text, and entity field labels.
- Convert any date/time value entered in local time to UTC before sending it to the API. Prefer a shared helper such as `toServerUtcIso(localDate)` rather than hand-writing conversions in each page.

## Page Template

Use `p-table` with:

- `[value]="store.getAll$()"`
- lazy pagination
- `[rows]="store.take$()"`
- `[first]="(store.page$() - 1) * store.take$()"`
- `[totalRecords]="store.totalCount$()"`
- `[sortField]="store.sortField$()"`
- `[sortOrder]="store.sortOrder$()"`
- `[loading]="store.isLoading()"`
- `[rowsPerPageOptions]="[10, 20, 30, 50, 100]"`
- `selectionMode="single"`
- `[selection]="selectedValue"`
- `(selectionChange)="onSelectionChange($event)"`
- `dataKey="<idField>"`

Include caption with Create split button and search input. Include sortable headers for visible columns using matching field names, e.g. `<th pSortableColumn="name">... <p-sortIcon field="name"></p-sortIcon></th>`. The field names must match the DTO properties and backend `SortField` mapping. Use Angular date pipe for `createdAt` and nullable `updatedAt`.

## Sorting Rule

- Every lazy `p-table` menu list must bind `[sortField]`, `[sortOrder]`, and `(onLazyLoad)`.
- Every sortable header must include both `pSortableColumn="<field>"` and `<p-sortIcon field="<field>"></p-sortIcon>`.
- `EntityQueryParams`, service `HttpParams`, store state/computed values, `loadAll`, `onLazyLoad`, and `search` must all preserve `sortField` and `sortOrder`.
- Default `sortField` should be the primary display field, such as `name`, `bankName`, `typeName`, or `createdAt` only when that is the natural default order.
- For server-side lazy tables, do not rely on client-side-only sorting. Ensure the backend list endpoint accepts `SortField`/`SortOrder` and applies sorting before pagination.

Use a shared UTC-to-local formatter for server date/time values. Server values are UTC; Angular display must be local browser time with this format:

```html
{{ entity.createdAt | localDateTime }}
```

Default format: `dd/MMM/yyyy hh:mm a`, e.g. `08/Jun/2026 08:27 PM`.

Use `p-dialog` for create/update form. Dialog form controls must be vertical by default:

```html
<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <label>{{ 'FEATURE.FIELD_NAME' | translate }}</label>
    <input formControlName="fieldName" pInputText />
  </div>
</div>
```

Only switch to side-by-side grid controls when a form has enough controls that horizontal grouping is clearly easier to scan. Include validation messages for required and max length rules. Submit button label must switch between translated `Save` and `Update`, and bind `[loading]="store.isSubmitting()"`.

Use `p-confirmDialog` with a feature-specific key such as `<entity>DeleteDialog`.

## Date/Time Rule

- Server responses are UTC.
- Angular list/detail displays must convert UTC to local time.
- Display format must be `dd/MMM/yyyy hh:mm a`.
- If the server returns a UTC string without `Z` or an offset, parse it as UTC by appending `Z` before formatting.
- When sending date/time inputs to the server, convert the browser local date/time to UTC ISO with `toISOString()`.
- Do not use raw `date` pipe directly for server UTC strings in generated master pages; use the shared pipe/helper so strings without timezone are handled consistently.

## Route

Feature route:

```ts
import { Routes } from "@angular/router";
import { Page } from "./pages/pages";

export default [
  {
    path: "",
    component: Page,
    data: { title: "MENU.MANAGEMENT.ENTITIES" },
  },
] as Routes;
```

App route child, when needed:

```ts
{
  path: 'entities',
  loadChildren: () => import('./features/entities/entities.routes'),
}
```

Navigation menu labels and route `data.title` values should use translation keys, not literal English labels. Add matching keys to both `public/assets/i18n/en.json` and `public/assets/i18n/mm.json`.
