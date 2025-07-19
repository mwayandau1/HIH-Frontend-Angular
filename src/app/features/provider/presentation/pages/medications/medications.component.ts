import { Component, inject } from '@angular/core';
import { RecordsHeaderComponent } from '../../components/patient-records/records-header/records-header.component';
import { MedicationsComponent } from '../../components/patient-records/medications/medications.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-medications-page',
  standalone: true,
  imports: [MedicationsComponent, RecordsHeaderComponent],
  templateUrl: './medications.component.html',
})
export class MedicationsPageComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? '';
}
