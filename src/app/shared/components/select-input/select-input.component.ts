import {
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { DropdownItem } from '@shared/models';

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './select-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectInputComponent {
  private readonly document = inject(DOCUMENT);
  public readonly placeholder = input('Select an option');
  public readonly options = input<DropdownItem[]>([]);
  public readonly disabled = input(false);
  public readonly control = input<FormControl | null>(null);
  public readonly label = input('');
  public readonly required = input<boolean>(false);
  protected readonly arrowIcon = ChevronDown;
  public readonly isOpen = signal(false);
  public readonly controlValue = signal<string>('');
  public readonly selectedLabel = computed(() => {
    const selectedOption = this.options().find(({ id }) => id === this.controlValue());
    return selectedOption ? selectedOption.label : this.placeholder();
  });

  constructor() {
    effect(
      (onCleanup) => {
        const control = this.control();
        if (control) {
          const sub = control.valueChanges.subscribe((value) => {
            this.controlValue.set(value);
          });
          this.controlValue.set(control.value);
          onCleanup(() => sub.unsubscribe());
        }
      },
      { allowSignalWrites: true },
    );

    effect((onCleanup) => {
      const handler = (event: MouseEvent) => {
        if (this.isOpen() && !(event.target as HTMLElement).closest('app-select-input')) {
          this.closeDropdown();
        }
      };
      this.document.addEventListener('click', handler);
      onCleanup(() => this.document.removeEventListener('click', handler));
    });
  }

  public toggleDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.update((v) => !v);
  }

  public selectOption(value: string | boolean): void {
    const control = this.control();
    control?.setValue(value);
    this.closeDropdown();
  }

  public closeDropdown(): void {
    this.isOpen.set(false);
  }
}
