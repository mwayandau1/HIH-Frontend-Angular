import { Routes } from '@angular/router';
import { SandwitchLayoutComponent } from '@core/layouts/sandwitch/sandwitch.component';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    component: SandwitchLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/home/home.component').then(
            (Default) => Default.HomePageComponent,
          ),
      },
      {
        path: 'records',
        loadComponent: () =>
          import('./presentation/pages/records/records.component').then(
            (Default) => Default.RecordsPageComponent,
          ),
      },
      {
        path: 'sharing',
        loadComponent: () =>
          import('./presentation/pages/sharing/sharing.component').then(
            (Default) => Default.SharingPageComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./presentation/pages/appointments/appointments.component').then(
            (Default) => Default.AppointmentsPageComponent,
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./presentation/pages/account/account.component').then(
            (Default) => Default.AccountPageComponent,
          ),
      },
      {
        path: 'appointments/message/:roomId',
        loadComponent: () =>
          import('./presentation/pages/message/message.component').then(
            (Default) => Default.MessagePageComponent,
          ),
      },
    ],
  },
];
