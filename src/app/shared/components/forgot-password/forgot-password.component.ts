import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { Eye, EyeClosed, LucideAngularModule, Mail } from 'lucide-angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@core/services/toast/toast.service';
import {
  customEmailValidator,
  customPasswordValidator,
  passwordsMatchValidator,
} from '@shared/utils/validators/validators';
import { toastNotifications } from '@shared/constants/toast';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { AuthService } from '@core/services/auth/auth.service';
import { finalize } from 'rxjs';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    LucideAngularModule,
    ReactiveFormsModule,
    LoaderComponent,
  ],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly checkFieldErrors = checkFieldErrors;
  protected readonly isSendingVerificationCode = signal(false);
  protected readonly isVerifying = signal(false);
  protected readonly isResettingPassword = signal(false);

  protected readonly icons = { Mail, Eye, EyeClosed };
  protected readonly step = signal(1);
  protected readonly isFirstPasswordVisible = signal(false);
  protected readonly isSecondPasswordVisible = signal(false);

  protected readonly resetForm = this.fb.group(
    {
      email: this.fb.control('', [Validators.required, customEmailValidator]),
      verificationCode: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [Validators.required, customPasswordValidator()]),
      confirmPassword: this.fb.control('', [Validators.required, customPasswordValidator()]),
    },
    { validators: passwordsMatchValidator },
  );

  protected togglePasswordVisibility(position: string): void {
    if (position === 'first') this.isFirstPasswordVisible.update((prev) => !prev);
    else this.isSecondPasswordVisible.update((prev) => !prev);
  }

  protected advanceStep(): void {
    if (this.isCurrentStepInvalid()) return;

    if (this.step() === 1) return this.sendCode();

    if (this.step() === 2) return this.verifyCode();

    if (this.step() === 3) return this.resetPassword();
  }

  protected isCurrentStepInvalid(): boolean {
    const { controls } = this.resetForm;
    const step = this.step();

    switch (step) {
      case 1:
        return controls.email.invalid;
      case 2:
        return controls.verificationCode.invalid;
      case 3:
        return (
          controls.newPassword.invalid ||
          controls.confirmPassword.invalid ||
          this.resetForm.hasError('passwordsMismatch')
        );
      default:
        return false;
    }
  }

  protected reset(): void {
    this.resetForm.reset();
    this.step.set(0);
  }

  protected getStepButtonLabel(): string {
    const labelMap: Record<number, string> = {
      1: 'Continue',
      2: 'Verify Code',
      3: 'Reset Password',
    };
    return labelMap[this.step()] ?? 'Proceed to Login';
  }

  protected sendCode(resend = false): void {
    this.isSendingVerificationCode.set(true);
    const { status, messages, operations } = toastNotifications;
    const { email } = this.resetForm.value;

    const action = resend
      ? this.authService.resendVerificationCode(email ?? '')
      : this.authService.sendVerificationCode(email ?? '');

    action.pipe(finalize(() => this.isSendingVerificationCode.set(false))).subscribe({
      next: () => {
        this.toast.show(operations.verify, status.success, messages.emailSent);
        this.step.set(2);
      },
      error: (err) => this.toast.show(operations.fail, status.error, err.error.message),
    });
  }

  protected verifyCode(): void {
    const { status, operations, messages } = toastNotifications;
    this.isVerifying.set(true);
    const code = this.resetForm.value.verificationCode ?? '';

    this.authService
      .verifyCode(code)
      .pipe(finalize(() => this.isVerifying.set(false)))
      .subscribe({
        next: () => this.step.set(3),
        error: () => this.toast.show(operations.fail, status.error, messages.invalidToken),
      });
  }

  protected resetPassword(): void {
    const { status, operations } = toastNotifications;
    this.isResettingPassword.set(true);
    const { verificationCode, newPassword } = this.resetForm.value;

    this.authService
      .setPassword(verificationCode ?? '', newPassword ?? '')
      .pipe(finalize(() => this.isResettingPassword.set(false)))
      .subscribe({
        next: () => this.step.set(4),
        error: (err) => this.toast.show(operations.fail, status.error, err.error.message),
      });
  }
}
