/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessagePageComponent } from './message.component';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '@core/services/room/room.service';
import { Room } from '@shared/models/websocket';
import { of, throwError, Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChatBoxComponent } from '@shared/components/chat-box/chat-box.component';

describe('MessagePageComponent', () => {
  let component: MessagePageComponent;
  let fixture: ComponentFixture<MessagePageComponent>;
  let mockRoomService: jest.Mocked<RoomService>;
  let mockActivatedRoute: { params: Subject<{ roomId: string }> };

  const mockRoom: Room = {
    id: 'test-room',
    participants: [
      { userId: '1', userName: 'Doctor John', active: true },
      { userId: '2', userName: 'Patient Jane', active: false },
    ],
  };

  beforeEach(async () => {
    mockRoomService = {
      getRoomDetails: jest.fn().mockReturnValue(of(mockRoom)),
    } as any;

    mockActivatedRoute = {
      params: new Subject<{ roomId: string }>(),
    };

    await TestBed.configureTestingModule({
      imports: [MessagePageComponent, ChatBoxComponent, HttpClientTestingModule],
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagePageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty roomId and null selectedRoom', () => {
    expect(component['roomId']()).toBe('');
    expect(component['selectedRoom']()).toBeNull();
  });

  describe('ngOnInit', () => {
    it('should set roomId and selectedRoom when route params emit a valid roomId', fakeAsync(() => {
      const roomId = 'test-room';
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId });
      tick();
      expect(component['roomId']()).toBe(roomId);
      expect(mockRoomService.getRoomDetails).toHaveBeenCalledWith(roomId);
      expect(component['selectedRoom']()).toEqual(mockRoom);
    }));

    it('should handle error when getting room details', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      mockRoomService.getRoomDetails.mockReturnValue(throwError(() => error));
      const roomId = 'test-room';

      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId });
      tick();

      expect(component['roomId']()).toBe(roomId);
      expect(mockRoomService.getRoomDetails).toHaveBeenCalledWith(roomId);
      expect(component['selectedRoom']()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error selecting room:', error);
      consoleSpy.mockRestore();
    }));

    it('should unsubscribe on destroy', fakeAsync(() => {
      const roomId = 'test-room';
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId });
      tick();
      expect(component['roomId']()).toBe(roomId);
      expect(component['selectedRoom']()).toEqual(mockRoom);

      fixture.destroy();

      mockActivatedRoute.params.next({ roomId: 'new-room' });
      tick();
      expect(component['roomId']()).toBe(roomId);
      expect(component['selectedRoom']()).toEqual(mockRoom);
    }));
  });

  describe('recipientInfo', () => {
    it('should return correct recipient info when room has participants', fakeAsync(() => {
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId: 'test-room' });
      tick();
      expect(component['recipientInfo']()).toEqual({
        isConnected: false,
        name: 'Patient Jane',
      });
    }));

    it('should return null when room has no participants', fakeAsync(() => {
      mockRoomService.getRoomDetails.mockReturnValue(
        of({
          ...mockRoom,
          participants: [],
        }),
      );
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId: 'test-room' });
      tick();
      expect(component['recipientInfo']()).toBeNull();
    }));

    it('should return null when room has only one participant', fakeAsync(() => {
      mockRoomService.getRoomDetails.mockReturnValue(
        of({
          ...mockRoom,
          participants: [mockRoom.participants[0]],
        }),
      );
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId: 'test-room' });
      tick();
      expect(component['recipientInfo']()).toBeNull();
    }));

    it('should return null when room has undefined participants', fakeAsync(() => {
      mockRoomService.getRoomDetails.mockReturnValue(
        of({
          ...mockRoom,
          participants: undefined,
        }),
      );
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId: 'test-room' });
      tick();
      expect(component['recipientInfo']()).toBeNull();
    }));
  });
});
