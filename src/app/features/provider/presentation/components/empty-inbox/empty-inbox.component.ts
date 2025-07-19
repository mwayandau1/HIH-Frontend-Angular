import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-empty-inbox',
  standalone: true,
  imports: [],
  templateUrl: './empty-inbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyInboxComponent {}
