import { HttpRequest, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { authInterceptor, authInterceptorProvider } from './auth.interceptor';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth/auth.service';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';

const authServiceMock = {
  getToken: jest.fn(),
  logout: jest.fn(),
} as unknown as jest.Mocked<AuthService>;

describe('authInterceptor', () => {
  let nextMock: jest.Mock;
  let httpRequest: HttpRequest<unknown>;
  let injector: EnvironmentInjector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useFactory: authInterceptorProvider, multi: true },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    injector = TestBed.inject(EnvironmentInjector);

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    nextMock = jest.fn((req: HttpRequest<unknown>) => of({} as HttpEvent<unknown>));
    httpRequest = new HttpRequest('GET', '/test');

    jest.clearAllMocks();
  });

  it('should add Authorization header when token is present', (done) => {
    authServiceMock.getToken.mockReturnValue('fake-token');

    runInInjectionContext(injector, () => {
      authInterceptor(httpRequest, nextMock).subscribe(() => {
        expect(authServiceMock.getToken).toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledTimes(1);
        const passedRequest = nextMock.mock.calls[0][0];
        expect(passedRequest.headers.has('Authorization')).toBe(true);
        expect(passedRequest.headers.get('Authorization')).toBe('Bearer fake-token');
        done();
      });
    });
  });

  it('should NOT add Authorization header when token is null', (done) => {
    authServiceMock.getToken.mockReturnValue(null);

    runInInjectionContext(injector, () => {
      authInterceptor(httpRequest, nextMock).subscribe(() => {
        expect(authServiceMock.getToken).toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledTimes(1);
        const passedRequest = nextMock.mock.calls[0][0];
        expect(passedRequest.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  it('should NOT add Authorization header when token is empty string', (done) => {
    authServiceMock.getToken.mockReturnValue('');

    runInInjectionContext(injector, () => {
      authInterceptor(httpRequest, nextMock).subscribe(() => {
        expect(authServiceMock.getToken).toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledTimes(1);
        const passedRequest = nextMock.mock.calls[0][0];
        expect(passedRequest.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  describe('AWS URL handling', () => {
    it('should skip Authorization header for AWS URLs when token exists', (done) => {
      const token = 'fake-token';
      const awsUrl = 'https://s3.amazonaws.com/bucket/file';
      authServiceMock.getToken.mockReturnValue(token);
      const awsRequest = new HttpRequest('GET', awsUrl);

      runInInjectionContext(injector, () => {
        authInterceptor(awsRequest, nextMock).subscribe(() => {
          expect(authServiceMock.getToken).toHaveBeenCalled();
          expect(nextMock).toHaveBeenCalledTimes(1);
          const passedRequest = nextMock.mock.calls[0][0];
          expect(passedRequest.headers.has('Authorization')).toBe(false);
          expect(passedRequest.url).toBe(awsUrl);
          done();
        });
      });
    });

    it('should skip Authorization header for AWS URLs when token is null', (done) => {
      authServiceMock.getToken.mockReturnValue(null);
      const awsRequest = new HttpRequest('GET', 'https://dynamodb.amazonaws.com/table');

      runInInjectionContext(injector, () => {
        authInterceptor(awsRequest, nextMock).subscribe(() => {
          expect(authServiceMock.getToken).toHaveBeenCalled();
          expect(nextMock).toHaveBeenCalledTimes(1);
          const passedRequest = nextMock.mock.calls[0][0];
          expect(passedRequest.headers.has('Authorization')).toBe(false);
          expect(passedRequest.url).toContain('amazonaws.com');
          done();
        });
      });
    });

    it('should handle AWS URLs with different subdomains', (done) => {
      const token = 'fake-token';
      authServiceMock.getToken.mockReturnValue(token);
      const awsUrls = [
        'https://s3.amazonaws.com/bucket/file',
        'https://ec2.amazonaws.com/api',
        'https://custom.bucket.s3.amazonaws.com/file',
      ];

      awsUrls.forEach((url, index) => {
        const awsRequest = new HttpRequest('GET', url);
        runInInjectionContext(injector, () => {
          authInterceptor(awsRequest, nextMock).subscribe(() => {
            const passedRequest = nextMock.mock.calls[index][0];
            expect(passedRequest.headers.has('Authorization')).toBe(false);
            if (index === awsUrls.length - 1) {
              done();
            }
          });
        });
      });
    });
  });

  it('should call logout on 401 error', (done) => {
    const errorResponse = { status: 401, statusText: 'Unauthorized' } as HttpErrorResponse;
    nextMock.mockReturnValueOnce(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      authInterceptor(httpRequest, nextMock).subscribe({
        error: (error) => {
          expect(authServiceMock.logout).toHaveBeenCalled();
          expect(error).toBe(errorResponse);
          done();
        },
      });
    });
  });

  it('should register interceptor via provider factory', () => {
    const provider = authInterceptorProvider();
    expect(provider.provide).toBe(HTTP_INTERCEPTORS);
    expect(provider.multi).toBe(true);
    expect(typeof provider.useFactory).toBe('function');
    const factoryResult = provider.useFactory();
    expect(factoryResult).toBe(authInterceptor);
  });
});
