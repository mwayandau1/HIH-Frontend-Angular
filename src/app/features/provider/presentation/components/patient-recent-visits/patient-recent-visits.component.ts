import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TabsService } from '@core/services/tab/tab.service';
import { ListContainerComponent } from '@shared/components/list-container/list-container.component';
import { PatientVisit } from '@shared/models/patient';

@Component({
  selector: 'app-patient-recent-visits',
  standalone: true,
  imports: [ListContainerComponent, DatePipe],
  templateUrl: './patient-recent-visits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRecentVisitsComponent {
  protected readonly tabsService = inject(TabsService);
  public readonly visits = input.required<PatientVisit[]>();
}
