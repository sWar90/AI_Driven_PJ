import { Routes } from '@angular/router';

import { LoginPage } from './pages/login/login';

export default [
    {
        path: 'login',
        component: LoginPage,
        data: { title: 'AUTH.LOGIN.TITLE' }
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    }
] as Routes;
