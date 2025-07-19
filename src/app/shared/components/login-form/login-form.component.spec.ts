import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LucideAngularModule } from 'lucide-angular';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth/auth.service';
import { ToastService } from '@core/services/toast/toast.service';
import { Router } from '@angular/router';
import { delay, of, throwError } from 'rxjs';
import { LoginResponse } from '@shared/models/auth';
import { UserRole } from '@shared/models/userRoles';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let toastService: jest.Mocked<ToastService>;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      getUserRole: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    toastService = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ButtonComponent,
        InputComponent,
        LucideAngularModule,
        LoginFormComponent,
      ],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login form component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with email and password controls', () => {
    const form = component['authForm'];
    expect(form.contains('email')).toBe(true);
    expect(form.contains('password')).toBe(true);
  });

  it('should mark email as invalid if empty', () => {
    const emailControl = component['authFormControls'].email;
    emailControl?.setValue('');
    expect(emailControl?.valid).toBe(false);
  });

  it('should toggle password visibility', () => {
    const initialValue = component['isPasswordVisible']();
    component['handlePasswordVisibility']();
    expect(component['isPasswordVisible']()).toBe(!initialValue);
  });

  it('should not allow form submission if form is invalid', () => {
    const form = component['authForm'];
    form.setValue({ email: '', password: '' });
    expect(form.valid).toBe(false);
  });

  it('should allow form submission if form is valid', () => {
    const form = component['authForm'];
    form.setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });
    expect(form.valid).toBe(true);
  });

  describe('onSubmit', () => {
    it('should call authService.login with form values when form is valid', () => {
      const validData = { email: 'test@example.com', password: 'Exactly12!!!!' };
      component['authForm'].setValue(validData);
      authService.login.mockReturnValue(of({} as LoginResponse));

      component['onSubmit']();

      expect(authService.login).toHaveBeenCalledWith(validData);
    });

    it('should set isLoading to true during submission and false after', fakeAsync(() => {
      component['authForm'].setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });

      authService.login.mockReturnValue(of({} as LoginResponse).pipe(delay(1)));

      component['onSubmit']();

      expect(component['isLoading']()).toBe(true);

      tick(1);

      expect(component['isLoading']()).toBe(false);
    }));

    it('should navigate to admin route when user role is admin', () => {
      component['authForm'].setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });
      authService.login.mockReturnValue(of({} as LoginResponse));
      authService.getUserRole.mockReturnValue('admin' as UserRole);

      component['onSubmit']();
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should navigate to provider route when user role is provider', () => {
      component['authForm'].setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });
      authService.login.mockReturnValue(of({} as LoginResponse));
      authService.getUserRole.mockReturnValue('provider' as UserRole);

      component['onSubmit']();
      expect(router.navigate).toHaveBeenCalledWith(['/provider']);
    });

    it('should navigate to patient route when user role is patient', () => {
      component['authForm'].setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });
      authService.login.mockReturnValue(of({} as LoginResponse));
      authService.getUserRole.mockReturnValue('patient' as UserRole);

      component['onSubmit']();
      expect(router.navigate).toHaveBeenCalledWith(['/patient']);
    });

    it('should navigate to unauthorized route when user role is unknown', () => {
      component['authForm'].setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });
      authService.login.mockReturnValue(of({} as LoginResponse));
      authService.getUserRole.mockReturnValue(null);

      component['onSubmit']();
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should show error toast when login fails', () => {
      const error = { error: { message: 'Invalid credentials' } };
      component['authForm'].setValue({ email: 'test@example.com', password: 'Exactly12!!!!' });
      authService.login.mockReturnValue(throwError(() => error));

      component['onSubmit']();
      expect(toastService.show).toHaveBeenCalledWith(
        'Login failed',
        'error',
        'Invalid credentials',
      );
    });
  });
});
