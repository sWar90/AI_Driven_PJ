import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, HostListener, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankModel, BankStatus } from './models/bank';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LocalDateTimePipe } from '@/app/shared/pipes/local-date-time.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { BankStore } from './stores/bank.store';
import { ExportService } from '@shared_services/export.service';

interface StatusOption {
  label: string;
  value: BankStatus;
}

@Component({
  selector: 'app-bank-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    Message,
    SelectModule,
    TagModule,
    ToggleSwitchModule,
    TranslatePipe,
    LocalDateTimePipe,
  ],
  providers: [ConfirmationService, DatePipe, ExportService],
  templateUrl: './pages.html',
  styleUrls: ['./pages.scss'],
})
export class BankPage implements OnInit {
  bankStore$ = inject(BankStore);

  selectedValue: BankModel | null = null;
  items: MenuItem[] = [];
  statusOptions: StatusOption[] = [];
  isModalVisible = false;
  isActionMenuOpen = false;

  private formBuilder = inject(FormBuilder);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private exportService = inject(ExportService);

  bankForm = this.formBuilder.group({
    bankName: ['', { validators: [Validators.required, Validators.maxLength(150)] }],
    bankCode: ['', { validators: [Validators.required, Validators.maxLength(10)] }],
    status: ['ACTIVE' as BankStatus, { validators: [Validators.required] }],
  });

  get banks(): BankModel[] {
    return this.bankStore$.getAll$();
  }

  get page(): number {
    return this.bankStore$.page$();
  }

  get take(): number {
    return this.bankStore$.take$();
  }

  get sortField(): string {
    return this.bankStore$.sortField$();
  }

  get sortOrder(): number {
    return this.bankStore$.sortOrder$();
  }

  get totalCount(): number {
    return this.bankStore$.totalCount$();
  }

  get isLoading(): boolean {
    return this.bankStore$.isLoading();
  }

  get isEdit(): boolean {
    return this.bankStore$.isEdit();
  }

  get isSubmitting(): boolean {
    return this.bankStore$.isSubmitting();
  }

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    effect(() => {
      this.selectedValue = this.bankStore$.selectedValue$();
      this.isModalVisible = this.bankStore$.isModalVisible$();
    });
  }

  ngOnInit(): void {
    this.loadMenu();
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMenu());
    this.bankStore$.loadAll();
  }

  loadMenu(): void {
    this.items = [
      {
        label: this.translateService.instant('COMMON.EDIT'),
        icon: 'pi pi-pen-to-square',
        command: () => this.update(),
      },
      {
        label: this.translateService.instant('COMMON.DELETE'),
        icon: 'pi pi-trash',
        command: () => this.delete(),
      },
    ];
    this.statusOptions = [
      {
        label: this.translateService.instant('COMMON.ACTIVE'),
        value: 'ACTIVE',
      },
      {
        label: this.translateService.instant('COMMON.INACTIVE'),
        value: 'INACTIVE',
      },
    ];
  }

  @HostListener('document:click')
  closeActionMenu(): void {
    this.isActionMenuOpen = false;
  }

  toggleActionMenu(): void {
    this.isActionMenuOpen = !this.isActionMenuOpen;
  }

  create(): void {
    this.isActionMenuOpen = false;
    this.selectedValue = null;
    this.bankForm.reset({ status: 'ACTIVE' });
    this.isModalVisible = true;
    this.bankStore$.createDialog();
  }

  update(): void {
    this.isActionMenuOpen = false;

    if (this.selectedValue) {
      this.bankForm.reset({
        bankName: this.selectedValue.bankName,
        bankCode: this.selectedValue.bankCode,
        status: this.selectedValue.status,
      });
      this.isModalVisible = true;
      this.bankStore$.updateDialog(this.selectedValue);
      return;
    }

    this.messageService.add({
      key: 'globalMessage',
      severity: 'warn',
      summary: this.translateService.instant('COMMON.WARNING'),
      detail: this.translateService.instant('BANKS.PLEASE_CHOOSE_BANK'),
    });
  }

  delete(): void {
    this.isActionMenuOpen = false;

    if (this.selectedValue) {
      this.confirmationService.confirm({
        message: this.translateService.instant('COMMON.DELETE_CONFIRMATION_MESSAGE'),
        header: this.translateService.instant('COMMON.DELETE_CONFIRMATION'),
        icon: 'pi pi-info-circle',
        accept: () => this.bankStore$.delete({ bankId: this.selectedValue!.bankId }),
        reject: () => this.bankStore$.selectedChange(null),
        key: 'bankDeleteDialog',
      });
      return;
    }

    this.messageService.add({
      key: 'globalMessage',
      severity: 'warn',
      summary: this.translateService.instant('COMMON.WARNING'),
      detail: this.translateService.instant('BANKS.PLEASE_CHOOSE_BANK'),
    });
  }

  submit(): void {
    if (this.bankForm.invalid) {
      Object.values(this.bankForm.controls).forEach((control) => {
        control.markAsDirty({ onlySelf: true });
      });
      return;
    }

    const model = this.bankForm.getRawValue();
    const status = model.status ?? 'ACTIVE';

    if (this.bankStore$.isEdit()) {
      const bankId = this.bankStore$.selectedValue$()?.bankId;
      if (bankId) {
        this.bankStore$.update({
          bankId,
          bankName: model.bankName ?? '',
          bankCode: model.bankCode ?? '',
          status,
        });
      }
      return;
    }

    this.bankStore$.add({
      bankName: model.bankName ?? '',
      bankCode: model.bankCode ?? '',
      status,
    });
  }

  getStatusSeverity(status: BankStatus): 'success' | 'secondary' {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.bankStore$.take$();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;
    const sortField = this.getSortField(event.sortField);

    this.bankStore$.loadAll({
      page,
      take: rows,
      search: this.bankStore$.search$(),
      sortField,
      sortOrder: event.sortOrder ?? this.bankStore$.sortOrder$(),
    });
  }

  search(value: string): void {
    this.bankStore$.loadAll({
      page: 1,
      take: this.bankStore$.take$(),
      search: value,
      sortField: this.bankStore$.sortField$(),
      sortOrder: this.bankStore$.sortOrder$(),
    });
  }

  exportExcel(): void {
    this.isActionMenuOpen = false;

    const rows = this.bankStore$.getAll$().map((bank, index) => ({
      no: index + 1,
      bankId: bank.bankId,
      bankName: bank.bankName,
      bankCode: bank.bankCode,
      status: this.translateService.instant(`COMMON.${bank.status}`),
      createdAt: bank.createdAt,
      createdBy: bank.createdBy,
      updatedAt: bank.updatedAt ?? '',
      updatedBy: bank.updatedBy ?? '',
    }));

    this.exportService.exportSelectColsWithDynamicHeader(
      rows,
      [
        { key: 'no', value: '#' },
        { key: 'bankId', value: this.translateService.instant('COMMON.ID') },
        { key: 'bankName', value: this.translateService.instant('BANKS.BANK_NAME') },
        { key: 'bankCode', value: this.translateService.instant('BANKS.BANK_CODE') },
        { key: 'status', value: this.translateService.instant('COMMON.STATUS') },
        { key: 'createdAt', value: this.translateService.instant('COMMON.CREATED_AT') },
        { key: 'createdBy', value: this.translateService.instant('COMMON.CREATED_BY') },
        { key: 'updatedAt', value: this.translateService.instant('COMMON.UPDATED_AT') },
        { key: 'updatedBy', value: this.translateService.instant('COMMON.UPDATED_BY') },
      ],
      this.translateService.instant('BANKS.BANK'),
    );
  }

  onSelectionChange(value: BankModel | null): void {
    this.bankStore$.selectedChange(value);
  }

  onDialogHide(): void {
    this.isModalVisible = false;
    this.bankStore$.reset();
    this.selectedValue = null;
    this.bankStore$.selectedChange(null);
  }
  private getSortField(sortField: string | string[] | null | undefined): string {
    if (Array.isArray(sortField)) {
      return sortField[0] ?? this.bankStore$.sortField$();
    }

    return sortField ?? this.bankStore$.sortField$();
  }
}
