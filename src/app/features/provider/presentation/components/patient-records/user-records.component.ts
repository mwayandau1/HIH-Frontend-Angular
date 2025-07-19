import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AllergiesConditionsComponent } from './allergies-conditions/allergies-conditions.component';
import { LabResultsComponent } from './lab-results/lab-results.component';
import { MedicationsComponent } from './medications/medications.component';
import { ImmunizationComponent } from './immunization/immunization.component';
import { VitalsHistoryComponent } from './vitals-history/vitals-history.component';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-records',
  standalone: true,
  imports: [
    AllergiesConditionsComponent,
    LabResultsComponent,
    MedicationsComponent,
    ImmunizationComponent,
    VitalsHistoryComponent,
  ],
  templateUrl: './user-records.component.html',
})
export class UserRecordsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly patientId = signal<string>('');
  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param) => {
      const id = param['id'];
      this.patientId.set(id);
    });
  }
}
