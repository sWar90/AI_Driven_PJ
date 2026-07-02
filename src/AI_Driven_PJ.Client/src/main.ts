import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { LoginPage } from './app/features/auth/pages/login/login';

bootstrapApplication(LoginPage, appConfig).catch((err) => console.error(err));
