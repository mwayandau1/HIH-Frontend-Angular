import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Medication } from '@shared/models/patient';
import { ListContainerComponent } from '@shared/components/list-container/list-container.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-patient-medications',
  standalone: true,
  imports: [ListContainerComponent, DatePipe],
  templateUrl: './patient-medications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientMedicationsComponent {
  public readonly medications = input.required<Medication[]>();
}
