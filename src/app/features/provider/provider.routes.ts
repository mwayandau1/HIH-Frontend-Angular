import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/core/layouts/dashboard/dashboard.component';

export const PROVIDER_ROUTES: Routes = [
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
        path: 'patients',
        loadComponent: () =>
          import('./presentation/pages/patients/patients.component').then(
            (Default) => Default.PatientsPageComponent,
          ),
      },
      {
        path: 'patients/messages',
        loadComponent: () =>
          import('./presentation/pages/message/message.component').then(
            (Default) => Default.MessagePageComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./presentation/components/empty-inbox/empty-inbox.component').then(
                (Default) => Default.EmptyInboxComponent,
              ),
          },
          {
            path: ':roomId',
            loadComponent: () =>
              import('./presentation/components/active-inbox/active-inbox.component').then(
                (Default) => Default.ActiveInboxComponent,
              ),
          },
        ],
      },
      {
        path: 'patients/:id',
        loadComponent: () =>
          import('./presentation/pages/patient/patient.component').then(
            (Default) => Default.PatientPageComponent,
          ),
      },
      {
        path: 'patients/:id/lab-results',
        loadComponent: () =>
          import('./presentation/pages/lab-records/lab-records.component').then(
            (Default) => Default.LabRecordsComponent,
          ),
      },
      {
        path: 'patients/:id/vitals',
        loadComponent: () =>
          import('./presentation/pages/vitals-record/vitals-record.component').then(
            (Default) => Default.VitalsRecordComponent,
          ),
      },
      {
        path: 'patients/:id/immunizations',
        loadComponent: () =>
          import('./presentation/pages/immunization-page/immunization-page.component').then(
            (Default) => Default.ImmunizationPageComponent,
          ),
      },
      {
        path: 'patients/:id/medications',
        loadComponent: () =>
          import('./presentation/pages/medications/medications.component').then(
            (Default) => Default.MedicationsPageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./presentation/pages/settings/settings.component').then(
            (Default) => Default.SettingsPageComponent,
          ),
      },
    ],
  },
];
