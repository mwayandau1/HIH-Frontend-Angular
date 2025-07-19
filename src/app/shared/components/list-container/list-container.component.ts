import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ContextHeaderComponent } from '../context-header/context-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-container',
  standalone: true,
  imports: [ButtonComponent, ContextHeaderComponent, CommonModule],
  templateUrl: './list-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListContainerComponent {
  public readonly icon = input.required<string>();
  public readonly paginated = input<boolean>(false);
  public readonly showAllBUttons = input<boolean>(false);
  public readonly noData = input<boolean>(true);
  public readonly title = input.required<string>();
  public readonly contextButtonText = input<string>('');
  public readonly contextButtonAction = output<Event>();
  public readonly subtitle = input<string>('');
  public readonly primaryButtonText = input<string>();
  public readonly primaryButtonTitle = input<string>();
  public readonly primaryButtonVariant = input<'primary' | 'secondary'>('primary');
  public readonly secondaryButtonText = input<string>();
  public readonly secondaryButtonTitle = input<string>();
  public readonly secondaryButtonVariant = input<'primary' | 'secondary'>('secondary');

  public readonly primaryButtonClick = output<Event>();
  public readonly secondaryButtonClick = output<Event>();
}
