import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '@core/services/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('when user is authenticated', () => {
    it('should allow access', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      expect(guard.canActivate()).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    it('should deny access and redirect to login', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
      expect(guard.canActivate()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined authentication status', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(undefined);
      expect(guard.canActivate()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle null authentication status', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(null);
      expect(guard.canActivate()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
