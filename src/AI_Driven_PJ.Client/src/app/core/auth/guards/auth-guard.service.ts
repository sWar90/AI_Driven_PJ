import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  Scroll,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { Observable } from 'rxjs';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { MessageService } from 'primeng/api';
import { NAVIGATION_MENU } from '../../../layout/component/app.menu';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private loggerSerivce: LoggerService,
    private router: Router,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['auth/login']);
      return false;
    } else {
      // if (!this.checkAuthorizedRoute(state.url)) {
      //   this.router.navigate(['auth/access-denied']);
      //   this.messageService.add({
      //     key: 'globalMessage',
      //     severity: 'info',
      //     summary: 'Access denied.',
      //     detail: "You don't have permission.",
      //   });
      // }
    }
    return true;
  }

  checkAuthorizedRoute(url: string): boolean {
    let userRoles = this.sharedService.getUserRole();
    let isValid: boolean = true;
    NAVIGATION_MENU.forEach((v) => {
      v.items?.forEach((v1: any) => {
        if (v1.items !== undefined) {
          v1.items.forEach((v2: any) => {
            if (v2.routerLink !== undefined) {
              if (v2.routerLink[0] === url) {
                isValid = v2.data.role.includes(userRoles);
              }
            }
          });
        } else {
          if (v1.routerLink !== undefined) {
            if (v1.routerLink[0] === url) {
              isValid = v1.data.role.includes(userRoles);
            }
          }
        }
      });
    });

    return isValid;
  }
}
