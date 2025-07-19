import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecuritySettingsComponent } from './security-settings.component';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';
import { of, throwError } from 'rxjs';
import { UserRole } from '@shared/models/userRoles';
import { ReactiveFormsModule } from '@angular/forms';
import { Gender, UserProfile, UserResponse } from '@shared/models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const mockUserInfo: UserProfile = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: new Date().toISOString(),
  gender: Gender.Male,
  phoneNumber: '+1234567890',
  profilePictureUrl: '',
  bio: '',
  title: '',
  department: '',
  licenseNumber: '',
  residentialAddress: '123 Street',
  twoFactorEnabled: true,
  twoFactorMethod: 'EMAIL',
  roles: [],
};

describe('SecuritySettingsComponent', () => {
  let component: SecuritySettingsComponent;
  let fixture: ComponentFixture<SecuritySettingsComponent>;
  let userService: jest.Mocked<UserService>;
  let toastService: jest.Mocked<ToastService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SecuritySettingsComponent],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserInfo: jest.fn(() => of({ data: mockUserInfo })),
            updateMfa: jest.fn(() => of(void 0)),
            changeUserPassword: jest.fn(() => of(void 0)),
          },
        },
        {
          provide: ToastService,
          useValue: {
            show: jest.fn(),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SecuritySettingsComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and populate user info on init', () => {
    expect(component['userInfo']()).toEqual(mockUserInfo);
    expect(component['mfaForm'].getRawValue()).toMatchObject({
      enableMFA: true,
      emailAuth: true,
      smsAuth: false,
    });
  });

  it('should initialize MFA form with disabled state when twoFactorEnabled is false', () => {
    const userWithMfaDisabled: UserProfile = {
      ...mockUserInfo,
      twoFactorEnabled: false,
      twoFactorMethod: 'EMAIL',
    };

    const mockResponse: UserResponse = {
      success: true,
      message: 'Success',
      timestamp: new Date().toISOString(),
      data: userWithMfaDisabled,
    };

    userService.getUserInfo.mockReturnValue(of(mockResponse));
    fixture = TestBed.createComponent(SecuritySettingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userRole', UserRole.Admin);
    fixture.detectChanges();

    expect(component['mfaForm'].getRawValue()).toMatchObject({
      enableMFA: false,
      emailAuth: false,
      smsAuth: false,
    });
    expect(component['mfaForm'].get('emailAuth')?.disabled).toBe(true);
    expect(component['mfaForm'].get('smsAuth')?.disabled).toBe(true);
  });

  it('should toggle enabled state for the specified index', () => {
    expect(component['isEnabled']()).toEqual([false, false, false]);

    component['handleToggleMFA'](0);
    expect(component['isEnabled']()).toEqual([true, false, false]);

    component['handleToggleMFA'](1);
    expect(component['isEnabled']()).toEqual([true, true, false]);

    component['handleToggleMFA'](0);
    expect(component['isEnabled']()).toEqual([false, true, false]);
  });

  it('should disable MFA', () => {
    component['mfaForm'].patchValue({ enableMFA: false });
    component['handleSavePreference']();

    expect(userService.updateMfa).toHaveBeenCalledWith(false, null);
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should enable MFA with EMAIL', () => {
    component['mfaForm'].patchValue({ enableMFA: true, emailAuth: true });
    component['handleSavePreference']();

    expect(userService.updateMfa).toHaveBeenCalledWith(true, 'EMAIL');
  });

  it('should enable MFA with SMS', () => {
    component['mfaForm'].patchValue({ enableMFA: true, smsAuth: true });
    component['handleSavePreference']();

    expect(userService.updateMfa).toHaveBeenCalledWith(true, 'SMS');
  });

  it('should show error toast on MFA update failure', () => {
    jest.spyOn(userService, 'updateMfa').mockReturnValueOnce(throwError(() => new Error()));
    component['mfaForm'].patchValue({ enableMFA: true, emailAuth: true });
    component['handleSavePreference']();

    expect(toastService.show).toHaveBeenCalled();
  });

  it('should change password', () => {
    component['passwordForm'].setValue({
      currentPassword: 'Old123!',
      newPassword: 'New123!',
      confirmPassword: 'New123!',
    });
    component['handlChangePassword']();

    expect(userService.changeUserPassword).toHaveBeenCalled();
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should show error toast on password change failure', () => {
    jest
      .spyOn(userService, 'changeUserPassword')
      .mockReturnValueOnce(throwError(() => new Error()));
    component['passwordForm'].setValue({
      currentPassword: 'Old123!',
      newPassword: 'New123!',
      confirmPassword: 'New123!',
    });
    component['handlChangePassword']();

    expect(toastService.show).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    component['handlePasswordVisibility'](0);
    expect(component['isPasswordVisible']()).toEqual([true, false, false]);
  });

  it('should cancel MFA and reset to user values', () => {
    component['handleCancel']();
    expect(component['mfaForm'].value).toMatchObject({
      enableMFA: true,
      emailAuth: true,
      smsAuth: false,
    });
  });
});
