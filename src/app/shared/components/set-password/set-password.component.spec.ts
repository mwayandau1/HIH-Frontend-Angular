import { render } from '@testing-library/angular';
import { SetPasswordComponent } from './set-password.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast/toast.service';
import { of, throwError } from 'rxjs';

describe('SetPasswordComponent', () => {
  const setup = async (queryParams = {}) => {
    const mockRouter = {
      navigate: jest.fn(),
    };

    const mockActivatedRoute = {
      queryParams: of(queryParams),
    };

    const mockAuthService = {
      setPassword: jest.fn().mockReturnValue(of({})),
    };

    const mockToastService = {
      show: jest.fn(),
    };

    return await render(SetPasswordComponent, {
      imports: [
        InputComponent,
        ButtonComponent,
        LucideAngularModule,
        ReactiveFormsModule,
        AuthComponent,
        RouterModule,
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
      ],
    });
  };

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize with password visibility hidden', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    expect(component['isFirstPasswordVisible']()).toBe(false);
    expect(component['isSecondPasswordVisible']()).toBe(false);
  });

  it('should set inviteToken from query params', async () => {
    const testToken = 'test-token-123';
    const { fixture } = await setup({ token: testToken });
    const component = fixture.componentInstance;
    expect(component['inviteToken']()).toBe(testToken);
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      expect(component['passwordForm'].invalid).toBe(true);
    });

    it('should be invalid when passwords do not match', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['passwordForm'].controls.password.setValue('Password123!');
      component['passwordForm'].controls.confirmPassword.setValue('Different123!');

      expect(component['passwordForm'].invalid).toBe(true);
      expect(component['passwordForm'].hasError('passwordsMismatch')).toBe(true);
    });

    it('should be valid when passwords match and meet requirements', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      const validPassword = 'ValidPassword123!@';

      component['passwordForm'].controls.password.setValue(validPassword);
      component['passwordForm'].controls.confirmPassword.setValue(validPassword);

      component['passwordForm'].controls.password.markAsTouched();
      component['passwordForm'].controls.confirmPassword.markAsTouched();
      fixture.detectChanges();

      expect(component['passwordForm'].valid).toBe(true);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle first password visibility', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['togglePasswordVisibility']('first');
      expect(component['isFirstPasswordVisible']()).toBe(true);

      component['togglePasswordVisibility']('first');
      expect(component['isFirstPasswordVisible']()).toBe(false);
    });

    it('should toggle second password visibility', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      component['togglePasswordVisibility']('second');
      expect(component['isSecondPasswordVisible']()).toBe(true);

      component['togglePasswordVisibility']('other');
      expect(component['isSecondPasswordVisible']()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should call authService.setPassword and navigate on successful submission', async () => {
      const testToken = 'test-token-123';
      const { fixture } = await setup({ token: testToken });
      const component = fixture.componentInstance;
      const router = fixture.debugElement.injector.get(Router);
      const authService = fixture.debugElement.injector.get(AuthService);
      const toastService = fixture.debugElement.injector.get(ToastService);

      const validPassword = 'ValidPassword123!@';
      component['passwordForm'].controls.password.setValue(validPassword);
      component['passwordForm'].controls.confirmPassword.setValue(validPassword);

      component['onSubmit']();

      expect(authService.setPassword).toHaveBeenCalledWith(testToken, validPassword);
      expect(toastService.show).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should show error toast on failed submission', async () => {
      const { fixture } = await setup({ token: 'test-token' });
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);
      const toastService = fixture.debugElement.injector.get(ToastService);

      authService.setPassword = jest.fn().mockReturnValue(throwError(() => new Error('Failed')));

      const validPassword = 'ValidPassword123!@';
      component['passwordForm'].controls.password.setValue(validPassword);
      component['passwordForm'].controls.confirmPassword.setValue(validPassword);

      component['onSubmit']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        'error',
        expect.any(String),
      );
    });

    it('should not submit if form is invalid', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const authService = fixture.debugElement.injector.get(AuthService);
      const router = fixture.debugElement.injector.get(Router);

      component['onSubmit']();

      expect(authService.setPassword).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
