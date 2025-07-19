import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DisplayBadge } from '@shared/models';

@Component({
  selector: 'app-badge-list',
  standalone: true,
  templateUrl: './badge-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeListComponent {
  public readonly title = input.required<string>();
  public readonly items = input.required<DisplayBadge[]>();
  public readonly selectedItem = input<DisplayBadge | null>(null);
  public readonly showBorder = input<boolean>(true);
  public readonly loading = input<boolean>(true);

  public readonly selectItem = output<DisplayBadge>();
  public readonly delete = output<DisplayBadge>();
  public readonly edit = output<DisplayBadge>();

  protected onSelectItem(item: DisplayBadge): void {
    this.selectItem.emit(item);
  }

  protected onDeleteItem(item: DisplayBadge): void {
    this.delete.emit(item);
  }

  protected onEditItem(item: DisplayBadge): void {
    this.edit.emit(item);
  }
}
