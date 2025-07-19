import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadUserProfile, selectUserProfile } from '@core/store';
import { Bell, CircleUserRound, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  protected readonly icons = { CircleUserRound, Bell };
  private readonly store = inject(Store);
  protected readonly userInfo = this.store.selectSignal(selectUserProfile);

  ngOnInit(): void {
    this.store.dispatch(loadUserProfile());
  }
}
