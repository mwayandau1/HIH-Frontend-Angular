import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileSettingsComponent } from './profile-settings.component';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';
import { of, throwError } from 'rxjs';
import { UserProfile, Gender } from '@shared/models';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const mockUserProfile: UserProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: Gender.Male,
  email: 'john.doe@example.com',
  phoneNumber: '+1234567890',
  residentialAddress: '123 Main St',
  twoFactorEnabled: false,
  twoFactorMethod: 'EMAIL',
  title: '',
  department: '',
  licenseNumber: '',
  roles: [],
  bio: '',
  profilePictureUrl: '',
};

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;
  let userService: jest.Mocked<UserService>;
  let toastService: jest.Mocked<ToastService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ProfileSettingsComponent],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserInfo: jest.fn(() => of({ data: mockUserProfile })),
            updateUserInfo: jest.fn(() => of(mockUserProfile)),
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

    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user profile on init', () => {
    expect(userService.getUserInfo).toHaveBeenCalled();
    expect(component['userInfo']()).toEqual(mockUserProfile);
  });

  it('should initialize form with user data', () => {
    expect(component['profileForm'].getRawValue()).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: expect.any(String),
      gender: Gender.Male,
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      residentialAddress: '123 Main St',
    });
  });

  it('should handle profile fetch error', () => {
    userService.getUserInfo.mockReturnValueOnce(throwError(() => new Error('Failed')));
    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(toastService.show).toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    component['profileForm'].patchValue({
      firstName: '',
      lastName: '',
    });

    expect(component['profileForm'].valid).toBeFalsy();
    expect(component['profileForm'].controls.firstName.errors).toBeTruthy();
    expect(component['profileForm'].controls.lastName.errors).toBeTruthy();
  });

  it('should validate phone number format', () => {
    component['profileForm'].patchValue({ phoneNumber: 'invalid' });
    expect(component['profileForm'].controls.phoneNumber.errors).toBeTruthy();

    component['profileForm'].patchValue({ phoneNumber: '+1234567890' });
    expect(component['profileForm'].controls.phoneNumber.errors).toBeNull();
  });

  it('should sanitize form values before submission', () => {
    const formValue = component['getSanitizedFormValue']();
    expect(formValue).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: expect.any(String),
      gender: Gender.Male,
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      residentialAddress: '123 Main St',
      profilePictureUrl: '',
    });
  });

  it('should submit valid form', () => {
    component['onSubmit']();
    expect(userService.updateUserInfo).toHaveBeenCalled();
    expect(toastService.show).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
    );
  });

  it('should handle update error', () => {
    userService.updateUserInfo.mockReturnValueOnce(throwError(() => new Error('Failed')));
    component['onSubmit']();
    expect(toastService.show).toHaveBeenCalled();
  });

  it('should reset form on cancel', () => {
    component['profileForm'].patchValue({ firstName: 'Modified' });
    component['handleCancel']();
    expect(component['profileForm'].value.firstName).toBe('John');
  });

  it('should disable submit button when form is invalid', () => {
    component['profileForm'].patchValue({ firstName: '' });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('should handle null user info on cancel', () => {
    component['userInfo'].set(null);
    component['handleCancel']();
  });

  it('should return sanitized form values with all required fields', () => {
    component['profileForm'].patchValue({
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2000-01-01',
      gender: Gender.Female,
      phoneNumber: '+9876543210',
      residentialAddress: '456 Test St',
    });

    const result = component['getSanitizedFormValue']();

    expect(result).toEqual({
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('2000-01-01').toISOString(),
      gender: Gender.Female,
      email: 'john.doe@example.com',
      phoneNumber: '+9876543210',
      residentialAddress: '456 Test St',
      profilePictureUrl: '',
    });
  });

  it('should handle empty values with fallbacks', () => {
    component['profileForm'].reset({
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      gender: null,
      phoneNumber: null,
      residentialAddress: null,
    });

    const result = component['getSanitizedFormValue']();

    expect(result).toEqual({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: null,
      email: 'john.doe@example.com',
      phoneNumber: '',
      residentialAddress: '',
      profilePictureUrl: '',
    });
  });

  it('should preserve disabled email field value', () => {
    const result = component['getSanitizedFormValue']();
    expect(result.email).toBe('john.doe@example.com');
  });
});
