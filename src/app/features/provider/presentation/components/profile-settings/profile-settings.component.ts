import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsHeadingComponent } from '@shared/components/settings-heading/settings-heading.component';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { ToastService } from '@core/services/toast/toast.service';
import { UserService } from '@core/services/user/user.service';
import { toastNotifications } from '@shared/constants/toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ProivderInfo, UserProfile } from '@shared/models';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ThemedLoaderComponent } from '@shared/components/themed-loader/themed-loader.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    LucideAngularModule,
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    SettingsHeadingComponent,
    LoaderComponent,
    ThemedLoaderComponent,
  ],
  templateUrl: './profile-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly userInfo = signal<UserProfile | null>(null);
  protected readonly isUpdatingInfo = signal(false);
  protected readonly isFetchingUserData = signal(false);
  protected readonly icons = { User };
  protected readonly checkFieldErrors = checkFieldErrors;
  protected readonly profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
    department: [{ value: '', disabled: true }],
    licenseNumber: [{ value: 'MD12345678', disabled: true }],
    bio: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  private fetchUserProfile(): void {
    this.isFetchingUserData.set(true);
    const { operations, status, messages } = toastNotifications;

    this.userService
      .getUserInfo()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetchingUserData.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.userInfo.set(response.data);
          this.initializeForm(response.data);
        },
        error: () => {
          this.toast.show(operations.fetch, status.error, messages.loadFailure);
        },
      });
  }

  private initializeForm(provider: UserProfile): void {
    const { firstName, lastName, email, phoneNumber, bio, title, department, licenseNumber } =
      provider;

    this.profileForm.setValue({
      fullName: firstName + ' ' + lastName,
      title,
      email,
      phoneNumber,
      department,
      licenseNumber,
      bio,
    });
  }

  protected onSubmit(): void {
    const { operations, messages, status } = toastNotifications;

    if (this.profileForm.invalid) return;

    this.isUpdatingInfo.set(true);
    const formValue = this.getSanitizedFormValue();

    if (!formValue) return;

    this.userService
      .updateUserInfo(formValue)
      .pipe(finalize(() => this.isUpdatingInfo.set(false)))
      .subscribe({
        next: () => this.toast.show(operations.update, status.success, messages.profileUpdated),
        error: () => this.toast.show(operations.fail, status.error),
      });
  }

  private getSanitizedFormValue(): ProivderInfo {
    const formData = this.profileForm.getRawValue();
    const user = this.userInfo();

    return {
      firstName: formData.fullName?.split(' ')[0] ?? '',
      lastName: formData.fullName?.split(' ')[1] ?? '',
      title: formData.title ?? '',
      email: user?.email ?? '',
      phoneNumber: formData.phoneNumber ?? '',
      department: user?.department ?? '',
      licenseNumber: user?.licenseNumber ?? '',
      bio: formData.bio ?? '',
      profilePictureUrl: '',
    };
  }

  protected handleCancel(): void {
    const user = this.userInfo();
    if (!user) return;

    this.initializeForm(user);
  }
}
