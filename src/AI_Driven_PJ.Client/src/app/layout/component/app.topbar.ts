import { Component, computed, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '@shared/services/page-title.service';
import { AuthService } from '@core/auth/services/auth.service';
import { SharedService } from '@shared_services/shared.service';
import { environment } from '@env/environment';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { Message } from 'primeng/message';
import { Subject, takeUntil } from 'rxjs';
import { AppConfigurator } from './app.configurator';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, TranslatePipe, ReactiveFormsModule, DialogModule, ButtonModule, PasswordModule, Message, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <span>AI Driven</span>
            </a>
        </div>
        <nav class="layout-topbar-breadcrumbs" aria-label="Breadcrumb">
            <i class="pi pi-home"></i>
            <span>/</span>
            <span>{{ (pageTitleService.title$ | async) | translate }}</span>
        </nav>

        <div class="layout-topbar-actions">
            <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
            </button>

            <div class="layout-config-switcher">
                <button
                    type="button"
                    class="layout-topbar-action layout-topbar-action-highlight"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                    aria-label="Theme colors"
                >
                    <i class="pi pi-palette"></i>
                </button>
                <app-configurator />
            </div>

            <div class="layout-account-switcher" (click)="$event.stopPropagation()">
                <button type="button" class="layout-topbar-profile" (click)="toggleAccountMenu()" aria-haspopup="menu" [attr.aria-expanded]="isAccountMenuOpen" aria-label="Account menu">
                    <i class="pi pi-user"></i>
                </button>
                @if (isAccountMenuOpen) {
                    <div class="layout-account-dropdown" role="menu">
                        <div class="layout-account-header">
                            <span class="layout-profile-avatar">{{ userInitial() }}</span>
                            <span class="layout-profile-meta">
                                <span class="layout-profile-name">{{ sharedService.getUserName() }}</span>
                                <span class="layout-profile-email">{{ sharedService.getUserRole() }}</span>
                            </span>
                        </div>
                        <div class="layout-account-language" aria-label="Language">
                            @for (language of languages; track language.code) {
                                <button type="button" [class.active-language]="language.code === currentLang()" (click)="switchLanguage(language.code)">
                                    <img [src]="language.flag" [alt]="language.label" />
                                    <span>{{ language.label }}</span>
                                </button>
                            }
                        </div>
                        <div class="layout-account-menu">
                            <button type="button" role="menuitem" (click)="openProfileDialog()">
                                <i class="pi pi-user"></i>
                                <span>Account</span>
                            </button>
                            <button type="button" role="menuitem" (click)="openChangePasswordDialog()">
                                <i class="pi pi-lock"></i>
                                <span>Change Password</span>
                            </button>
                            <button type="button" role="menuitem" class="layout-account-logout" (click)="logout()">
                                <i class="pi pi-sign-out"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                }
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>
        </div>
    </div>

    <p-dialog
        header="Change Password"
        [(visible)]="isChangePasswordVisible"
        maskStyleClass="backdrop-blur-sm"
        [breakpoints]="{ '960px': '75vw', '640px': '95vw' }"
        [modal]="true"
        [style]="{ width: '30rem' }"
        [draggable]="false"
        [resizable]="false"
        (onHide)="resetChangePasswordForm()"
    >
        <form [formGroup]="changePasswordForm" (submit)="submitChangePassword()">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="oldPassword">Old Password</label>
                    <p-password
                        id="oldPassword"
                        formControlName="oldPassword"
                        [toggleMask]="true"
                        [feedback]="false"
                        inputStyleClass="w-full"
                        styleClass="w-full"
                        placeholder="Enter Old Password..."
                        autocomplete="current-password"
                    />
                    @if (changePasswordForm.get('oldPassword')?.hasError('required') && changePasswordForm.get('oldPassword')?.dirty) {
                        <p-message severity="error" size="small" variant="simple">Old Password is required.</p-message>
                    }
                </div>

                <div class="flex flex-col gap-2">
                    <label for="newPassword">New Password</label>
                    <p-password
                        id="newPassword"
                        formControlName="newPassword"
                        [toggleMask]="true"
                        [feedback]="false"
                        inputStyleClass="w-full"
                        styleClass="w-full"
                        placeholder="Enter New Password..."
                        autocomplete="new-password"
                    />
                    @if (changePasswordForm.get('newPassword')?.hasError('required') && changePasswordForm.get('newPassword')?.dirty) {
                        <p-message severity="error" size="small" variant="simple">New Password is required.</p-message>
                    }
                    @if (changePasswordForm.get('newPassword')?.hasError('minlength') && changePasswordForm.get('newPassword')?.dirty) {
                        <p-message severity="error" size="small" variant="simple">New Password must be at least 6 characters.</p-message>
                    }
                </div>

                <div class="flex flex-col gap-2">
                    <label for="confirmPassword">Confirm Password</label>
                    <p-password
                        id="confirmPassword"
                        formControlName="confirmPassword"
                        [toggleMask]="true"
                        [feedback]="false"
                        inputStyleClass="w-full"
                        styleClass="w-full"
                        placeholder="Enter Confirm Password..."
                        autocomplete="new-password"
                    />
                    @if (changePasswordForm.get('confirmPassword')?.hasError('required') && changePasswordForm.get('confirmPassword')?.dirty) {
                        <p-message severity="error" size="small" variant="simple">Confirm Password is required.</p-message>
                    }
                    @if (changePasswordForm.hasError('passwordMismatch') && changePasswordForm.get('confirmPassword')?.dirty) {
                        <p-message severity="error" size="small" variant="simple">Password and Confirm Password must match.</p-message>
                    }
                </div>

                <div class="flex justify-end gap-2">
                    <p-button label="Cancel" severity="secondary" [outlined]="true" type="button" (onClick)="isChangePasswordVisible = false"></p-button>
                    <p-button icon="pi pi-check" label="Update" type="submit" [loading]="isChangingPassword"></p-button>
                </div>
            </div>
        </form>
    </p-dialog>

    <p-dialog
        header="Personal Information"
        [(visible)]="isProfileVisible"
        styleClass="profile-detail-dialog"
        maskStyleClass="backdrop-blur-sm"
        [breakpoints]="{ '960px': '75vw', '640px': '95vw' }"
        [modal]="true"
        [style]="{ width: '34rem' }"
        [draggable]="false"
        [resizable]="false"
    >
        @if (isProfileLoading) {
            <div class="profile-loading">Loading...</div>
        } @else {
            <div class="profile-detail">
                <div class="profile-detail-header">
                    <span class="profile-detail-avatar">
                        {{ displayProfileValue(profile?.username).charAt(0).toUpperCase() }}
                    </span>
                    <div class="profile-detail-title">
                        <div class="profile-detail-name">{{ displayProfileValue(profile?.fullName || profile?.username) }}</div>
                        <div class="profile-detail-subtitle">
                            <i class="pi pi-shield"></i>
                            <span>{{ displayProfileValue(profile?.roleName) }}</span>
                        </div>
                    </div>
                </div>

                <div class="profile-detail-grid">
                    <div class="profile-detail-item">
                        <span class="profile-detail-icon"><i class="pi pi-user"></i></span>
                        <span class="profile-detail-label">User Name</span>
                        <span class="profile-detail-value">{{ displayProfileValue(profile?.username) }}</span>
                    </div>
                    <div class="profile-detail-item">
                        <span class="profile-detail-icon"><i class="pi pi-envelope"></i></span>
                        <span class="profile-detail-label">Email</span>
                        <span class="profile-detail-value">{{ displayProfileValue(profile?.email) }}</span>
                    </div>
                    <div class="profile-detail-item">
                        <span class="profile-detail-icon"><i class="pi pi-phone"></i></span>
                        <span class="profile-detail-label">Phone Number</span>
                        <span class="profile-detail-value">{{ displayProfileValue(profile?.phoneNumber) }}</span>
                    </div>
                    <div class="profile-detail-item">
                        <span class="profile-detail-icon"><i class="pi pi-building"></i></span>
                        <span class="profile-detail-label">Department</span>
                        <span class="profile-detail-value">{{ displayProfileValue(profile?.department) }}</span>
                    </div>
                    <div class="profile-detail-item profile-detail-item-wide">
                        <span class="profile-detail-icon"><i class="pi pi-calendar"></i></span>
                        <span class="profile-detail-label">Join Date</span>
                        <span class="profile-detail-value">{{ formatProfileDate(profile?.joinDate) }}</span>
                    </div>
                </div>
            </div>
        }
    </p-dialog>`,
    styles: [
        `
            :host ::ng-deep .profile-detail-dialog .p-dialog-content {
                padding-top: 0.25rem;
            }

            .profile-loading {
                padding: 2rem 0;
                color: var(--text-color-secondary);
                text-align: center;
            }

            .profile-detail {
                display: flex;
                flex-direction: column;
                gap: 1.25rem;
            }

            .profile-detail-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 1px solid var(--layout-panel-border);
                border-radius: 0.5rem;
                background: var(--layout-menu-hover-background);
            }

            .profile-detail-avatar {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                width: 3.5rem;
                height: 3.5rem;
                border-radius: 50%;
                color: #ffffff;
                background: #ff6d1f;
                font-size: 1.35rem;
                font-weight: 800;
            }

            .profile-detail-title {
                min-width: 0;
            }

            .profile-detail-name {
                overflow-wrap: anywhere;
                color: var(--text-color);
                font-size: 1.15rem;
                font-weight: 800;
                line-height: 1.25;
            }

            .profile-detail-subtitle {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                margin-top: 0.35rem;
                color: var(--text-color-secondary);
                font-size: 0.88rem;
                font-weight: 700;
            }

            .profile-detail-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.75rem;
            }

            .profile-detail-item {
                display: grid;
                grid-template-columns: 2rem minmax(0, 1fr);
                gap: 0.15rem 0.7rem;
                min-width: 0;
                padding: 0.85rem;
                border: 1px solid var(--layout-panel-border);
                border-radius: 0.5rem;
                background: var(--layout-panel-background);
            }

            .profile-detail-item-wide {
                grid-column: 1 / -1;
            }

            .profile-detail-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                grid-row: span 2;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                color: #ff6d1f;
                background: rgba(255, 109, 31, 0.12);
            }

            .profile-detail-label {
                color: var(--text-color-secondary);
                font-size: 0.78rem;
                font-weight: 700;
            }

            .profile-detail-value {
                overflow-wrap: anywhere;
                color: var(--text-color);
                font-weight: 800;
                line-height: 1.35;
            }

            @media (max-width: 640px) {
                .profile-detail-grid {
                    grid-template-columns: 1fr;
                }
            }
        `
    ]
})
export class AppTopbar implements OnDestroy {
    items!: MenuItem[];

    layoutService = inject(LayoutService);
    pageTitleService = inject(PageTitleService);
    sharedService = inject(SharedService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private translateService = inject(TranslateService);
    private formBuilder = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    languages = [
        { code: 'en', label: 'English', flag: 'assets/flags/en.svg' },
        { code: 'mm', label: 'မြန်မာ', flag: 'assets/flags/mm.svg' }
    ];

    currentLang = signal(window.localStorage.getItem('lang') || 'en');

    currentLanguage = computed(() => this.languages.find((language) => language.code === this.currentLang()) ?? this.languages[0]);

    isChangePasswordVisible = false;
    isChangingPassword = false;
    isProfileVisible = false;
    isProfileLoading = false;
    isAccountMenuOpen = false;
    profile: {
        id?: string;
        username?: string;
        email?: string;
        phoneNumber?: string;
        roleName?: string;
        fullName?: string;
        joinDate?: string;
        department?: string;
    } | null = null;

    changePasswordForm = this.formBuilder.group(
        {
            oldPassword: ['', { validators: [Validators.required] }],
            newPassword: ['', { validators: [Validators.required, Validators.minLength(6)] }],
            confirmPassword: ['', { validators: [Validators.required] }]
        },
        {
            validators: (control) => {
                const newPassword = control.get('newPassword')?.value;
                const confirmPassword = control.get('confirmPassword')?.value;

                return newPassword && confirmPassword && newPassword !== confirmPassword
                    ? { passwordMismatch: true }
                    : null;
            }
        }
    );

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('document:click')
    closeAccountMenu(): void {
        this.isAccountMenuOpen = false;
    }

    switchLanguage(lang: string) {
        this.currentLang.set(lang);
        window.localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
        this.translateService.use(lang).subscribe(() => {
            this.isAccountMenuOpen = false;
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    userInitial(): string {
        return this.sharedService.getUserName()?.charAt(0)?.toUpperCase() || 'U';
    }

    toggleAccountMenu(): void {
        this.isAccountMenuOpen = !this.isAccountMenuOpen;
    }

    openChangePasswordDialog(): void {
        this.isAccountMenuOpen = false;
        this.isChangePasswordVisible = true;
    }

    openProfileDialog(): void {
        this.isAccountMenuOpen = false;
        this.isProfileVisible = true;
        this.loadProfile();
    }

    loadProfile(): void {
        this.isProfileLoading = true;

        this.authService
            .profile()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.profile = res.data;
                    }
                },
                error: () => {
                    this.isProfileLoading = false;
                },
                complete: () => {
                    this.isProfileLoading = false;
                }
            });
    }

    submitChangePassword(): void {
        if (this.changePasswordForm.invalid) {
            Object.values(this.changePasswordForm.controls).forEach((control) => {
                control.markAsDirty({ onlySelf: true });
            });
            return;
        }

        const model = this.changePasswordForm.getRawValue();
        this.isChangingPassword = true;

        this.authService
            .changePassword(
                model.oldPassword ?? '',
                model.newPassword ?? '',
                model.confirmPassword ?? ''
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.isChangePasswordVisible = false;
                        this.messageService.add({
                            key: environment.default_toastKey,
                            severity: 'success',
                            summary: 'Success',
                            detail: res.message ?? 'Successfully Updated'
                        });
                        this.authService.logoutForce();
                        this.router.navigate(['/auth/login']);
                    }
                },
                error: () => {
                    this.isChangingPassword = false;
                },
                complete: () => {
                    this.isChangingPassword = false;
                }
            });
    }

    resetChangePasswordForm(): void {
        this.changePasswordForm.reset();
        this.isChangingPassword = false;
    }

    displayProfileValue(value: string | null | undefined): string {
        return value?.trim() || '-';
    }

    formatProfileDate(value: string | null | undefined): string {
        if (!value) {
            return '-';
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
    }

    logout() {
        this.isAccountMenuOpen = false;
        this.authService.logoutForce();
        this.router.navigate(['/auth/login']);
    }
}
