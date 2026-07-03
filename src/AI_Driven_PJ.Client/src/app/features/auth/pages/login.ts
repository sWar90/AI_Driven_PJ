import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/auth/services/auth.service';
import { RootModel } from '@core/models/root.model';
import { SharedService } from '@shared/services/shared.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, FormsModule, RouterModule, RippleModule, StyleClassModule, TranslatePipe],
  template: `
        <div class="login-page">
            <div class="login-actions">
                <button type="button" class="login-round-action" (click)="toggleDarkMode()" aria-label="Toggle dark mode">
                    <i [class]="themeIconClass()"></i>
                </button>
                <div class="login-language-switcher">
                    <button type="button" class="login-round-action login-language-trigger" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true" aria-label="Change language">
                        <i class="pi pi-language"></i>
                    </button>
                    <div class="login-language-menu hidden">
                        @for (language of languages; track language.code) {
                            <button type="button" [class.active-language]="language.code === currentLang()" (click)="switchLanguage(language.code)">
                                <img [src]="language.flag" [alt]="language.label" />
                                <span>{{ language.label }}</span>
                            </button>
                        }
                    </div>
                </div>
            </div>

            <main class="login-card" aria-label="Login form">
                <header class="login-header">
                    <h1>AI Driven</h1>
                    <p>{{ 'SIGN_IN_TO_CONTINUE' | translate }}</p>
                </header>

                <form class="login-form">
                    <label for="email1">{{ 'EMAIL_OR_USERNAME' | translate }}</label>
                    <span class="login-input-wrap">
                        <i class="pi pi-user"></i>
                        <input pInputText id="email1" name="email" type="text" autocomplete="username" [(ngModel)]="username" [placeholder]="'ENTER_EMAIL_OR_USERNAME' | translate" />
                    </span>

                    <label for="password1">{{ 'PASSWORD' | translate }}</label>
                    <span class="login-input-wrap">
                        <i class="pi pi-lock"></i>
                        <input pInputText id="password1" name="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password" [(ngModel)]="password" [placeholder]="'ENTER_PASSWORD' | translate" />
                        <button type="button" class="login-password-toggle" (click)="showPassword.set(!showPassword())" aria-label="Toggle password visibility">
                            <i [class]="passwordIconClass()"></i>
                        </button>
                    </span>

                    <div class="login-options">
                        <div class="login-remember">
                            <p-checkbox [(ngModel)]="checked" inputId="rememberme1" name="remember" binary />
                            <label for="rememberme1">{{ 'REMEMBER_ME' | translate }}</label>
                        </div>
                        <button type="button" class="login-forgot">{{ 'FORGOT_PASSWORD' | translate }}</button>
                    </div>

                    <button pButton pRipple type="button" severity="secondary" class="login-submit" (click)="login()" [loading]="loading">
                        <span pButtonLabel>{{ 'SIGN_IN' | translate }}</span>
                    </button>
                </form>

                <footer><span>AI Driven @2026</span></footer>
            </main>
        </div>
    `,
  styles: [
    `
            :host {
                display: block;
            }

            .login-page {
                position: relative;
                display: grid;
                min-height: 100vh;
                place-items: center;
                overflow: hidden;
                padding: 1.25rem;
                background: linear-gradient(135deg, rgba(255, 109, 31, 0.1), #f4f4f3 42%);
            }

            :host-context(.app-dark) .login-page {
                background: #171717;
            }

            .login-actions {
                position: fixed;
                top: 2.25rem;
                right: 2rem;
                z-index: 10;
                display: flex;
                gap: 0.75rem;
            }

            .login-round-action {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 2.65rem;
                height: 2.65rem;
                border: 1px solid var(--layout-panel-border);
                border-radius: 50%;
                color: var(--text-color);
                background: var(--layout-panel-background);
                cursor: pointer;
            }

            .login-language-trigger {
                color: #ffffff;
                background: #ff6d1f;
                border-color: #ff6d1f;
            }

            .login-language-switcher {
                position: relative;
            }

            .login-language-menu {
                position: absolute;
                top: calc(100% + 0.5rem);
                right: 0;
                min-width: 10rem;
                padding: 0.35rem;
                border: 1px solid var(--layout-panel-border);
                border-radius: 0.5rem;
                background: var(--layout-panel-solid-background);
                z-index: 20;
            }

            .login-language-menu button {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                width: 100%;
                padding: 0.65rem 0.75rem;
                border: 1px solid transparent;
                border-radius: 0.35rem;
                color: var(--text-color);
                background: transparent;
                cursor: pointer;
                text-align: left;
            }

            .login-language-menu button:hover,
            .login-language-menu .active-language {
                background: var(--layout-menu-hover-background);
                border-color: var(--layout-menu-hover-border);
            }

            .login-language-menu img {
                width: 1.35rem;
                height: 1.35rem;
                border-radius: 50%;
                object-fit: cover;
            }

            .login-card {
                width: min(100%, 31.5rem);
                padding: 3.2rem 2.7rem 2.6rem;
                border: 1px solid rgba(34, 34, 34, 0.08);
                border-radius: 1.5rem;
                background: rgba(255, 255, 255, 0.97);
                box-shadow: 0 1.7rem 4rem rgba(34, 34, 34, 0.12);
            }

            :host-context(.app-dark) .login-card {
                border-color: rgba(255, 109, 31, 0.24);
                background: rgba(34, 34, 34, 0.94);
                box-shadow: 0 1.7rem 4rem rgba(0, 0, 0, 0.28);
            }

            .login-header {
                margin-bottom: 2.25rem;
                text-align: center;
            }

            .login-header h1 {
                margin: 0;
                color: #ff6d1f;
                font-size: 1.75rem;
                font-weight: 900;
                letter-spacing: 0;
                line-height: 1.1;
            }

            .login-header p {
                margin: 0.55rem 0 0;
                color: var(--text-color-secondary);
                font-size: 0.9rem;
            }

            .login-form {
                display: flex;
                flex-direction: column;
            }

            .login-form label {
                margin: 0 0 0.5rem;
                color: #222222;
                font-weight: 800;
                font-size: 0.9rem;
            }

            :host-context(.app-dark) .login-form label {
                color: #f8fafc;
            }

            .login-input-wrap {
                position: relative;
                display: flex;
                align-items: center;
                margin-bottom: 1.2rem;
            }

            .login-input-wrap > i {
                position: absolute;
                left: 1rem;
                color: rgba(34, 34, 34, 0.46);
                font-size: 1rem;
                z-index: 1;
            }

            .login-input-wrap input {
                width: 100%;
                height: 2.95rem;
                padding: 0 2.75rem 0 3.1rem;
                border-color: rgba(34, 34, 34, 0.12);
                border-radius: 0.75rem;
                color: #222222;
                background: #f5f5f4;
                font-weight: 700;
            }

            .login-input-wrap input:focus {
                border-color: #ff6d1f;
                box-shadow: 0 0 0 0.18rem rgba(255, 109, 31, 0.14);
            }

            :host-context(.app-dark) .login-input-wrap input {
                border-color: rgba(255, 255, 255, 0.12);
                color: #f8fafc;
                background: rgba(255, 255, 255, 0.06);
            }

            .login-password-toggle {
                position: absolute;
                right: 0.8rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 1.75rem;
                height: 1.75rem;
                border: 0;
                color: rgba(34, 34, 34, 0.46);
                background: transparent;
                cursor: pointer;
            }

            :host-context(.app-dark) .login-input-wrap > i,
            :host-context(.app-dark) .login-password-toggle {
                color: rgba(255, 255, 255, 0.58);
            }

            .login-options {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin: 0.1rem 0 1.65rem;
            }

            .login-remember {
                display: inline-flex;
                align-items: center;
                gap: 0.55rem;
                color: var(--text-color-secondary);
            }

            .login-remember label {
                margin: 0;
                color: inherit;
                font-weight: 500;
            }

            .login-forgot {
                border: 0;
                color: #ff6d1f;
                background: transparent;
                cursor: pointer;
                font-weight: 800;
            }

            .login-submit {
                justify-content: center;
                width: 100%;
                height: 3.05rem;
                border-color: #222222;
                border-radius: 0.75rem;
                background: #222222;
                color: #ffffff;
                font-weight: 800;
            }

            .login-submit:hover {
                border-color: #ff6d1f;
                background: #ff6d1f;
                color: #ffffff;
            }

            footer {
                margin-top: 1.8rem;
                color: rgba(34, 34, 34, 0.56);
                font-size: 0.78rem;
                font-weight: 600;
                letter-spacing: 0.04em;
                text-align: center;
            }

            footer span {
                color: #222222;
                font-weight: 900;
            }

            :host-context(.app-dark) footer,
            :host-context(.app-dark) footer span {
                color: rgba(255, 255, 255, 0.72);
            }

            @media (max-width: 576px) {
                .login-page {
                    padding: 1rem;
                }

                .login-actions {
                    top: 1rem;
                    right: 1rem;
                }

                .login-card {
                    padding: 3.3rem 1.5rem 2.6rem;
                    border-radius: 1.35rem;
                }

                .login-header h1 {
                    font-size: 1.6rem;
                }
            }
        `
  ]
})
export class Login {
  layoutService = inject(LayoutService);
  private translateService = inject(TranslateService);

  languages = [
    { code: 'en', label: 'English', flag: 'assets/flags/en.svg' },
    { code: 'mm', label: 'မြန်မာ', flag: 'assets/flags/mm.svg' }
  ];

  currentLang = signal(window.localStorage.getItem('lang') || 'en');
  currentLanguage = computed(() => this.languages.find((language) => language.code === this.currentLang()) ?? this.languages[0]);

  checked: boolean = true;

  showPassword = signal(false);
  themeIconClass = computed(() => this.layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun');
  passwordIconClass = computed(() => this.showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye');

  isRemberMeChecked: boolean = false;

  username!: string;
  password!: string;

  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    if (window.localStorage.getItem('remember-me') === 'remember') {
      this.isRemberMeChecked = true;
    }
  }

  rememberMeChange(event: any): void {
    this.isRemberMeChecked = event.target.checked;
    if (this.isRemberMeChecked) {
      window.localStorage.setItem('remember-me', 'remember');
    } else {
      window.localStorage.removeItem('remember-me');
    }
  }


  login(): void {
    if (this.isRemberMeChecked)
      window.localStorage.setItem(
        'remember-me',
        this.isRemberMeChecked ? 'remember' : '',
      );

    this.loading = true;
    this.authService.accessToken(this.username, this.password).subscribe({
      next: (res: RootModel) => {
        this.loading = false;
        if (res.success && res.data) {
          if (res.data.requiresCompanySelection) {
            window.sessionStorage.setItem('company_selection_token', res.data.selectionToken);
            window.sessionStorage.setItem(
              'company_selection_companies',
              JSON.stringify(res.data.companies ?? []),
            );
            this.router.navigate(['/auth/select-company']).then(() => false);
            return;
          }
          this.setValueToSession(res);
          this.router.navigate(['/dashboard']).then(r => false);
        } else {
          console.error('Login failed:', res.message);
        }
      },
      error: (err) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  setValueToSession(res: RootModel) {
    this.authService.storeAuthenticatedSession(res.data);
    const user = res.data.user ?? {};
    this.sharedService.setUserId(user.userId ?? user.id ?? '');
    this.sharedService.setUserName(user.userName ?? '');
    this.sharedService.setUserRole(user.role ?? user.roleName ?? '');
  }

  switchLanguage(lang: string) {
    this.currentLang.set(lang);
    this.translateService.use(lang);
    window.localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme
    }));
  }
}
