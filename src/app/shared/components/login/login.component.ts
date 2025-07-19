import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginFormComponent } from '../login-form/login-form.component';
import { TabComponent } from '../tab/tab.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { TabsComponent } from '../tabs/tabs.component';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoginFormComponent,
    TabComponent,
    ForgotPasswordComponent,
    TabsComponent,
    AuthComponent,
  ],
})
export class LoginPageComponent {}
