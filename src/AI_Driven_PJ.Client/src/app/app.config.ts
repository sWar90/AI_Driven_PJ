import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import RixsFinTrackTheme from './layout/theme/ai-driven-theme';
import { authInterceptorFn } from '@core/auth/interceptors/auth.interceptor';
import { httpErrorHandlerInterceptor } from '@core/http/http-error-handler.interceptor';
import { httpRequestHeaderInterceptor } from '@core/http/http-request-header.interceptor';
import { encryptHttpRequestInterceptor } from '@core/interceptors/encrypt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling(
        { anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation(),
    ),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideHttpClient(
      withFetch(),
      withInterceptors([
        httpErrorHandlerInterceptor,
        httpRequestHeaderInterceptor,
        encryptHttpRequestInterceptor,
        authInterceptorFn,
      ]),
    ),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: 'assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
    providePrimeNG({ theme: { preset: RixsFinTrackTheme, options: { darkModeSelector: '.app-dark' } } }),
    MessageService,
  ],
};
