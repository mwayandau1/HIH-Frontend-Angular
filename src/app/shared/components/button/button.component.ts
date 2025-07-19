import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Variant } from '@shared/models/tabs';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  public readonly disabled = input<boolean>(false);
  public readonly variant = input<Variant>('primary');
  public readonly title = input.required<string>();
  public readonly loading = input<boolean>(false);
  public readonly customStyles = input<string>('');
  public readonly type = input<'button' | 'submit'>('button');
  public clickEvent = output<Event>();

  protected handleClick(event: Event) {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.clickEvent.emit(event);
  }
}
