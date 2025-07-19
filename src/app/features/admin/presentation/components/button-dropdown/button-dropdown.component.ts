import { CommonModule } from '@angular/common';
import { Component, output, HostListener, ViewChild, ElementRef, input } from '@angular/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { DropdownItem } from '@shared/models/dropdown';
import { formatWord } from '@shared/utils/helpers/formatting';

@Component({
  selector: 'app-button-dropdown',
  imports: [CommonModule, LucideAngularModule],
  standalone: true,
  templateUrl: './button-dropdown.component.html',
})
export class ButtonDropdownComponent {
  public readonly options = input<DropdownItem[]>([]);
  public readonly className = input<string>('');
  public readonly clearId = input<string | boolean>('');

  public readonly itemSelected = output<string | boolean>();

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  protected readonly formatWord = formatWord;
  protected isOpen = false;
  protected readonly arrow = ChevronDown;

  protected toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  protected selectItem(item: DropdownItem): void {
    this.itemSelected.emit(item.id);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  protected onClickOutside(event: MouseEvent): void {
    if (!this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
