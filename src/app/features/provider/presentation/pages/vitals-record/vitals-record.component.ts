import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VitalsHistoryComponent } from '../../components/patient-records/vitals-history/vitals-history.component';
import { RecordsHeaderComponent } from '../../components/patient-records/records-header/records-header.component';

@Component({
  selector: 'app-vitals-record',
  standalone: true,
  imports: [VitalsHistoryComponent, RouterModule, RecordsHeaderComponent],
  templateUrl: './vitals-record.component.html',
})
export class VitalsRecordComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly patientId = this.route.snapshot.paramMap.get('id') ?? '';
}
