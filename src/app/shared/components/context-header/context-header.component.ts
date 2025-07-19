import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-context-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './context-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextHeaderComponent {
  public icon = input.required<string>();
  public title = input.required<string>();
  public subtitle = input.required<string>();
  public iconSize = input<number>(24);
  public contextButtonText = input<string>('');
  public contextButtonAction = output<Event>();
  public contextButtonVarient = input<'primary' | 'secondary'>('secondary');

  getIconStyle(): string {
    return `width: ${this.iconSize()}px; height: ${this.iconSize()}px;`;
  }
}
