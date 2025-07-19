import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [],
  templateUrl: './logs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsPageComponent {}
