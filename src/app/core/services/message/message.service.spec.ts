/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageService } from './message.service';
import { ApiService } from '../api/api.service';
import { HttpHeaders } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

describe('MessageService', () => {
  let service: MessageService;
  let apiServiceMock: jest.Mocked<ApiService>;
  const baseUrl = environment.notificationUrl;

  beforeEach(() => {
    apiServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    TestBed.configureTestingModule({
      providers: [MessageService, { provide: ApiService, useValue: apiServiceMock }],
    });

    Storage.prototype.getItem = jest.fn(() => 'mock-token');

    service = TestBed.inject(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHeaders', () => {
    it('should return headers with authorization token', () => {
      const headers = (service as any).getHeaders();
      expect(headers.get('Authorization')).toBe('Bearer mock-token');
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle missing token', () => {
      Storage.prototype.getItem = jest.fn(() => null);
      const headers = (service as any).getHeaders();
      expect(headers.get('Authorization')).toBe('Bearer null');
    });
  });

  describe('getRoomMessages', () => {
    it('should call apiService.get with correct parameters', () => {
      const mockMessages: any[] = [{ id: '1', content: 'test' }];
      apiServiceMock.get.mockReturnValue(of(mockMessages));

      service.getRoomMessages('room1', 1, 20).subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.messages.getRoomMessages('room1'),
        {
          params: { page: '1', size: '20' },
          headers: expect.any(HttpHeaders),
        },
      );
    });

    it('should return empty array on error', (done) => {
      apiServiceMock.get.mockReturnValue(throwError(() => new Error('Failed')));

      service.getRoomMessages('room1').subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should use default page and size values when not provided', () => {
      apiServiceMock.get.mockReturnValue(of([]));

      service.getRoomMessages('room1').subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.messages.getRoomMessages('room1'),
        {
          params: { page: '0', size: '50' },
          headers: expect.any(HttpHeaders),
        },
      );
    });
  });

  describe('markMessageAsRead', () => {
    it('should call apiService.post with correct parameters', () => {
      apiServiceMock.post.mockReturnValue(of(undefined));

      service.markMessageAsRead('msg1').subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith(
        baseUrl,
        endpoints.messages.markMessageAsRead('msg1'),
        {},
        { headers: expect.any(HttpHeaders) },
      );
    });

    it('should handle errors gracefully', (done) => {
      apiServiceMock.post.mockReturnValue(throwError(() => new Error('Failed')));

      service.markMessageAsRead('msg1').subscribe({
        next: () => {
          done();
        },
        error: () => {
          fail('Error should have been caught by service');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
