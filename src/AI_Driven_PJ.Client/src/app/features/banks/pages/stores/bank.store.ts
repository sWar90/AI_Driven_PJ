import { computed, inject } from '@angular/core';
import {
  addEntity,
  removeEntity,
  SelectEntityId,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  BankModel,
  BankQueryParams,
  BankRequestModel,
  PagedResultModel,
} from '../models/bank';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { BankService } from '../services/bank.service';

export interface BanksState {
  selectedValue: BankModel | null;
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
}

type BankUpdateModel = BankRequestModel & { bankId: number };

const initialState: BanksState = {
  selectedValue: null,
  isSubmitting: false,
  isModalVisible: false,
  isEdit: false,
  isLoading: false,
  error: null,
  page: 1,
  take: 20,
  search: '',
  sortField: 'bankName',
  sortOrder: 1,
  totalCount: 0,
  totalPages: 0,
};

const selectId: SelectEntityId<BankModel> = (bank) => bank.bankId;

export const BankStore = signalStore(
  { providedIn: 'root' },

  withEntities<BankModel>(),
  withState(initialState),

  withComputed((store) => ({
    totalItems: computed(() => store.entities().length),
    error$: () => store.error,
    getAll$: () => store.entities(),
    isModalVisible$: store.isModalVisible,
    selectedValue$: store.selectedValue,
    page$: store.page,
    take$: store.take,
    search$: store.search,
    sortField$: store.sortField,
    sortOrder$: store.sortOrder,
    totalCount$: store.totalCount,
    totalPages$: store.totalPages,
  })),

  withMethods(
    (
      store,
      bankService = inject(BankService),
      messageService = inject(MessageService),
      translateService = inject(TranslateService),
    ) => ({
      loadAll: rxMethod<Partial<BankQueryParams> | void>(
        pipe(
          tap((queryParams) => {
            patchState(store, {
              page: queryParams?.page ?? store.page(),
              take: queryParams?.take ?? store.take(),
              search: queryParams?.search ?? store.search(),
              sortField: queryParams?.sortField ?? store.sortField(),
              sortOrder: queryParams?.sortOrder ?? store.sortOrder(),
              isLoading: true,
              error: null,
            });
          }),
          switchMap(() =>
            bankService
              .get({
                page: store.page(),
                take: store.take(),
                search: store.search(),
                sortField: store.sortField(),
                sortOrder: store.sortOrder(),
              })
              .pipe(
                tap((res) => {
                  const result = res.data as PagedResultModel<BankModel>;
                  patchState(store, setAllEntities(result?.items ?? [], { selectId }));
                  patchState(store, {
                    totalCount: result?.totalCount ?? 0,
                    totalPages: result?.totalPages ?? 0,
                    isLoading: false,
                  });
                }),
                catchError((error) => {
                  console.error('Error loading banks:', error);
                  patchState(store, {
                    isLoading: false,
                    error: 'Failed to load banks.',
                  });
                  showErrorToast(
                    messageService,
                    translateService,
                    'BANKS.FAILED_TO_LOAD_BANKS',
                    error,
                  );
                  return of(null);
                }),
              ),
          ),
        ),
      ),

      createDialog: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, {
              selectedValue: null,
              isEdit: false,
              isModalVisible: true,
            }),
          ),
        ),
      ),

      add: rxMethod<BankRequestModel>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true, error: null })),
          switchMap((bank) =>
            bankService.create(bank).pipe(
              tap((res) => {
                const created = res.data as BankModel;
                patchState(store, addEntity(created, { selectId }));
                patchState(store, {
                  isSubmitting: false,
                  isModalVisible: false,
                  totalCount: store.totalCount() + 1,
                });
                messageService.add({
                  key: environment.default_toastKey,
                  severity: 'success',
                  summary: translateService.instant('COMMON.SUCCESS'),
                  detail: translateService.instant('COMMON.SUCCESSFULLY_CREATED'),
                });
              }),
              catchError((error) => {
                console.error('Error adding bank:', error);
                patchState(store, {
                  isSubmitting: false,
                  isModalVisible: false,
                  error: 'Failed to create bank.',
                });
                showErrorToast(
                  messageService,
                  translateService,
                  'BANKS.FAILED_TO_CREATE_BANK',
                  error,
                );
                return of(null);
              }),
            ),
          ),
        ),
      ),

      updateDialog: rxMethod<BankModel>(
        pipe(
          tap((bank) =>
            patchState(store, {
              isEdit: true,
              isModalVisible: true,
              selectedValue: bank,
            }),
          ),
        ),
      ),

      update: rxMethod<BankUpdateModel>(
        pipe(
          tap(() => patchState(store, { isSubmitting: true, error: null })),
          switchMap((bank) =>
            bankService
              .update(bank.bankId, {
                bankName: bank.bankName,
                bankCode: bank.bankCode,
                status: bank.status,
              })
              .pipe(
                tap((res) => {
                  const updated = res.data as BankModel;
                  patchState(
                    store,
                    updateEntity(
                      {
                        id: updated.bankId,
                        changes: { ...updated },
                      },
                      { selectId },
                    ),
                  );
                  patchState(store, {
                    isSubmitting: false,
                    isEdit: false,
                    isModalVisible: false,
                    selectedValue: null,
                    error: null,
                  });
                  messageService.add({
                    key: environment.default_toastKey,
                    severity: 'success',
                    summary: translateService.instant('COMMON.SUCCESS'),
                    detail: translateService.instant('COMMON.SUCCESSFULLY_UPDATED'),
                  });
                }),
                catchError((error) => {
                  console.error('Error updating bank:', error);
                  patchState(store, {
                    isEdit: false,
                    isSubmitting: false,
                    isModalVisible: false,
                    error: 'Failed to update bank.',
                  });
                  showErrorToast(
                    messageService,
                    translateService,
                    'BANKS.FAILED_TO_UPDATE_BANK',
                    error,
                  );
                  return of(null);
                }),
              ),
          ),
        ),
      ),

      delete: rxMethod<{ bankId: number }>(
        pipe(
          tap((bank) => patchState(store, removeEntity(bank.bankId))),
          switchMap((bank) =>
            bankService.delete(bank.bankId).pipe(
              tap((res) => {
                patchState(store, {
                  selectedValue: null,
                  error: null,
                  totalCount: Math.max(store.totalCount() - 1, 0),
                });
                messageService.add({
                  key: environment.default_toastKey,
                  severity: 'success',
                  summary: translateService.instant('COMMON.SUCCESS'),
                  detail: translateService.instant('COMMON.SUCCESSFULLY_DELETED'),
                });
              }),
              catchError((error) => {
                console.error('Error deleting bank:', error);
                patchState(store, { error: 'Failed to delete bank.' });
                showErrorToast(
                  messageService,
                  translateService,
                  'BANKS.FAILED_TO_DELETE_BANK',
                  error,
                );
                return of(null);
              }),
            ),
          ),
        ),
      ),

      reset: rxMethod<void>(
        tap(() =>
          patchState(store, {
            isSubmitting: false,
            isModalVisible: false,
            isEdit: false,
            isLoading: false,
            error: null,
          }),
        ),
      ),

      selectedChange: rxMethod<BankModel | null>(
        switchMap((value) => {
          patchState(store, { selectedValue: value });
          return of(null);
        }),
      ),
    }),
  ),
);

function showErrorToast(
  messageService: MessageService,
  translateService: TranslateService,
  detailKey: string,
  error: unknown,
): void {
  const serverMessage = getServerErrorMessage(error);
  const actionMessage = translateService.instant(detailKey);

  messageService.add({
    key: environment.default_toastKey,
    severity: 'error',
    summary: translateService.instant('COMMON.ERROR'),
    detail: serverMessage ? `${actionMessage} ${serverMessage}` : actionMessage,
  });
}

function getServerErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('error' in error)) {
    return null;
  }

  const body = (error as { error?: unknown }).error;

  if (!body || typeof body !== 'object') {
    return typeof body === 'string' ? body : null;
  }

  const record = body as Record<string, unknown>;
  const nestedError = record['error'];
  const message = record['message'];

  if (typeof message === 'string') {
    return message;
  }

  if (nestedError && typeof nestedError === 'object') {
    const nestedRecord = nestedError as Record<string, unknown>;
    const englishMessage = nestedRecord['en'];
    const nestedMessage = nestedRecord['message'];

    if (typeof englishMessage === 'string') {
      return englishMessage;
    }

    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }
  }

  return null;
}
