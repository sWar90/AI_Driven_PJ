# Angular UserManage Pattern

## Source Pattern

Base new or changed user-management work on:

- `src/RixsFinTrack.Client/src/app/features/user-manage/models/user-manage.ts`
- `src/RixsFinTrack.Client/src/app/features/user-manage/services/user-manage.service.ts`
- `src/RixsFinTrack.Client/src/app/features/user-manage/stores/user-manage.store.ts`
- `src/RixsFinTrack.Client/src/app/features/user-manage/pages/pages.ts`
- `src/RixsFinTrack.Client/src/app/features/user-manage/pages/pages.html`
- `src/RixsFinTrack.Client/src/app/features/user-manage/user-manage.routes.ts`

## Model Contracts

Keep model interfaces explicit and DTO-shaped:

- `UserManageModel`: `id`, `userName`, `email`, `phoneNumber`, `roleName`, `fullName`, `joinDate`, `department`.
- `UserManageCreateRequestModel`: same editable fields plus required `password`; no `id`.
- `UserManageUpdateRequestModel`: same editable fields plus required `id`; no `password`.
- `UserManageQueryParams`: `page`, `take`, optional `search`.
- `PagedResultModel<T>`: `items`, `page`, `take`, `totalCount`, `totalPages`.

Use `string | null` for nullable API fields and `string` for required request fields.

## HTTP Service

Follow these service conventions:

- Decorate with `@Injectable({ providedIn: 'root' })`.
- Inject `HttpClient` through the constructor.
- Use `environment.main_url` and the `/user-manage` API segment.
- Return `Observable<RootModel>` for all methods.
- Use `HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true)` on all requests so the store/page controls toast details.
- Build list params with capitalized backend names: `Page`, `Take`, and optional trimmed `Search`.
- Implement `get`, `getById`, `create`, `update`, and `delete`.

## Signal Store

Use `signalStore({ providedIn: 'root' })`, `withEntities<UserManageModel>()`, `withState`, `withComputed`, and `withMethods`.

State shape:

```ts
export interface UserManageState {
  selectedValue: UserManageModel | null;
  isSubmitting: boolean;
  isModalVisible: boolean;
  isEdit: boolean;
  isLoading: boolean;
  error: string | null;
  page: number;
  take: number;
  search: string;
  totalCount: number;
  totalPages: number;
}
```

Initial values: `selectedValue: null`, booleans false, `error: null`, `page: 1`, `take: 20`, `search: ''`, counts 0.

Entity id selector:

```ts
const selectId: SelectEntityId<UserManageModel> = (user) => user.id;
```

Required methods:

- `loadAll(queryParams?)`: patch paging/search/loading state, call service, then `setAllEntities(result?.items ?? [], { selectId })` and update `totalCount`/`totalPages`.
- `createDialog()`: clear selection, set create mode, show modal.
- `add(model)`: set submitting, call create, `addEntity`, hide modal, increment `totalCount`, show `COMMON.SUCCESSFULLY_CREATED`.
- `updateDialog(user)`: set edit mode, show modal, set selected value.
- `update(model)`: call update, `updateEntity`, clear edit/modal/selection, show `COMMON.SUCCESSFULLY_UPDATED`.
- `delete({ id })`: optimistically `removeEntity(id)`, call delete, clear selection, decrement `totalCount`, show `COMMON.SUCCESSFULLY_DELETED`.
- `reset()`: clear modal/submitting/edit/loading/error.
- `selectedChange(value)`: set selected value.

Use `MessageService`, `TranslateService`, and `environment.default_toastKey` for success/error toasts. Reuse helper functions like `showErrorToast` and `getServerErrorMessage` to surface backend `message`, nested `error.en`, or nested `error.message`.

## Page Component

Use a standalone component named `UserManagePage` with selector `app-user-manage-page`. Import only the Angular, PrimeNG, pipes, and translate modules needed by the template.

Current imports include:

- Angular: `CommonModule`, `ReactiveFormsModule`, `FormsModule`.
- PrimeNG: `ButtonModule`, `SplitButtonModule`, `InputTextModule`, `InputIconModule`, `IconFieldModule`, `TableModule`, `DialogModule`, `ConfirmDialogModule`, `DatePickerModule`, `Message`, `PasswordModule`, `SelectModule`.
- Translation/date: `TranslatePipe`, `TranslateService`, `LocalDateTimePipe`, `parseServerUtcDate`, `toServerUtcIso`.

Inject `UserManageStore`, `FormBuilder`, `TranslateService`, `DestroyRef`, `DepartmentService`, `ConfirmationService`, and `MessageService` as needed.

Form controls:

- `userName`: required, max 256.
- `email`: required, email, max 256.
- `password`: min 6; required only in create mode.
- `confirmPassword`: min 6; required and must match only in create mode.
- `roleName`: required, max 256.
- `department`: max 50.
- `fullName`: max 256.
- `phoneNumber`: max 50.
- `joinDate`: `Date | null`.

Page behavior:

- `ngOnInit`: load split-button menu, refresh menu labels on language changes, load departments, then load users.
- `loadDepartments`: call departments service with `{ page: 1, take: 100 }`, keep only `status === 'ACTIVE'`, map department names to PrimeNG select options.
- `create`: set password required, reset form, open create dialog through store.
- `update`: require selected row, disable password required, open update dialog, patch form from selected value, parse `joinDate`.
- `delete`: require selected row, use `ConfirmationService.confirm`, and call store delete from `accept`.
- `submit`: validate confirm password, mark invalid controls dirty, convert blank optional strings to `null`, convert date with `toServerUtcIso`, then call store `add` or `update`.
- `onLazyLoad`: calculate page as `Math.floor(first / rows) + 1` and call store `loadAll`.
- `search`: reset to page 1 and pass current take.
- `onDialogHide`: reset store and clear selection.

## Template

Use the existing PrimeNG layout style:

- Wrap table in `.table-card`.
- Use `p-table` with lazy pagination, single selection, `dataKey="id"`, rows-per-page options `[10, 20, 30, 50, 100]`, and `paginatorDropdownAppendTo="body"`.
- Use caption with `p-splitbutton` for create/edit/delete and `p-iconfield` search input that searches on Enter.
- Use translated table headers and `p-sortIcon` where appropriate.
- Use `localDateTime` for `joinDate`.
- Use `p-dialog` with responsive breakpoints and a reactive form.
- Use PrimeNG `p-message` validation messages and Angular control-flow `@if`.
- Hide password and confirm-password fields while editing.
- Use `p-confirmDialog` with a feature-specific key.

## Routing And Menu

Feature route:

```ts
import { Routes } from '@angular/router';
import { UserManagePage } from './pages/pages';

export default [
  {
    path: '',
    component: UserManagePage,
    data: { title: 'MENU.MANAGEMENT.USER_MANAGE' },
  },
] as Routes;
```

App route:

```ts
{
  path: 'user-manage',
  loadChildren: () => import('./features/user-manage/user-manage.routes'),
  canActivate: [AuthGuardService],
}
```

Menu entry:

```ts
{
  label: 'MENU.MANAGEMENT.USER_MANAGE',
  icon: 'pi pi-fw pi-users',
  routerLink: ['/user-manage'],
}
```

## Translation Keys

Use the existing key style:

- Menu/title: `MENU.MANAGEMENT.USER_MANAGE`.
- Feature namespace: `USER_MANAGE`.
- Common actions/status: `COMMON.CREATE`, `COMMON.EDIT`, `COMMON.DELETE`, `COMMON.SAVE`, `COMMON.UPDATE`, `COMMON.SUCCESS`, `COMMON.ERROR`, `COMMON.WARNING`.
- Success messages: `COMMON.SUCCESSFULLY_CREATED`, `COMMON.SUCCESSFULLY_UPDATED`, `COMMON.SUCCESSFULLY_DELETED`.
- Feature errors/warnings: `FAILED_TO_LOAD_USERS`, `FAILED_TO_CREATE_USER`, `FAILED_TO_UPDATE_USER`, `FAILED_TO_DELETE_USER`, `FAILED_TO_LOAD_DEPARTMENTS`, `PLEASE_CHOOSE_USER`.
- Field labels/placeholders/validation keys should mirror the current template naming: `USER_NAME`, `ENTER_USER_NAME`, `USER_NAME_REQUIRED`, `USER_NAME_MAX_LENGTH`, and so on.
