import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabComponent } from '@shared/components/tab/tab.component';
import { TabsComponent } from '@shared/components/tabs/tabs.component';
import { UsersTabComponent } from '../../components/users-tab/users-tab.component';
import { RolesTabComponent } from '../../components/roles-tab/roles-tab.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [TabsComponent, TabComponent, UsersTabComponent, RolesTabComponent],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {}
