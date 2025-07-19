import { Component, signal, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChevronDown, ChevronRight, Funnel, LucideAngularModule } from 'lucide-angular';
import { FilterField, FilterOption } from '@shared/models/filters';

@Component({
  selector: 'app-filter-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterInputComponent {
  private readonly expandedSections = signal<Record<string, boolean>>({});
  protected readonly icons = { Funnel, ChevronDown, ChevronRight };
  protected readonly isDropdownOpen = signal(false);
  protected readonly selectedOption = signal<string | null>(null);
  public readonly filterOptions = input.required<FilterOption[]>();
  public readonly selectedValue = output<FilterField>();

  protected readonly computedFilterOptions = computed(() => {
    return this.filterOptions().map((option) => ({
      ...option,
      expanded: this.expandedSections()[option.id] || false,
    }));
  });

  protected toggleDropdown(state?: boolean) {
    this.isDropdownOpen.set(state ?? !this.isDropdownOpen());

    if (!this.isDropdownOpen()) this.expandedSections.set({});
  }

  protected toggleSection(sectionId: string) {
    this.expandedSections.update((current) => {
      const newState: Record<string, boolean> = {};
      newState[sectionId] = !current[sectionId];
      return newState;
    });
  }

  protected selectOption(option: FilterOption, label: string) {
    this.isDropdownOpen.set(false);
    this.expandedSections.set({});

    if (option.id !== '') {
      this.selectedOption.set(option.label);
      this.selectedValue.emit({ value: option.id, label });
    } else {
      this.selectedOption.set(null);
      this.selectedValue.emit({ value: null, label });
    }
  }
}
