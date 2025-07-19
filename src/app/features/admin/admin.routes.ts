import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/core/layouts/dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/home/home.component').then(
            (Default) => Default.HomePageComponent,
          ),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./presentation/pages/logs/logs.component').then(
            (Default) => Default.LogsPageComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./presentation/pages/users/users.component').then(
            (Default) => Default.UsersPageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./presentation/pages/settings/settings.component').then(
            (Default) => Default.SettingsPageComponent,
          ),
      },
      {
        path: 'compliance',
        loadComponent: () =>
          import('./presentation/pages/complaince/complaince.component').then(
            (Default) => Default.ComplaincePageComponent,
          ),
      },
    ],
  },
];
