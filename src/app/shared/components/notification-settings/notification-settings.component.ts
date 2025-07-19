import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Bell } from 'lucide-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NotificationService } from '@core/services/notification/notification.service';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';
import {
  NotificationChannel,
  NotificationSettingsData,
  NotificationSettingsRequest,
  NotificationType,
} from '@shared/models/notifications';
import {
  getNotificationLabel,
  mapNotificationTypeToFormControl,
} from '@shared/utils/helpers/notifications';
import { SlideToggleComponent } from '../slide-toggle/slide-toggle.component';
import { ButtonComponent } from '../button/button.component';
import { SettingsHeadingComponent } from '../settings-heading/settings-heading.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-settings.component.html',
  imports: [
    LucideAngularModule,
    SlideToggleComponent,
    ButtonComponent,
    ReactiveFormsModule,
    SettingsHeadingComponent,
    LoaderComponent,
  ],
})
export class NotificationSettingsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly icons = { Bell };
  protected readonly getNotificationLabel = getNotificationLabel;
  protected readonly isUpdating = signal(false);
  protected readonly userPreferences = signal<NotificationSettingsData | null>(null);
  protected readonly notificationForm = signal(this.fb.group({}));
  protected readonly userDefaults = signal<Record<string, boolean>>({});
  protected readonly updateRequest = signal<NotificationSettingsRequest[]>([]);

  ngOnInit(): void {
    this.notificationService.getUserNotifications().subscribe(({ data }) => {
      this.userPreferences.set(data);
      this.buildForm(data);
      this.userDefaults.set(this.notificationForm().value);
    });
  }

  private buildForm(preferences: NotificationSettingsData): void {
    const controls: Record<string, FormControl<boolean>> = {};

    const createControl = (type: NotificationType, isEmail: boolean, enabled: boolean): void => {
      const key = mapNotificationTypeToFormControl(type, isEmail);
      if (!key) return;

      const control = new FormControl(enabled) as FormControl<boolean>;
      controls[key] = control;

      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
        const change: NotificationSettingsRequest = {
          channel: isEmail ? NotificationChannel.EMAIL : NotificationChannel.SMS,
          type,
          enabled: value ?? false,
        };

        this.updateRequest.update((prev) => [...prev, change]);
      });
    };

    preferences.EMAIL?.forEach(({ type, enabled }) => createControl(type, true, enabled));
    preferences.SMS?.forEach(({ type, enabled }) => createControl(type, false, enabled));

    this.notificationForm.set(this.fb.group(controls));
  }

  protected returnControl(type: NotificationType, isEmail: boolean): FormControl {
    const controlName = mapNotificationTypeToFormControl(type, isEmail) ?? '';
    return this.notificationForm().get(controlName) as FormControl;
  }

  protected onSubmit(): void {
    this.isUpdating.set(true);
    const { operations, messages, status } = toastNotifications;

    this.notificationService
      .updateUserPreference(this.updateRequest())
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: () => this.toast.show(operations.update, status.success, messages.settingsUpdated),
        error: () => this.toast.show(operations.fail, status.error, operations.fail),
      });
  }

  protected handleCancel(): void {
    this.notificationForm().reset(this.userDefaults());
  }
}
