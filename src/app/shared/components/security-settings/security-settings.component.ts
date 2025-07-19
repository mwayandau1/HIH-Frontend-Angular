import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Lock, Eye, EyeClosed } from 'lucide-angular';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';
import {
  passwordsMatchValidator,
  mfaValidator,
  customPasswordValidator,
} from '@shared/utils/validators/validators';
import { mfaMethods } from '@shared/constants/mfa';
import { UserProfile } from '@shared/models';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { toastNotifications } from '@shared/constants/toast';

import { SettingsHeadingComponent } from '../settings-heading/settings-heading.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { SlideToggleComponent } from '../slide-toggle/slide-toggle.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [
    LucideAngularModule,
    SettingsHeadingComponent,
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    SlideToggleComponent,
    LoaderComponent,
  ],
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySettingsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly icons = { Lock, Eye, EyeClosed };
  protected readonly mfaMethods = mfaMethods;
  protected readonly checkFieldErrors = checkFieldErrors;

  protected readonly userInfo = signal<UserProfile | null>(null);
  protected readonly isPasswordVisible = signal([false, false, false]);
  protected readonly isEnabled = signal([false, false, false]);
  protected readonly isUpdatingMfa = signal(false);
  protected readonly isUpdatingPassword = signal(false);

  protected readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required, customPasswordValidator()]],
      newPassword: ['', [Validators.required, customPasswordValidator()]],
      confirmPassword: ['', [Validators.required, customPasswordValidator()]],
    },
    { validators: passwordsMatchValidator },
  );

  protected readonly mfaForm = this.fb.group(
    {
      enableMFA: false,
      smsAuth: [{ value: false, disabled: true }],
      emailAuth: [{ value: false, disabled: true }],
    },
    { validators: mfaValidator() },
  );

  protected readonly passwordFormArray = signal(Object.entries(this.passwordForm.controls));
  protected readonly mfaFormArray = signal(Object.entries(this.mfaForm.controls));

  ngOnInit(): void {
    this.userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userInfo.set(user.data);
        this.initMfaForm(user.data);
      });

    this.setupMfaFormListeners();
  }

  private initMfaForm(user: UserProfile): void {
    const { twoFactorEnabled, twoFactorMethod } = user;

    if (!twoFactorEnabled) {
      this.mfaForm.setValue({ enableMFA: false, emailAuth: false, smsAuth: false });
    } else {
      this.mfaForm.patchValue({
        enableMFA: true,
        emailAuth: twoFactorMethod === 'EMAIL',
        smsAuth: twoFactorMethod === 'SMS',
      });
    }
  }

  private setupMfaFormListeners(): void {
    const sms = this.mfaForm.get('smsAuth');
    const email = this.mfaForm.get('emailAuth');

    sms?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((enabled) => {
      if (this.mfaForm.get('enableMFA')?.value && enabled) {
        email?.setValue(false, { emitEvent: false });
      }
    });

    email?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((enabled) => {
      if (this.mfaForm.get('enableMFA')?.value && enabled) {
        sms?.setValue(false, { emitEvent: false });
      }
    });

    this.mfaForm
      .get('enableMFA')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => {
        const controlOps = { emitEvent: false };

        if (enabled) {
          sms?.enable(controlOps);
          email?.enable(controlOps);
        } else {
          sms?.disable(controlOps);
          sms?.setValue(false);
          email?.disable(controlOps);
          email?.setValue(false);
        }

        this.mfaForm.updateValueAndValidity();
      });
  }

  protected handlePasswordVisibility(index: number): void {
    this.isPasswordVisible.update((prev) =>
      prev.map((visible, i) => (i === index ? !visible : visible)),
    );
  }

  protected handleToggleMFA(index: number): void {
    this.isEnabled.update((prev) => prev.map((enabled, i) => (i === index ? !enabled : enabled)));
  }

  protected handleCancel(): void {
    const enableMFA = this.userInfo()?.twoFactorEnabled;
    if (!enableMFA) return this.mfaForm.reset({ enableMFA, smsAuth: false, emailAuth: false });

    const smsAuth = this.userInfo()?.twoFactorMethod === 'SMS';
    const emailAuth = this.userInfo()?.twoFactorMethod === 'EMAIL';

    this.mfaForm.reset({ enableMFA, smsAuth, emailAuth });
  }

  protected handleSavePreference(): void {
    const { operations, messages, status } = toastNotifications;
    this.isUpdatingMfa.set(true);

    const isEnabled = this.mfaForm.value.enableMFA ?? false;
    const method = this.mfaForm.value.emailAuth ? 'EMAIL' : 'SMS';

    let successMessage: string;
    if (!isEnabled) successMessage = messages.disabled;
    else successMessage = this.mfaForm.value.emailAuth ? messages.email : messages.sms;

    this.userService
      .updateMfa(isEnabled, isEnabled ? method : null)
      .pipe(finalize(() => this.isUpdatingMfa.set(false)))
      .subscribe({
        next: () => {
          this.toast.show(operations.mfa, status.success, successMessage);
        },
        error: () => this.toast.show(operations.mfa, status.error, operations.fail),
      });
  }

  protected handlChangePassword(): void {
    this.isUpdatingPassword.set(true);
    const { operations, messages, status } = toastNotifications;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (!currentPassword || !newPassword || !confirmPassword) return;

    this.userService
      .changeUserPassword({ currentPassword, newPassword, confirmPassword })
      .pipe(finalize(() => this.isUpdatingPassword.set(false)))
      .subscribe({
        next: () =>
          this.toast.show(operations.credentialChange, status.success, messages.credentialChange),
        error: () => this.toast.show(operations.credentialChange, status.error, operations.fail),
      });
  }

  protected formatCamelCase(input: string): string {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (match) => match.toUpperCase());
  }
}
