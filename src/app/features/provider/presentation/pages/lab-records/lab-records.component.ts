import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabResultsComponent } from '../../components/patient-records/lab-results/lab-results.component';
import { RecordsHeaderComponent } from '../../components/patient-records/records-header/records-header.component';

@Component({
  selector: 'app-lab-records',
  standalone: true,
  imports: [LabResultsComponent, RecordsHeaderComponent],
  templateUrl: './lab-records.component.html',
})
export class LabRecordsComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? '';
}
