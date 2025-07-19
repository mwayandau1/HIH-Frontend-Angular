import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientDetails } from '@shared/models/patient';
import { getAgeFromDOB } from '@shared/utils/helpers/dates';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ChevronRight, HeartOff, LucideAngularModule } from 'lucide-angular';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { TabComponent } from '@shared/components/tab/tab.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientVisitsComponent } from '../../components/patient-visits/patient-visits.component';
import { PatientNotesComponent } from '../../components/patient-notes/patient-notes.component';
import { UserRecordsComponent } from '../../components/patient-records/user-records.component';
import { DocumentsComponent } from '../../components/documents/documents.component';
import { PatientSummaryComponent } from '../../components/patient-summary/patient-summary.component';
import { PatientService } from '@core/services/patient/patient.service';
import { finalize } from 'rxjs';
import { ThemedLoaderComponent } from '@shared/components/themed-loader/themed-loader.component';
import { EmptyInventoryComponent } from '@shared/components/empty-inventory/empty-inventory.component';
import { TabsService } from '@core/services/tab/tab.service';
import { RoomService } from '@core/services/room/room.service';

@Component({
  selector: 'app-patient-page',
  standalone: true,
  imports: [
    DatePipe,
    ButtonComponent,
    RouterLink,
    LucideAngularModule,
    TabsComponent,
    TabComponent,
    PatientVisitsComponent,
    PatientNotesComponent,
    UserRecordsComponent,
    DocumentsComponent,
    PatientSummaryComponent,
    ThemedLoaderComponent,
    EmptyInventoryComponent,
  ],
  templateUrl: './patient.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPageComponent {
  private readonly patientService = inject(PatientService);
  private readonly roomService = inject(RoomService);
  private readonly tabsService = inject(TabsService);
  protected readonly activeTab = this.tabsService.getActiveTab();
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly icons = { ChevronRight, HeartOff };
  protected readonly getAgeFromDOB = getAgeFromDOB;
  protected readonly patient = signal<PatientDetails | null>(null);
  protected readonly patientId = signal('');
  protected readonly isFetchingPatient = signal(false);
  protected readonly roomId = signal('');

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param) => {
      const id = param?.['id'] ?? '';
      this.patientId.set(id);

      this.isFetchingPatient.set(true);

      this.patientService
        .getPatientById(this.patientId())
        .pipe(finalize(() => this.isFetchingPatient.set(false)))
        .subscribe({
          next: (res) => this.patient.set(res),
          error: (err) => {
            if (err.status === 401) this.router.navigate(['/unauthorized']);
          },
        });

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    });
  }

  protected handleMessagePatient(): void {
    if (this.patientId()) {
      this.roomService.getOrCreateRoom(this.patientId()).subscribe({
        next: (room) => {
          this.roomId.set(room.id);
          this.router.navigate(['provider/patients/messages', room.id]);
        },
      });
    }
  }
}
