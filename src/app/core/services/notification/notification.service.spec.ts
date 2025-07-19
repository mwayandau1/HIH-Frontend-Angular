import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { ApiService } from '../api/api.service';
import { of } from 'rxjs';
import { environment } from '@core/environments/environments';
import { endpoints } from '@shared/constants/endpoints';

describe('NotificationService', () => {
  let service: NotificationService;
  let apiServiceMock: jest.Mocked<ApiService>;
  const baseUrl = environment.notificationUrl;

  beforeEach(() => {
    apiServiceMock = {
      get: jest.fn(),
      put: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    TestBed.configureTestingModule({
      providers: [NotificationService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserNotifications', () => {
    it('should call API service with correct parameters', () => {
      const mockResponse = { data: { EMAIL: [], SMS: [] } };
      apiServiceMock.get.mockReturnValue(of(mockResponse));

      service.getUserNotifications().subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.notification.getUserPreferences,
      );
    });

    it('should return the response from API', (done) => {
      const mockResponse = {
        data: {
          EMAIL: [{ type: 'APPOINTMENT_REMINDER', enabled: true }],
          SMS: [{ type: 'APPOINTMENT_REMINDER', enabled: false }],
        },
      };
      apiServiceMock.get.mockReturnValue(of(mockResponse));

      service.getUserNotifications().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('updateUserPreference', () => {
    it('should call API service with correct parameters', () => {
      const mockRequest = [{ type: 'APPOINTMENT_REMINDER', enabled: true, channel: 'EMAIL' }];
      apiServiceMock.put.mockReturnValue(of(void 0));

      service.updateUserPreference(mockRequest).subscribe();

      expect(apiServiceMock.put).toHaveBeenCalledWith(
        baseUrl,
        endpoints.notification.updateUserPreferences,
        mockRequest,
      );
    });

    it('should return void observable', (done) => {
      const mockRequest = [{ type: 'PRESCRIPTION_READY', enabled: false, channel: 'SMS' }];
      apiServiceMock.put.mockReturnValue(of(void 0));

      service.updateUserPreference(mockRequest).subscribe((response) => {
        expect(response).toBeUndefined();
        done();
      });
    });
  });
});
