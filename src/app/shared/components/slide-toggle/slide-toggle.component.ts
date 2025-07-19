/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Check, X } from 'lucide-angular';

@Component({
  selector: 'app-slide-toggle',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SlideToggleComponent,
      multi: true,
    },
  ],
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideToggleComponent implements ControlValueAccessor {
  public isOn = signal(false);
  public disabled = signal(false);
  public variant = input<'primary' | 'primary-icon' | 'secondary' | 'secondary-icon'>('primary');
  @Output() toggled = new EventEmitter<boolean>();
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  protected checkIcon = Check;
  protected crossIcon = X;

  toggle() {
    if (this.disabled()) return;

    this.isOn.update((prev) => !prev);
    this.toggled.emit(this.isOn());
    if (this.onChange) {
      this.onChange(this.isOn());
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  writeValue(value: boolean): void {
    this.isOn.set(value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected getVariantClasses() {
    const baseClasses = 'rounded-full transition-all duration-300 ease-in-out flex items-center';
    const variant = this.variant();
    const isOn = this.isOn();

    const trackStyles = {
      primary: 'w-[40px] h-[12px]',
      secondary: 'w-[40px] h-[20px]',
    };

    const thumbStyles = {
      primary: {
        size: 'w-[20px] h-[20px]',
        transform: isOn ? 'translate-x-6' : 'translate-x-0',
      },
      secondary: {
        size: 'w-[16px] h-[16px]',
        transform: isOn ? 'translate-x-[21px]' : 'translate-x-[3px]',
      },
    };

    const getTrackClass = () => {
      const size = variant.includes('primary') ? trackStyles.primary : trackStyles.secondary;
      const bgColor = isOn ? 'bg-[#5570F166]' : 'bg-[#5570F11F]';
      return `${baseClasses} ${size} ${bgColor}`;
    };

    const getThumbClass = () => {
      const style = variant.includes('primary') ? thumbStyles.primary : thumbStyles.secondary;
      const bgColor = isOn ? 'bg-[#5570F1]' : 'bg-[#BBC5CB]';
      const iconClass = variant.includes('icon') ? 'flex items-center justify-center' : '';
      return `${style.size} ${iconClass} rounded-full shadow-md transition-transform duration-300 ${style.transform} ${bgColor}`;
    };

    return {
      track: getTrackClass(),
      thumb: getThumbClass(),
      showIcon: variant.includes('icon'),
    };
  }

  protected getIcon() {
    return this.isOn() ? this.checkIcon : this.crossIcon;
  }
}
