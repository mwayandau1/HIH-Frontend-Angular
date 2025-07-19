import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarRange, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './datepicker.component.html',
})
export class DatePickerComponent {
  protected readonly icons = { CalendarRange };
  public readonly required = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly label = input.required<string>();
  public readonly id = input.required<string>();
  public readonly control = input<FormControl>(new FormControl());
  public readonly inputBlur = output<FocusEvent>();
  public readonly errorMessage = input<string>();
}
