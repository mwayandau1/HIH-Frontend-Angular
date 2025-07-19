import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sharing-page',
  standalone: true,
  imports: [],
  templateUrl: './sharing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharingPageComponent {}
