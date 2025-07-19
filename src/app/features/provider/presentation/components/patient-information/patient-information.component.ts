import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PatientDetails } from '@shared/models/patient';

@Component({
  selector: 'app-patient-information',
  standalone: true,
  imports: [],
  templateUrl: './patient-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientInformationComponent {
  public readonly patient = input.required<PatientDetails>();
}
