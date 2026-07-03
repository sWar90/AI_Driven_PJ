import { Routes } from '@angular/router';
import { BankPage } from './pages/pages';

export default [
  {
    path: '',
    component: BankPage,
    data: { title: 'MENU.HOME.BANKS' },
  },
] as Routes;
