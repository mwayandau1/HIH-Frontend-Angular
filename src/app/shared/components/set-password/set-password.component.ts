import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  customPasswordValidator,
  passwordsMatchValidator,
} from '@shared/utils/validators/validators';
import { InputComponent } from '../input/input.component';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { ButtonComponent } from '../button/button.component';
import { Eye, EyeClosed, Loader, LucideAngularModule } from 'lucide-angular';
import { AuthComponent } from '../auth/auth.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    LucideAngularModule,
    ReactiveFormsModule,
    AuthComponent,
  ],
  templateUrl: './set-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly inviteToken = signal('');
  protected readonly checkFieldError = checkFieldErrors;
  protected readonly isFirstPasswordVisible = signal(false);
  protected readonly isSecondPasswordVisible = signal(false);
  protected readonly icons = { Eye, EyeClosed, Loader };
  protected readonly isLoading = signal(false);
  protected readonly passwordForm = this.fb.group(
    {
      password: this.fb.control('', [Validators.required, customPasswordValidator()]),
      confirmPassword: this.fb.control('', [Validators.required, customPasswordValidator()]),
    },
    { validators: passwordsMatchValidator },
  );

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((param) => this.inviteToken.set(param['token']));
  }

  protected togglePasswordVisibility(position: string): void {
    if (position === 'first') this.isFirstPasswordVisible.update((prev) => !prev);
    else this.isSecondPasswordVisible.update((prev) => !prev);
  }

  protected onSubmit(): void {
    this.isLoading.set(true);
    const { status, operations, messages } = toastNotifications;
    const { password } = this.passwordForm.value;

    if (!password) return;

    this.authService
      .setPassword(this.inviteToken(), password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toast.show(operations.success, status.success, messages.setPassword);
          this.router.navigate(['/login']);
        },
        error: () => this.toast.show(operations.fail, status.error, messages.retry),
      });
  }
}
