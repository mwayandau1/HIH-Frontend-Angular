import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-tab',
  standalone: true,
  templateUrl: './tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  public readonly title = input.required<string>();
  readonly isActive = signal(false);

  setActive(state: boolean): void {
    this.isActive.set(state);
  }
}
