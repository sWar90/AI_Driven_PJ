import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';
import { LoggerService } from '@shared_services/logger.service';
import { Router } from '@angular/router';

export const authInterceptorFn: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const loggerService = inject(LoggerService);
  const router = inject(Router);

  const token = window.localStorage.getItem('access_token');
  const companyId = authService.getCompanyId();
  const isAuthRequest = request.url.toLowerCase().includes('/auth/');
  const tenantHeaders: Record<string, string> = companyId
    ? { 'X-Company-Id': companyId }
    : {};
  const authHeaders: Record<string, string> = token && !isAuthRequest
    ? { Authorization: `Bearer ${token}` }
    : {};

  if (
    request.url.includes('attachment') ||
    request.url.includes('uploadsign')
  ) {
    request = request.clone({
      setHeaders: {
        Accept: 'application/json',
        ...authHeaders,
        ...tenantHeaders,
      },
    });
  } else {
    request = request.clone({
      setHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...tenantHeaders,
      },
    });
  }

  return next(request).pipe(
    catchError((err) => {
      switch (err.status) {
        case 400:
          loggerService.error(err.error);
          break;
        case 401:
          loggerService.error(err.error);
          authService.logoutForce();
          router.navigate(['/auth/login']);
          break;
        case 403:
          loggerService.error(err.error);
          authService.logoutForce();
          break;
      }

      // Propagate the original error so callers can handle context-specific UI.
      return throwError(() => err);
    }),
  );
};
