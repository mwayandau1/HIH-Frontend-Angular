import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Vital } from '@shared/models/patient';

@Component({
  selector: 'app-patient-vitals',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './patient-vitals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientVitalsComponent {
  public readonly vitals = input.required<Vital[]>();
}
