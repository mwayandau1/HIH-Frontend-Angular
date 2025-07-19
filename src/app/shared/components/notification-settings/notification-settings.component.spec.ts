import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NotificationSettingsComponent } from './notification-settings.component';
import { ButtonComponent } from '../button/button.component';
import { SlideToggleComponent } from '../slide-toggle/slide-toggle.component';
import { SettingsHeadingComponent } from '../settings-heading/settings-heading.component';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '@core/services/notification/notification.service';
import { of, Subject } from 'rxjs';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';

describe('NotificationSettingsComponent', () => {
  let component: NotificationSettingsComponent;
  let fixture: ComponentFixture<NotificationSettingsComponent>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let toastServiceMock: jest.Mocked<ToastService>;

  const mockNotificationData = {
    EMAIL: [
      { type: 'APPOINTMENT_REMINDER', enabled: true },
      { type: 'PRESCRIPTION_REFILL', enabled: true },
    ],
    SMS: [
      { type: 'APPOINTMENT_REMINDER', enabled: false },
      { type: 'PRESCRIPTION_REFILL', enabled: false },
    ],
  };

  beforeEach(async () => {
    notificationServiceMock = {
      getUserNotifications: jest.fn().mockReturnValue(of({ data: mockNotificationData })),
      updateUserPreference: jest.fn().mockReturnValue(of(void 0)),
    } as unknown as jest.Mocked<NotificationService>;

    toastServiceMock = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        NotificationSettingsComponent,
        ButtonComponent,
        SlideToggleComponent,
        SettingsHeadingComponent,
      ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call getUserNotifications on init', () => {
      expect(notificationServiceMock.getUserNotifications).toHaveBeenCalled();
    });

    it('should initialize form with data from service', () => {
      expect(component['notificationForm']()).toBeTruthy();
      expect(component['userPreferences']()).toEqual(mockNotificationData);
    });
  });

  describe('Form building', () => {
    it('should create form controls for all notification types', () => {
      const form = component['notificationForm']();
      expect(form.get('notifyByEmailAppointments')).toBeTruthy();
      expect(form.get('notifyBySMSAppointments')).toBeTruthy();
      expect(form.get('notifyByEmailRefills')).toBeTruthy();
      expect(form.get('notifyBySMSRefills')).toBeTruthy();
    });

    it('should set correct initial values from service data', () => {
      const form = component['notificationForm']();
      expect(form.get('notifyByEmailAppointments')?.value).toBe(true);
      expect(form.get('notifyBySMSAppointments')?.value).toBe(false);
    });

    it('should use false as default when control value is null', () => {
      const testData = {
        EMAIL: [{ type: 'APPOINTMENT_REMINDER', enabled: true }],
        SMS: [],
      };

      component['buildForm'](testData);

      const control = component['returnControl']('APPOINTMENT_REMINDER', true);
      control.setValue(null);

      expect(component['updateRequest']()).toContainEqual({
        channel: 'EMAIL',
        type: 'APPOINTMENT_REMINDER',
        enabled: false,
      });
    });
  });

  describe('Control access', () => {
    it('should return correct form control for type and channel', () => {
      const control = component['returnControl']('APPOINTMENT_REMINDER', true);
      expect(control).toBeInstanceOf(FormControl);
      expect(control.value).toBe(true);
    });

    it('should return null for unknown notification types', () => {
      const control = component['returnControl']('UNKNOWN_TYPE', true);
      expect(control).toBeNull();
    });
  });

  describe('Form submission', () => {
    let updateSubject: Subject<void>;

    beforeEach(() => {
      updateSubject = new Subject<void>();
      notificationServiceMock.updateUserPreference.mockReturnValue(updateSubject.asObservable());
    });

    it('should handle error during submission', () => {
      component['onSubmit']();

      updateSubject.error(new Error('Update failed'));

      expect(component['isUpdating']()).toBe(false);
      expect(toastServiceMock.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.operations.fail,
      );
    });

    it('should reset isUpdating flag on error', () => {
      expect(component['isUpdating']()).toBe(false);
      component['onSubmit']();
      expect(component['isUpdating']()).toBe(true);

      updateSubject.error(new Error('Update failed'));

      expect(component['isUpdating']()).toBe(false);
    });

    it('should call updateUserPreference with changes when form is submitted', () => {
      const form = component['notificationForm']();
      form.get('notifyByEmailAppointments')?.setValue(false);

      component['onSubmit']();

      expect(notificationServiceMock.updateUserPreference).toHaveBeenCalledWith([
        { channel: 'EMAIL', type: 'APPOINTMENT_REMINDER', enabled: false },
      ]);
    });

    it('should show success toast on successful update', () => {
      component['onSubmit']();

      updateSubject.next();

      expect(toastServiceMock.show).toHaveBeenCalledWith(
        toastNotifications.operations.update,
        toastNotifications.status.success,
        toastNotifications.messages.settingsUpdated,
      );
    });

    it('should set isUpdating flag during submission', () => {
      notificationServiceMock.updateUserPreference.mockReturnValue(updateSubject.asObservable());

      expect(component['isUpdating']()).toBe(false);
      component['onSubmit']();

      expect(component['isUpdating']()).toBe(true);

      updateSubject.complete();

      expect(component['isUpdating']()).toBe(false);
    });
  });

  describe('Form cancellation', () => {
    it('should reset form to initial values on cancel', () => {
      const form = component['notificationForm']();
      form.get('notifyByEmailAppointments')?.setValue(false);
      expect(form.get('notifyByEmailAppointments')?.value).toBe(false);

      component['handleCancel']();

      expect(form.get('notifyByEmailAppointments')?.value).toBe(true);
    });

    it('should mark form as pristine after cancel', () => {
      const form = component['notificationForm']();
      form.get('notifyByEmailAppointments')?.setValue(false);
      form.markAsDirty();
      expect(form.dirty).toBe(true);

      component['handleCancel']();

      expect(form.pristine).toBe(true);
    });
  });

  describe('Template binding', () => {
    it('should render correct number of toggle switches', () => {
      const compiled = fixture.nativeElement;
      const toggles = compiled.querySelectorAll('app-slide-toggle');
      expect(toggles.length).toBeGreaterThan(0);
    });

    it('should disable save button when form is pristine', () => {
      const compiled = fixture.nativeElement;
      const saveButton = compiled.querySelector('app-button[title="Save Changes"]');
      expect(saveButton.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should enable save button when form is dirty', () => {
      const form = component['notificationForm']();
      form.get('notifyByEmailAppointments')?.setValue(false);
      form.markAsDirty();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const saveButton = compiled.querySelector('app-button[title="Save Changes"]');
      expect(saveButton.getAttribute('ng-reflect-disabled')).toBe('false');
    });
  });
});
