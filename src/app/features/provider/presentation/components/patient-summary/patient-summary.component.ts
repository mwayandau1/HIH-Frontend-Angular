import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PatientDetails } from '@shared/models/patient';
import { PatientInformationComponent } from '../patient-information/patient-information.component';
import { PatientVitalsComponent } from '../patient-vitals/patient-vitals.component';
import { PatientLabResultsComponent } from '../patient-lab-results/patient-lab-results.component';
import { PatientMedicationsComponent } from '../patient-medications/patient-medications.component';
import { PatientRecentVisitsComponent } from '../patient-recent-visits/patient-recent-visits.component';

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [
    PatientInformationComponent,
    PatientVitalsComponent,
    PatientLabResultsComponent,
    PatientMedicationsComponent,
    PatientRecentVisitsComponent,
  ],
  templateUrl: './patient-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientSummaryComponent {
  public readonly patient = input.required<PatientDetails>();
}
