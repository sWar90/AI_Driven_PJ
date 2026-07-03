import { Routes } from '@angular/router';
import { AuthGuardService } from '@core/auth/guards/auth-guard.service';
import { AppLayout } from './layout/component/app.layout';
import { DashboardPage } from './features/dashboard/dashboard.page';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.routes') },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        component: DashboardPage,
        data: { title: 'MENU.HOME.DASHBOARD' },
        canActivate: [AuthGuardService],
      },
      {
        path: 'companies',
        loadChildren: () => import('./features/companies/companies.routes'),
        canActivate: [AuthGuardService],
      },
      {
        path: 'banks',
        loadChildren: () => import('./features/banks/banks.routes'),
        canActivate: [AuthGuardService],
      },
    ],
  },
];
