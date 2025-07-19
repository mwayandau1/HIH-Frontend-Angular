import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast/toast.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { toastNotifications } from '@shared/constants/toast';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { customEmailValidator, customPasswordValidator } from '@shared/utils/validators/validators';
import { Eye, EyeClosed, LucideAngularModule, Mail } from 'lucide-angular';
import { finalize } from 'rxjs';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    LucideAngularModule,
    LoaderComponent,
  ],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly icons = { Eye, EyeClosed, Mail };
  protected readonly isPasswordVisible = signal(false);
  protected readonly checkFieldError = checkFieldErrors;
  protected readonly isLoading = signal(false);
  protected readonly authFormControls = {
    email: new FormControl('', [Validators.required, customEmailValidator]),
    password: new FormControl('', [Validators.required, customPasswordValidator()]),
  };

  protected readonly authForm = this.fb.group(this.authFormControls);

  protected handlePasswordVisibility(): void {
    this.isPasswordVisible.update((prev) => !prev);
  }

  protected onSubmit() {
    const email = this.authForm.value.email ?? '';
    const password = this.authForm.value.password ?? '';
    const { messages, status } = toastNotifications;

    this.isLoading.set(true);

    this.authService
      .login({ email, password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const role = this.authService.getUserRole();
          switch (role) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'provider':
              this.router.navigate(['/provider']);
              break;
            case 'patient':
              this.router.navigate(['/patient']);
              break;
            default:
              this.router.navigate(['/unauthorized']);
          }
          this.authForm.reset();
        },
        error: (err) => this.toast.show(messages.loginFailed, status.error, err.error.message),
      });
  }
}
