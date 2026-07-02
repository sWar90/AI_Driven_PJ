import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login-page',
    standalone: true,
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class LoginPage {
    private readonly document = inject(DOCUMENT);
    private readonly translateService = inject(TranslateService);

    protected readonly isDarkTheme = signal(false);
    protected readonly showPassword = signal(false);

    constructor() {
        const preferredTheme = this.document.defaultView?.localStorage.getItem('theme');
        const prefersDarkTheme = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;

        this.setDarkTheme(preferredTheme ? preferredTheme === 'dark' : prefersDarkTheme);
    }

    protected toggleTheme(): void {
        this.setDarkTheme(!this.isDarkTheme());
    }

    protected togglePassword(): void {
        this.showPassword.set(!this.showPassword());
    }

    protected switchLanguage(): void {
        const nextLanguage = this.translateService.currentLang === 'mm' ? 'en' : 'mm';

        this.translateService.use(nextLanguage);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
    }

    protected t(key: string): string {
        return this.translateService.instant(key);
    }

    private setDarkTheme(isDarkTheme: boolean): void {
        this.isDarkTheme.set(isDarkTheme);
        this.document.documentElement.classList.toggle('app-dark', isDarkTheme);
        this.document.body.classList.toggle('app-dark', isDarkTheme);
        this.document.defaultView?.localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }
}
