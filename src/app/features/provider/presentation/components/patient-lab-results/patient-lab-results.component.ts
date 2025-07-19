import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LabResult } from '@shared/models/patient';
import { ListContainerComponent } from '@shared/components/list-container/list-container.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-patient-lab-results',
  standalone: true,
  imports: [ListContainerComponent, DatePipe],
  templateUrl: './patient-lab-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientLabResultsComponent {
  public readonly labResults = input.required<LabResult[]>();
}
