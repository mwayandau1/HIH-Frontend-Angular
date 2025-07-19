import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { RoleGuard } from '@core/guards/role/role.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.routes').then((m) => m.PATIENT_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient'] },
  },
  {
    path: 'provider',
    loadChildren: () =>
      import('./features/provider/provider.routes').then((m) => m.PROVIDER_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@shared/components/login/login.component').then(
        (Default) => Default.LoginPageComponent,
      ),
  },
  {
    path: 'set-password',
    loadComponent: () =>
      import('@shared/components/set-password/set-password.component').then(
        (Default) => Default.SetPasswordComponent,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('@shared/components/unauthorized/unauthorized.component').then(
        (Default) => Default.UnauthorizedPageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
