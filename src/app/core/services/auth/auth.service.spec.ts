/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty-function */
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../api/api.service';
import { firstValueFrom, of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from '@shared/models/auth';
import { environment } from '@core/environments/environments';
import { endpoints } from '@shared/constants/endpoints';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: jest.Mocked<ApiService>;
  let localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
  };
  const baseUrl = environment.gatewayUrl;

  beforeEach(() => {
    apiService = {
      post: jest.fn(() =>
        of({
          accessToken: 'mock-token',
          roles: [{ name: 'ADMIN' }],
        } as LoginResponse),
      ),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiService },
        {
          provide: HttpClient,
          useValue: {
            post: jest.fn(() => of({})),
            get: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    service['stopTokenExpirationCheck']();
  });

  describe('login', () => {
    it('should call API post and store tokens', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };

      await firstValueFrom(service.login(credentials));

      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(apiService.post).toHaveBeenCalledWith(baseUrl, endpoints.auth.login, credentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify([{ name: 'ADMIN' }]),
      );
    });

    it('should start token expiration check after login', async () => {
      const startSpy = jest.spyOn(service as any, 'startTokenExpirationCheck');
      const credentials = { email: 'test@example.com', password: 'password' };

      await firstValueFrom(service.login(credentials));

      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should remove access token from localStorage', () => {
      service.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should stop token expiration check', () => {
      const stopSpy = jest.spyOn(service as any, 'stopTokenExpirationCheck');
      service.logout();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('token expiration check', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('test-token');

      jest.spyOn(global, 'setInterval');
      jest.spyOn(global, 'clearInterval');
    });

    afterEach(() => {
      service['stopTokenExpirationCheck']();
      jest.clearAllMocks();
    });

    it('should set up interval for token checks', () => {
      service['startTokenExpirationCheck']();
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it('should check authentication status on interval', () => {
      const isAuthenticatedSpy = jest.spyOn(service, 'isAuthenticated');
      service['startTokenExpirationCheck']();

      const intervalCallback = (setInterval as jest.Mock).mock.calls[0][0];

      intervalCallback();

      expect(isAuthenticatedSpy).toHaveBeenCalledTimes(1);
    });

    it('should logout when not authenticated', () => {
      jest.spyOn(service, 'isAuthenticated').mockReturnValue(false);
      const logoutSpy = jest.spyOn(service, 'logout');

      service['startTokenExpirationCheck']();
      const intervalCallback = (setInterval as jest.Mock).mock.calls[0][0];
      intervalCallback();

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear interval when stopped', () => {
      service['startTokenExpirationCheck']();
      service['stopTokenExpirationCheck']();

      expect(clearInterval).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopTokenExpirationCheck', () => {
    it('should unsubscribe from existing subscription', () => {
      const mockSubscription = {
        unsubscribe: jest.fn(),
      } as unknown as Subscription;

      service['tokenCheckSubscription'] = mockSubscription;
      service['stopTokenExpirationCheck']();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(service['tokenCheckSubscription']).toBeUndefined();
    });

    it('should handle when no subscription exists', () => {
      service['tokenCheckSubscription'] = undefined;
      expect(() => service['stopTokenExpirationCheck']()).not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return "admin" when ADMIN role exists', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        return key === 'user' ? JSON.stringify([{ name: 'ADMIN' }]) : null;
      });
      expect(service.getUserRole()).toBe('admin');
    });

    it('should return first role when ADMIN role does not exist', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        return key === 'user' ? JSON.stringify([{ name: 'provider' }]) : null;
      });
      expect(service.getUserRole()).toBe('provider');
    });

    it('should return null when no user data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(service.getUserRole()).toBeNull();
    });

    it('should return null when user data is empty array', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        return key === 'user' ? JSON.stringify([]) : null;
      });
      expect(service.getUserRole()).toBeNull();
    });

    it('should handle malformed JSON gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.getItem.mockImplementation((key: string) => {
        return key === 'user' ? 'invalid-json' : null;
      });
      expect(service.getUserRole()).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Password Reset Methods', () => {
    describe('sendVerificationCode', () => {
      it('should call initiate endpoint with baseUrl', () => {
        const email = 'test@example.com';
        service.sendVerificationCode(email).subscribe();
        expect(apiService.post).toHaveBeenCalledWith(
          baseUrl,
          endpoints.auth.initaitePasswordReset(email),
        );
      });
    });

    describe('resendVerificationCode', () => {
      it('should call resend endpoint with baseUrl', () => {
        const email = 'test@example.com';
        service.resendVerificationCode(email).subscribe();
        expect(apiService.post).toHaveBeenCalledWith(
          baseUrl,
          endpoints.auth.verificationCodeResend(email),
        );
      });
    });

    describe('verifyCode', () => {
      it('should call verify-token endpoint with baseUrl', () => {
        const token = '123456';
        service.verifyCode(token).subscribe();
        expect(apiService.post).toHaveBeenCalledWith(baseUrl, endpoints.auth.verifyCode(token));
      });
    });

    describe('setPassword', () => {
      it('should call password/set endpoint with baseUrl and body', () => {
        const token = '123456';
        const password = 'newPassword123!';
        service.setPassword(token, password).subscribe();
        expect(apiService.post).toHaveBeenCalledWith(baseUrl, endpoints.auth.setPassword, {
          token,
          password,
        });
      });
    });
  });
});
