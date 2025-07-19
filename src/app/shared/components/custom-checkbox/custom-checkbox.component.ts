/* eslint-disable no-unused-vars */
import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, model } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './custom-checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent {
  control = input<FormControl | null>(null);
  disabled = model(false);

  protected value = false;

  private onChange = (value: boolean) => {
    if (this.control()) {
      this.control()?.setValue(value);
    }
  };

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  private onTouched = () => {
    if (this.control()) {
      this.control()?.markAsTouched();
    }
  };

  writeValue(value: boolean): void {
    this.value = value;
    if (this.control()) {
      this.control()?.setValue(value);
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (this.control()) {
      if (isDisabled) {
        this.control()?.disable();
      } else {
        this.control()?.enable();
      }
    }
  }

  toggle(): void {
    if (this.disabled()) return;

    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
