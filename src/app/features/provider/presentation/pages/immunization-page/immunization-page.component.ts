import { Component, inject } from '@angular/core';
import { ImmunizationComponent } from '../../components/patient-records/immunization/immunization.component';
import { RecordsHeaderComponent } from '../../components/patient-records/records-header/records-header.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-immunization-page',
  standalone: true,
  imports: [ImmunizationComponent, RecordsHeaderComponent],
  templateUrl: './immunization-page.component.html',
})
export class ImmunizationPageComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? '';
}
