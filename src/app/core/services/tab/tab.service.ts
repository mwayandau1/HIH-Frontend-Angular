import { Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TabsService {
  private readonly activeTabIndex = signal<number>(0);

  setActiveTab(index: number): void {
    this.activeTabIndex.set(index);
  }

  getActiveTab(): Signal<number> {
    return this.activeTabIndex.asReadonly();
  }
}
