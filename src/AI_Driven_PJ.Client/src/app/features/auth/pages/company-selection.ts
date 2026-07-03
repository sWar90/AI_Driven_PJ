import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { RootModel } from '@core/models/root.model';
import { SharedService } from '@shared_services/shared.service';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

interface CompanyOption {
  companyId: number;
  companyName: string;
}

@Component({
  selector: 'app-company-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule],
  template: `
    <main class="selection-page">
      <section class="selection-card">
        <header>
          <h1>Select company</h1>
          <p>Choose the company you want to use for this session.</p>
        </header>

        <p-select
          [options]="companies"
          [(ngModel)]="selectedCompanyId"
          optionLabel="companyName"
          optionValue="companyId"
          placeholder="Select a company"
          [fluid]="true"
        />

        @if (error()) {
          <small class="selection-error">{{ error() }}</small>
        }

        <button
          pButton
          type="button"
          label="Continue"
          [loading]="loading()"
          [disabled]="!selectedCompanyId"
          (click)="continue()"
        ></button>
      </section>
    </main>
  `,
  styles: [`
    .selection-page { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: var(--surface-ground); }
    .selection-card { width: min(28rem, 100%); display: grid; gap: 1.25rem; padding: 2rem; border-radius: 1rem; background: var(--surface-card); box-shadow: 0 1rem 3rem rgba(15, 23, 42, .12); }
    h1 { margin: 0 0 .5rem; font-size: 1.75rem; }
    p { margin: 0; color: var(--text-color-secondary); }
    .selection-error { color: var(--p-red-500); }
  `],
})
export class CompanySelection {
  private readonly authService = inject(AuthService);
  private readonly sharedService = inject(SharedService);
  private readonly router = inject(Router);

  readonly companies: CompanyOption[] = this.readCompanies();
  readonly loading = signal(false);
  readonly error = signal('');
  selectedCompanyId: number | null = null;

  constructor() {
    if (!this.selectionToken || this.companies.length === 0) {
      this.router.navigate(['/auth/login']).then(() => false);
    }
  }

  continue(): void {
    if (!this.selectionToken || !this.selectedCompanyId) return;

    this.loading.set(true);
    this.error.set('');
    this.authService.selectCompany(this.selectionToken, this.selectedCompanyId).subscribe({
      next: (res: RootModel) => {
        if (!res.success) {
          this.error.set(res.message);
          return;
        }

        this.authService.storeAuthenticatedSession(res.data);
        this.sharedService.setUserId(res.data.user.id);
        this.sharedService.setUserName(res.data.user.userName);
        this.sharedService.setUserRole(res.data.user.roleName);
        window.sessionStorage.removeItem('company_selection_token');
        window.sessionStorage.removeItem('company_selection_companies');
        this.router.navigate(['/dashboard']).then(() => false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Unable to select company.');
      },
      complete: () => this.loading.set(false),
    });
  }

  private get selectionToken(): string {
    return window.sessionStorage.getItem('company_selection_token') ?? '';
  }

  private readCompanies(): CompanyOption[] {
    try {
      return JSON.parse(window.sessionStorage.getItem('company_selection_companies') ?? '[]');
    } catch {
      return [];
    }
  }
}
