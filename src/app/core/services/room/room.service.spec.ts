/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { RoomService } from './room.service';
import { ApiService } from '../api/api.service';
import { of, throwError } from 'rxjs';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

describe('RoomService', () => {
  let service: RoomService;
  let apiServiceMock: jest.Mocked<ApiService>;
  const baseUrl = environment.notificationUrl;

  const mockRoom: any = { id: '1', name: 'Test Room' };
  const mockRooms: any[] = [mockRoom];

  beforeEach(() => {
    apiServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    TestBed.configureTestingModule({
      providers: [RoomService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(RoomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateRoom', () => {
    it('should call apiService.post with correct parameters', () => {
      apiServiceMock.post.mockReturnValue(of(mockRoom));

      service.getOrCreateRoom('user123').subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith(
        baseUrl,
        endpoints.chatRoom.getOrCreateRoom,
        { targetUserId: 'user123' },
      );
    });

    it('should return the created room', (done) => {
      apiServiceMock.post.mockReturnValue(of(mockRoom));

      service.getOrCreateRoom('user123').subscribe((room) => {
        expect(room).toEqual(mockRoom);
        done();
      });
    });

    it('should handle errors', (done) => {
      apiServiceMock.post.mockReturnValue(throwError(() => new Error('Failed')));

      service.getOrCreateRoom('user123').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });
  });

  describe('getUserRooms', () => {
    it('should call apiService.get with correct parameters', () => {
      apiServiceMock.get.mockReturnValue(of(mockRooms));

      service.getUserRooms().subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.chatRoom.getUserRooms(''));
    });

    it('should call apiService.get with correct parameters with search', () => {
      apiServiceMock.get.mockReturnValue(of(mockRooms));

      service.getUserRooms({ search: 'test' }).subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.chatRoom.getUserRooms('?query=test'),
      );
    });

    it('should return array of rooms', (done) => {
      apiServiceMock.get.mockReturnValue(of(mockRooms));

      service.getUserRooms().subscribe((rooms) => {
        expect(rooms).toEqual(mockRooms);
        done();
      });
    });

    it('should handle errors', (done) => {
      apiServiceMock.get.mockReturnValue(throwError(() => new Error('Failed')));

      service.getUserRooms().subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });
  });

  describe('getRoomDetails', () => {
    it('should call apiService.get with correct parameters', () => {
      apiServiceMock.get.mockReturnValue(of(mockRoom));

      service.getRoomDetails('room123').subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.chatRoom.getRoomDetails('room123'),
      );
    });

    it('should return room details', (done) => {
      apiServiceMock.get.mockReturnValue(of(mockRoom));

      service.getRoomDetails('room123').subscribe((room) => {
        expect(room).toEqual(mockRoom);
        done();
      });
    });

    it('should handle errors', (done) => {
      apiServiceMock.get.mockReturnValue(throwError(() => new Error('Failed')));

      service.getRoomDetails('room123').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          done();
        },
      });
    });
  });
});
