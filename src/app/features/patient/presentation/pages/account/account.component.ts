import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { TabComponent } from '@shared/components/tab/tab.component';
import { SecuritySettingsComponent } from '@shared/components/security-settings/security-settings.component';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { NotificationSettingsComponent } from '@shared/components/notification-settings/notification-settings.component';
import { ProfileSettingsComponent } from '../../components/profile-settings/profile-settings.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    TabsComponent,
    TabComponent,
    SecuritySettingsComponent,
    NotificationSettingsComponent,
    ProfileSettingsComponent,
    LucideAngularModule,
    RouterModule,
  ],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPageComponent {
  protected readonly icons = { ChevronRight };
}
