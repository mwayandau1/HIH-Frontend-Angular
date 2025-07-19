import { CommonModule } from '@angular/common';
import { Component, input, Output, EventEmitter, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './input.component.html',
})
export class InputComponent {
  public readonly label = input<string>();
  public readonly type = input<string>('text');
  public readonly className = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hasIcon = input<boolean>(false);
  public readonly iconPosition = input<'left' | 'right'>('left');
  public readonly control = input.required<FormControl>();
  public readonly errorMessage = input<string>('');
  public readonly required = input<boolean>(false);
  public readonly isDisabled = input<boolean>(false);
  public readonly id = input.required<string>();
  public readonly keyEvent = output();
  public readonly isForChatBox = input<boolean>(false);

  @Output() inputBlur = new EventEmitter<FocusEvent>();

  protected handleyKeyEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.keyEvent.emit();
  }
}
