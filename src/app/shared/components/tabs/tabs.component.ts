import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { Variant } from '@shared/models/tabs';
import { TabsService } from '@core/services/tab/tab.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterViewInit {
  protected readonly tabsService = inject(TabsService);
  public readonly tabsComponents = contentChildren(TabComponent);
  public readonly variant = input<Variant>('primary');

  protected readonly activeIndex = this.tabsService.getActiveTab();
  protected readonly tabs = signal<TabComponent[]>([]);

  ngAfterViewInit(): void {
    this.tabs.set([...this.tabsComponents()]);
    if (this.activeIndex() >= this.tabs().length) this.tabsService.setActiveTab(0);

    this.updateActiveStates();
  }

  protected selectTab(index: number): void {
    this.tabsService.setActiveTab(index);

    this.updateActiveStates();
  }

  private updateActiveStates(): void {
    this.tabs().forEach((tab, index) => {
      tab['setActive'](index === this.activeIndex());
    });
  }

  protected getCombinedClass(index: number): Record<string, boolean> {
    const length = this.tabs().length;

    const tabWidth = {
      'w-1/2': length === 2,
      'w-1/3': length === 3,
      'w-1/4': length === 4,
      'w-1/5': length === 5,
      'w-auto px-2': length === 1 || length > 5,
    };

    const colorsObj =
      this.variant() === 'primary'
        ? 'bg-active-tab-bg text-active-tab-text'
        : 'bg-hover text-tab-secondary-active-typo font-bold';

    return {
      ...tabWidth,
      ...(this.activeIndex() === index
        ? Object.fromEntries(colorsObj.split(' ').map((c) => [c, true]))
        : {}),
    };
  }
}
