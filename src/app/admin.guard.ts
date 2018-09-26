import { switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ServiceService } from './service.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private service: ServiceService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.service.user.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/']);
          return of(false);
        }
        return this.service.isAdmin(user.email).pipe(
          tap(isAdmin => {
            if (!isAdmin) {
              this.router.navigate(['/']);
            }
          })
        );
      })
    );
  }
}
