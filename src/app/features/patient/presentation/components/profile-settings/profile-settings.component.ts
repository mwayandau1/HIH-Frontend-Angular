import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { LucideAngularModule, User } from 'lucide-angular';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { SettingsHeadingComponent } from '@shared/components/settings-heading/settings-heading.component';
import { DatePickerComponent } from '@shared/components/datepicker/datepicker.component';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';
import { Gender, PatientInfo, UserProfile } from '@shared/models';
import { formatDate } from '@shared/utils/helpers/dates';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { toastNotifications } from '@shared/constants/toast';
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
    DatePickerComponent,
    LoaderComponent,
    ThemedLoaderComponent,
  ],
  templateUrl: './profile-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isUpdatingInfo = signal(false);
  protected readonly isFetchingUserData = signal(false);
  protected readonly userInfo = signal<UserProfile | null>(null);
  protected readonly icons = { User };
  protected readonly checkFieldErrors = checkFieldErrors;
  protected readonly profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    dateOfBirth: [''],
    gender: [Gender.Null],
    email: [{ value: '', disabled: true }],
    phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
    residentialAddress: ['', [Validators.minLength(3)]],
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

  private initializeForm(user: UserProfile): void {
    const { firstName, lastName, dateOfBirth, gender, email, phoneNumber, residentialAddress } =
      user;

    this.profileForm.setValue({
      firstName,
      lastName,
      dateOfBirth: formatDate(dateOfBirth),
      gender,
      email,
      phoneNumber,
      residentialAddress,
    });
  }

  protected onSubmit(): void {
    const { operations, messages, status } = toastNotifications;

    this.isUpdatingInfo.set(true);
    const formValue = this.getSanitizedFormValue();

    this.userService
      .updateUserInfo(formValue)
      .pipe(finalize(() => this.isUpdatingInfo.set(false)))
      .subscribe({
        next: () => this.toast.show(operations.update, status.success, messages.profileUpdated),
        error: () => this.toast.show(operations.fail, status.error),
      });
  }

  private getSanitizedFormValue(): PatientInfo {
    const formData = this.profileForm.getRawValue();
    const email = this.userInfo()?.email ?? '';

    const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : '';

    return {
      firstName: formData.firstName ?? '',
      lastName: formData.lastName ?? '',
      dateOfBirth,
      gender: formData.gender as Gender,
      email,
      phoneNumber: formData.phoneNumber ?? '',
      residentialAddress: formData.residentialAddress ?? '',
      profilePictureUrl: '',
    };
  }
  protected handleCancel(): void {
    const user = this.userInfo();
    if (!user) return;

    this.initializeForm(user);
  }
}
