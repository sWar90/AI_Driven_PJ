import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@core/auth/services/auth.service';

export const NAVIGATION_MENU: MenuItem[] = [
  {
    label: 'MENU.HOME.LABEL',
    items: [
      {
        label: 'MENU.HOME.DASHBOARD',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/dashboard'],
      },
      {
        label: 'MENU.HOME.COMPANIES',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/companies'],
      },
      {
        label: 'MENU.HOME.BANKS',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/banks'],
      }
    ],
  },
];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    @for (item of model; track item.label) {
      @if (!item.separator) {
        <li app-menuitem [item]="item" [root]="true"></li>
      } @else {
        <li class="menu-separator"></li>
      }
    }
  </ul> `,
})
export class AppMenu {
  private authService = inject(AuthService);

  model: MenuItem[] = [];

  ngOnInit() {
    const isSuperAdmin = this.authService.isSuperAdmin();

    this.model = NAVIGATION_MENU.map((section) => this.filterMenuItem(section, isSuperAdmin)).filter(
      (section): section is MenuItem => !!section
    );
  }

  private filterMenuItem(item: MenuItem, isSuperAdmin: boolean): MenuItem | null {
    if (!isSuperAdmin && item.routerLink?.[0] === '/companies') {
      return null;
    }

    const filteredItems = item.items
      ?.map((child) => this.filterMenuItem(child, isSuperAdmin))
      .filter((child): child is MenuItem => !!child);

    if (item.items && filteredItems?.length === 0) {
      return null;
    }

    return {
      ...item,
      items: filteredItems,
    };
  }
}
