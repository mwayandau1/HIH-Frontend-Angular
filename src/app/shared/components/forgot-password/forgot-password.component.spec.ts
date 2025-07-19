import { render, screen } from '@testing-library/angular';
import { ForgotPasswordComponent } from './forgot-password.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { FormBuilder } from '@angular/forms';
import { ToastService } from '@core/services/toast/toast.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { toastNotifications } from '@shared/constants/toast';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth/auth.service';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  const setup = async () => {
    const mockToastService = {
      show: jest.fn(),
    };

    const mockAuthService = {
      sendVerificationCode: jest.fn().mockReturnValue(of({})),
      verifyCode: jest.fn().mockReturnValue(of({})),
      setPassword: jest.fn().mockReturnValue(of({})),
    };

    return await render(ForgotPasswordComponent, {
      imports: [InputComponent, ButtonComponent, LucideAngularModule],
      providers: [
        FormBuilder,
        { provide: ToastService, useValue: mockToastService },
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(),
      ],
      componentProperties: {
        changeDetection: ChangeDetectionStrategy.OnPush,
      },
    });
  };

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize with step 1', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance['step']()).toBe(1);
  });

  it('should have password visibility initially hidden', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance['isFirstPasswordVisible']()).toBe(false);
    expect(fixture.componentInstance['isSecondPasswordVisible']()).toBe(false);
  });

  describe('sendCode', () => {
    it('should handle error when sending verification code fails', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);
      const toastService = fixture.debugElement.injector.get(ToastService);

      const errorResponse = { error: { message: 'Failed to send code' } };
      jest
        .spyOn(authService, 'sendVerificationCode')
        .mockReturnValue(throwError(() => errorResponse));

      component['resetForm'].controls.email.setValue('valid@example.com');

      component['sendCode']();
      await fixture.whenStable();

      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        'Failed to send code',
      );
      expect(component['isSendingVerificationCode']()).toBe(false);
      expect(component['step']()).toBe(1);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle first password visibility when position is "first"', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      expect(component['isFirstPasswordVisible']()).toBe(false);

      component['togglePasswordVisibility']('first');
      expect(component['isFirstPasswordVisible']()).toBe(true);

      component['togglePasswordVisibility']('first');
      expect(component['isFirstPasswordVisible']()).toBe(false);
    });

    it('should toggle second password visibility when position is not "first"', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      expect(component['isSecondPasswordVisible']()).toBe(false);

      component['togglePasswordVisibility']('second');
      expect(component['isSecondPasswordVisible']()).toBe(true);

      component['togglePasswordVisibility']('other');
      expect(component['isSecondPasswordVisible']()).toBe(false);
    });
  });

  describe('isCurrentStepInvalid', () => {
    it('should return false for unknown step numbers', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['step'].set(99);
      expect(component['isCurrentStepInvalid']()).toBe(false);
    });
  });

  describe('Step 1: Email Input', () => {
    it('should show email field in step 1', async () => {
      await setup();
      expect(screen.getByTestId('email-field')).toBeInTheDocument();
    });

    it('should not advance to step 2 if email is invalid', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['advanceStep']();
      expect(component['step']()).toBe(1);

      component['resetForm'].controls.email.setValue('invalid-email');
      component['advanceStep']();
      expect(component['step']()).toBe(1);
    });

    it('should advance to step 2 when email is valid', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['resetForm'].controls.email.setValue('valid@example.com');
      component['advanceStep']();
      fixture.detectChanges();

      expect(component['step']()).toBe(2);
    });
  });

  describe('Step 2: Verification Code', () => {
    it('should verify code and advance to step 3 when successful', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);

      component['resetForm'].controls.email.setValue('valid@example.com');
      component['advanceStep']();
      await fixture.whenStable();

      component['resetForm'].controls.verificationCode.setValue('123456');
      component['advanceStep']();
      await fixture.whenStable();

      expect(authService.verifyCode).toHaveBeenCalledWith('123456');
      expect(component['step']()).toBe(3);
    });

    it('should show error toast when verification fails', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);
      const toastService = fixture.debugElement.injector.get(ToastService);

      jest
        .spyOn(authService, 'verifyCode')
        .mockReturnValue(throwError(() => new Error('Invalid code')));

      component['resetForm'].controls.email.setValue('valid@example.com');
      component['advanceStep']();
      await fixture.whenStable();

      component['resetForm'].controls.verificationCode.setValue('123456');
      component['advanceStep']();
      await fixture.whenStable();

      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.invalidToken,
      );
      expect(component['step']()).toBe(2);
    });
  });

  describe('Step 3: Password Reset', () => {
    it('should reset password and advance to step 4 when successful', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);

      component['resetForm'].controls.email.setValue('valid@example.com');
      component['advanceStep']();
      await fixture.whenStable();

      component['resetForm'].controls.verificationCode.setValue('123456');
      component['advanceStep']();
      await fixture.whenStable();

      component['resetForm'].controls.newPassword.setValue('exactly12!!!!');
      component['resetForm'].controls.confirmPassword.setValue('exactly12!!!!');
      component['advanceStep']();
      await fixture.whenStable();

      expect(authService.setPassword).toHaveBeenCalledWith('123456', 'exactly12!!!!');
      expect(component['step']()).toBe(4);
    });

    it('should show error toast when password reset fails', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);
      const toastService = fixture.debugElement.injector.get(ToastService);

      jest
        .spyOn(authService, 'setPassword')
        .mockReturnValue(throwError(() => ({ error: { message: 'Reset failed' } })));

      component['resetForm'].controls.email.setValue('valid@example.com');
      component['advanceStep']();
      await fixture.whenStable();

      component['resetForm'].controls.verificationCode.setValue('123456');
      component['advanceStep']();
      await fixture.whenStable();

      component['resetForm'].controls.newPassword.setValue('exactly12!!!!');
      component['resetForm'].controls.confirmPassword.setValue('exactly12!!!!');
      component['advanceStep']();
      await fixture.whenStable();

      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        'Reset failed',
      );
      expect(component['step']()).toBe(3);
    });
  });

  describe('Form Validation', () => {
    it('should detect invalid current step', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      expect(component['isCurrentStepInvalid']()).toBe(true);

      component['resetForm'].controls.email.setValue('valid@example.com');
      expect(component['isCurrentStepInvalid']()).toBe(false);

      component['advanceStep']();
      await fixture.whenStable();

      expect(component['isCurrentStepInvalid']()).toBe(true);

      component['resetForm'].controls.verificationCode.setValue('123456');
      expect(component['isCurrentStepInvalid']()).toBe(false);

      component['advanceStep']();
      await fixture.whenStable();

      expect(component['isCurrentStepInvalid']()).toBe(true);

      component['resetForm'].controls.newPassword.setValue('exactly12!!!!');
      component['resetForm'].controls.confirmPassword.setValue('exactly12!!!!');
      expect(component['isCurrentStepInvalid']()).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form and step', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['resetForm'].controls.email.setValue('valid@example.com');
      component['advanceStep']();
      await fixture.whenStable();

      component['reset']();

      expect(component['step']()).toBe(0);
      expect(component['resetForm'].pristine).toBe(true);
    });
  });

  describe('Button Labels', () => {
    it('should return correct button label for each step', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      expect(component['getStepButtonLabel']()).toBe('Continue');

      component['step'].set(2);
      expect(component['getStepButtonLabel']()).toBe('Verify Code');

      component['step'].set(3);
      expect(component['getStepButtonLabel']()).toBe('Reset Password');

      component['step'].set(4);
      expect(component['getStepButtonLabel']()).toBe('Proceed to Login');
    });
  });
});
