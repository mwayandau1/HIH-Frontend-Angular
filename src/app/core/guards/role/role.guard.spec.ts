/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRole } from '@shared/models/userRoles';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;
  let mockRoute: Partial<ActivatedRouteSnapshot>;

  beforeEach(() => {
    mockAuthService = {
      getUserRole: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockRoute = {
      data: {},
    };

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('when route has no required roles', () => {
    it('should allow access when roles are not specified', () => {
      mockRoute.data = {};
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      mockRoute.data = { roles: [] };
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(true);
    });
  });

  describe('when route has required roles', () => {
    beforeEach(() => {
      mockRoute.data = { roles: [UserRole.Admin, UserRole.Provider] };
    });

    it('should allow access when user has one of the required roles', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(UserRole.Admin);
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(true);
    });

    it('should deny access when user has no required role', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should deny access when user is not authenticated', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(null);
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined route data gracefully', () => {
      mockRoute.data = undefined as any;
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(true);
    });

    it('should handle null route data gracefully', () => {
      mockRoute.data = null as any;
      expect(guard.canActivate(mockRoute as ActivatedRouteSnapshot)).toBe(true);
    });
  });
});
