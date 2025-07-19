import { CommonModule } from '@angular/common';
import {
  Component,
  output,
  HostListener,
  ViewChild,
  ElementRef,
  input,
  signal,
} from '@angular/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { DropdownItem } from '@shared/models/dropdown';
import { formatWord } from '@shared/utils/helpers/formatting';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {
  public readonly options = input<DropdownItem[]>([]);
  public readonly className = input<string>('');
  public readonly clearId = input<string | boolean>('');
  public readonly itemSelected = output<string | boolean>();
  public readonly selected = signal<DropdownItem | null>(null);

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  protected readonly formatWord = formatWord;
  public isOpen = false;
  protected readonly arrow = ChevronDown;

  protected toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  public selectItem(item: DropdownItem): void {
    this.itemSelected.emit(item.id);
    this.selected.set(item);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: MouseEvent): void {
    if (!this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
