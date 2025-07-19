import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { UserRole } from '@shared/models/userRoles';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(next: ActivatedRouteSnapshot): boolean {
    const requiredRoles = next.data ? (next.data['roles'] as UserRole[]) : undefined;

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const userRole = this.authService.getUserRole();

    if (userRole && requiredRoles.includes(userRole)) return true;

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
