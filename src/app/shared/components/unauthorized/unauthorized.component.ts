import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './unauthorized.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedPageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  handleNavigate(): void {
    const userRole = this.authService.getUserRole();

    this.router.navigate([`/${userRole ?? ''}`]);
  }
}
