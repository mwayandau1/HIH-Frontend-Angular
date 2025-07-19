import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { TabComponent } from '@shared/components/tab/tab.component';
import { ProfileSettingsComponent } from '../../components/profile-settings/profile-settings.component';
import { SecuritySettingsComponent } from '@shared/components/security-settings/security-settings.component';
import { NotificationSettingsComponent } from '@shared/components/notification-settings/notification-settings.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    TabsComponent,
    TabComponent,
    ProfileSettingsComponent,
    SecuritySettingsComponent,
    NotificationSettingsComponent,
  ],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {}
