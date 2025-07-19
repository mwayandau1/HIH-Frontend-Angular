import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileSettingsComponent } from './profile-settings.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { providerInfo } from '@shared/constants/userProfile';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;
  let mockUserService: jest.Mocked<UserService>;
  let mockToastService: jest.Mocked<ToastService>;

  beforeEach(async () => {
    mockUserService = {
      getUserInfo: jest.fn(),
      updateUserInfo: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    mockToastService = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    const mockUserData = {
      data: {
        firstName: providerInfo.fullName.split(' ')[0],
        lastName: providerInfo.fullName.split(' ')[1],
        email: providerInfo.email,
        phoneNumber: providerInfo.phoneNumber,
        bio: providerInfo.professionalBio,
        title: providerInfo.title,
        department: providerInfo.department,
        licenseNumber: providerInfo.licenseNumber,
        profilePictureUrl: '',
      },
    };
    mockUserService.getUserInfo.mockReturnValue(of(mockUserData));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        ProfileSettingsComponent,
        InputComponent,
        ButtonComponent,
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with userInfo values', () => {
    expect(component['profileForm'].getRawValue()).toEqual({
      fullName: providerInfo.fullName,
      title: providerInfo.title,
      email: providerInfo.email,
      department: providerInfo.department,
      licenseNumber: providerInfo.licenseNumber,
      phoneNumber: providerInfo.phoneNumber,
      bio: providerInfo.professionalBio,
    });
  });

  it('should have disabled email, department and licenseNumber fields', () => {
    expect(component['profileForm'].get('email')?.disabled).toBe(true);
    expect(component['profileForm'].get('department')?.disabled).toBe(true);
    expect(component['profileForm'].get('licenseNumber')?.disabled).toBe(true);
  });

  describe('Form Validation', () => {
    it('should require fullName', () => {
      const control = component['profileForm'].get('fullName');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate fullName min length', () => {
      const control = component['profileForm'].get('fullName');
      control?.setValue('ab');
      expect(control?.hasError('minlength')).toBe(true);
      control?.setValue('abc');
      expect(control?.hasError('minlength')).toBe(false);
    });

    it('should require title', () => {
      const control = component['profileForm'].get('title');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate title min length', () => {
      const control = component['profileForm'].get('title');
      control?.setValue('ab');
      expect(control?.hasError('minlength')).toBe(true);
      control?.setValue('abc');
      expect(control?.hasError('minlength')).toBe(false);
    });

    it('should require phoneNumber', () => {
      const control = component['profileForm'].get('phoneNumber');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate phoneNumber pattern', () => {
      const control = component['profileForm'].get('phoneNumber');
      control?.setValue('invalid');
      expect(control?.hasError('pattern')).toBe(true);
      control?.setValue('+1234567890');
      expect(control?.hasError('pattern')).toBe(false);
    });

    it('should require bio', () => {
      const control = component['profileForm'].get('bio');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate bio min length', () => {
      const control = component['profileForm'].get('bio');

      control?.setValue('short');
      expect(control?.hasError('minlength')).toBe(true);

      control?.setValue('12345678');
      expect(control?.hasError('minlength')).toBe(false);

      control?.setValue('this is a valid bio that is long enough');
      expect(control?.hasError('minlength')).toBe(false);
    });

    it('should handle error when fetching user profile fails', () => {
      mockUserService.getUserInfo.mockReturnValue(throwError(() => new Error('Failed to fetch')));

      const toastSpy = jest.spyOn(mockToastService, 'show');

      component['fetchUserProfile']();

      expect(component['isFetchingUserData']()).toBe(false);

      expect(toastSpy).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(String));
    });
  });

  describe('handleCancel', () => {
    it('should reset form to initial values', () => {
      component['profileForm'].get('fullName')?.setValue('New Name');
      component['profileForm'].get('title')?.setValue('New Title');
      component['profileForm'].get('phoneNumber')?.setValue('+9876543210');
      component['profileForm'].get('bio')?.setValue('New bio');

      component['handleCancel']();

      expect(component['profileForm'].getRawValue()).toEqual({
        fullName: providerInfo.fullName,
        title: providerInfo.title,
        email: providerInfo.email,
        department: providerInfo.department,
        licenseNumber: providerInfo.licenseNumber,
        phoneNumber: providerInfo.phoneNumber,
        bio: providerInfo.professionalBio,
      });
      expect(component['profileForm'].pristine).toBe(true);
    });
  });

  it('should render all form fields', () => {
    const formFields = fixture.debugElement.queryAll(By.css('app-input'));
    const textAreas = fixture.debugElement.queryAll(By.css('textarea'));
    expect(formFields.length).toBe(6);
    expect(textAreas.length).toBe(1);
  });

  describe('onSubmit', () => {
    it('should update user info when form is valid', fakeAsync(() => {
      const updateSubject = new Subject<void>();
      mockUserService.updateUserInfo.mockReturnValue(updateSubject.asObservable());

      component['onSubmit']();

      expect(component['isUpdatingInfo']()).toBe(true);

      updateSubject.next();
      updateSubject.complete();
      tick();

      expect(mockUserService.updateUserInfo).toHaveBeenCalledWith({
        firstName: providerInfo.fullName.split(' ')[0],
        lastName: providerInfo.fullName.split(' ')[1],
        title: providerInfo.title,
        email: providerInfo.email,
        phoneNumber: providerInfo.phoneNumber,
        department: providerInfo.department,
        licenseNumber: providerInfo.licenseNumber,
        bio: providerInfo.professionalBio,
        profilePictureUrl: '',
      });

      expect(component['isUpdatingInfo']()).toBe(false);
    }));

    it('should handle error when update fails', () => {
      mockUserService.updateUserInfo.mockReturnValue(throwError(() => new Error('Failed')));

      component['onSubmit']();

      expect(mockToastService.show).toHaveBeenCalledWith(expect.any(String), 'error');
    });

    it('should not proceed if form value is invalid', () => {
      component['profileForm'].get('fullName')?.setValue('');
      component['profileForm'].get('title')?.setValue('');
      component['profileForm'].get('phoneNumber')?.setValue('');
      component['profileForm'].get('bio')?.setValue('');

      component['profileForm'].markAllAsTouched();

      expect(component['profileForm'].valid).toBe(false);

      component['onSubmit']();

      expect(mockUserService.updateUserInfo).not.toHaveBeenCalled();
    });

    it('should not proceed if getSanitizedFormValue returns falsy', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(component as any, 'getSanitizedFormValue').mockReturnValue(null);
      component['onSubmit']();
      expect(mockUserService.updateUserInfo).not.toHaveBeenCalled();
    });

    it('should handle error case properly in subscription', fakeAsync(() => {
      const errorSubject = new Subject<void>();
      mockUserService.updateUserInfo.mockReturnValue(errorSubject.asObservable());

      component['onSubmit']();
      errorSubject.error(new Error('Update failed'));
      tick();

      expect(mockToastService.show).toHaveBeenCalledWith(expect.any(String), 'error');
      expect(component['isUpdatingInfo']()).toBe(false);
    }));

    it('should handle undefined userInfo', () => {
      component['profileForm'].reset();
      component['userInfo'].set(null);

      const result = component['getSanitizedFormValue']();

      expect(result).toEqual({
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phoneNumber: '',
        department: '',
        licenseNumber: '',
        bio: '',
        profilePictureUrl: '',
      });
    });
  });

  describe('getSanitizedFormValue', () => {
    it('should return sanitized form values', () => {
      component['profileForm'].get('fullName')?.setValue('New Name');
      component['profileForm'].get('phoneNumber')?.setValue('+9876543210');
      component['profileForm'].get('bio')?.setValue('New bio');

      const result = component['getSanitizedFormValue']();

      expect(result).toEqual({
        firstName: 'New',
        lastName: 'Name',
        title: providerInfo.title,
        email: providerInfo.email,
        phoneNumber: '+9876543210',
        department: providerInfo.department,
        licenseNumber: providerInfo.licenseNumber,
        bio: 'New bio',
        profilePictureUrl: '',
      });
    });

    it('should handle empty values', () => {
      component['profileForm'].reset();

      const result = component['getSanitizedFormValue']();

      expect(result).toEqual({
        firstName: '',
        lastName: '',
        title: '',
        email: providerInfo.email,
        phoneNumber: '',
        department: providerInfo.department,
        licenseNumber: providerInfo.licenseNumber,
        bio: '',
        profilePictureUrl: '',
      });
    });
  });
});
