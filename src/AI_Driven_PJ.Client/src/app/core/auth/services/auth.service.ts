import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { RootModel } from '@core/models/root.model';
import { environment } from '@env/environment';

export interface AuthUserModel {
  userId?: string;
  id?: string;
  userName?: string;
  email?: string;
  role?: string;
  roleName?: string;
  companyId?: number;
  companyName?: string;
  baseCurrencyId?: number;
}

export interface AuthSessionModel {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresAtUtc?: string;
  requiresCompanySelection?: boolean;
  selectionToken?: string;
  companies?: unknown[];
  user?: AuthUserModel;
  company?: {
    companyId: number;
    companyName: string;
    baseCurrencyId: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private cookieService = inject(CookieService);

  constructor(
    private http: HttpClient) {

  }

  getUser(phone: string): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/get-user?phone=${phone}`;
    return this.http.get<RootModel>(url);
  }

  status(): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/status`;
    return this.http.get<RootModel>(url);
  }

  profile(): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/profile`;
    return this.http.get<RootModel>(url);
  }

  accessToken(username: string, password: string): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/access-token`;
    const body = {
      userNameOrEmail: username,
      password: password
    }
    return this.http.post<RootModel>(url, body);
  }

  selectCompany(selectionToken: string, companyId: number): Observable<RootModel> {
    const url = `${environment.main_url}/auth/select-company`;
    return this.http.post<RootModel>(url, { selectionToken, companyId });
  }

  storeAuthenticatedSession(data: AuthSessionModel): void {
    const accessToken = data.accessToken ?? data.access_token ?? '';
    const refreshToken = data.refreshToken ?? data.refresh_token ?? '';

    window.localStorage.setItem('access_token', accessToken);
    window.localStorage.setItem('refresh_token', refreshToken);
    this.cookieService.set('isSuperAdmin', String(this.readIsSuperAdminClaim(accessToken)), this.cookieOptions());

    const company = this.getCompanyContext(data);
    if (company) {
      this.setCompanyContext(company);
    }

    this.cookieService.set('authorized_status', 'authorized', this.cookieOptions());
  }

  setCompanyContext(company: {
    companyId: number;
    companyName: string;
    baseCurrencyId: number;
  }): void {
    this.cookieService.set('companyId', String(company.companyId), this.cookieOptions());
    this.cookieService.set('companyName', company.companyName, this.cookieOptions());
    this.cookieService.set('baseCurrencyId', String(company.baseCurrencyId), this.cookieOptions());
  }

  getCompanyId(): string {
    return this.cookieService.get('companyId');
  }

  getBaseCurrencyId(): string {
    return this.cookieService.get('baseCurrencyId');
  }

  isSuperAdmin(): boolean {
    const storedValue = this.cookieService.get('isSuperAdmin');
    if (storedValue) {
      return storedValue === 'true';
    }

    return this.readIsSuperAdminClaim(window.localStorage.getItem('access_token'));
  }

  refreshToken(): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/refresh-token`;
    const body = {
      accessToken: window.localStorage.getItem('access_token'),
      refreshToken: window.localStorage.getItem('refresh_token')
    }
    return this.http.post<RootModel>(url, body);
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/change-password`;
    const body = {
      oldPassword,
      newPassword,
      confirmPassword
    }
    return this.http.post<RootModel>(url, body);
  }

  isHasToken(): boolean {
    return (
      window.localStorage.getItem('refresh_token') !== undefined &&
      window.localStorage.getItem('refresh_token') !== null &&
      window.localStorage.getItem('refresh_token') !== '')
  }

  isLoggedIn(): boolean {
    return (
      this.cookieService.get('authorized_status') !== undefined &&
      this.cookieService.get('authorized_status') !== null &&
      this.cookieService.get('authorized_status') !== '')
  }

  logout(): void {
    this.cookieService.delete('authorized_status', '/');
    this.cookieService.delete('companyId', '/');
    this.cookieService.delete('companyName', '/');
    this.cookieService.delete('baseCurrencyId', '/');
    this.cookieService.delete('isSuperAdmin', '/');
  }

  logoutForce(): void {
    this.cookieService.delete('authorized_status', '/');
    this.cookieService.delete('username');
    this.cookieService.delete('userrole');
    this.cookieService.delete('userId');
    this.cookieService.delete('companyId', '/');
    this.cookieService.delete('companyName', '/');
    this.cookieService.delete('baseCurrencyId', '/');
    this.cookieService.delete('isSuperAdmin', '/');

    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('refresh_token');

    window.localStorage.removeItem('default_company');
    window.localStorage.removeItem('default_branch');
    window.sessionStorage.removeItem('company_selection_token');
    window.sessionStorage.removeItem('company_selection_companies');
  }

  private cookieOptions() {
    return {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict' as const,
    };
  }

  private getCompanyContext(data: AuthSessionModel) {
    if (data.company) {
      return data.company;
    }

    if (
      data.user?.companyId === undefined ||
      data.user?.companyName === undefined ||
      data.user?.baseCurrencyId === undefined
    ) {
      return null;
    }

    return {
      companyId: data.user.companyId,
      companyName: data.user.companyName,
      baseCurrencyId: data.user.baseCurrencyId,
    };
  }

  private readIsSuperAdminClaim(token: string | null | undefined): boolean {
    if (!token) return false;

    try {
      const payload = token.split('.')[1];
      if (!payload) return false;

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = window.atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '='));
      const claims = JSON.parse(decodedPayload);

      return claims?.is_super_admin === 'true' || claims?.is_super_admin === true;
    } catch {
      return false;
    }
  }
}
