import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-records-page',
  standalone: true,
  imports: [],
  templateUrl: './records.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsPageComponent {}
