/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoomService } from '@core/services/room/room.service';
import { ActiveInboxComponent } from './active-inbox.component';
import { ChatBoxComponent } from '@shared/components/chat-box/chat-box.component';
import { Room } from '@shared/models/websocket';
import { of, Subject, Observable } from 'rxjs';

describe('ActiveInboxComponent', () => {
  let component: ActiveInboxComponent;
  let fixture: ComponentFixture<ActiveInboxComponent>;
  let mockRoomService: jest.Mocked<RoomService>;
  let mockActivatedRoute: { params: Subject<{ roomId: string }> };

  const mockRoom: Room = {
    id: 'room1',
    participants: [
      { userId: 'user1', userName: 'Current User', active: true },
      { userId: 'user2', userName: 'Recipient User', active: true },
    ],
    messages: [],
  };

  beforeEach(async () => {
    mockRoomService = {
      getRoomDetails: jest.fn().mockReturnValue(of(mockRoom)),
    } as any;

    mockActivatedRoute = {
      params: new Subject<{ roomId: string }>(),
    };

    await TestBed.configureTestingModule({
      imports: [ActiveInboxComponent, ChatBoxComponent, HttpClientTestingModule],
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveInboxComponent);
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
      const roomId = 'room1';
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId });
      tick();
      expect(component['roomId']()).toBe(roomId);
      expect(mockRoomService.getRoomDetails).toHaveBeenCalledWith(roomId);
      expect(component['selectedRoom']()).toEqual(mockRoom);
    }));

    it('should handle error when fetching room details', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Failed to fetch room');
      mockRoomService.getRoomDetails.mockReturnValue(throwError(() => error));
      const roomId = 'room1';

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
      const roomId = 'room1';
      component.ngOnInit();
      mockActivatedRoute.params.next({ roomId });
      tick();
      expect(component['roomId']()).toBe(roomId);
      expect(component['selectedRoom']()).toEqual(mockRoom);

      fixture.destroy();

      mockActivatedRoute.params.next({ roomId: 'room2' });
      tick();
      expect(component['roomId']()).toBe(roomId);
      expect(component['selectedRoom']()).toEqual(mockRoom);
    }));
  });

  describe('recipientInfo', () => {
    it('should compute recipientInfo correctly', () => {
      component['selectedRoom'].set(mockRoom);
      expect(component['recipientInfo']()).toEqual({
        isConnected: true,
        name: 'Recipient User',
      });
    });

    it('should return null for recipientInfo if no participants', () => {
      component['selectedRoom'].set({ ...mockRoom, participants: [] });
      expect(component['recipientInfo']()).toBeNull();
    });

    it('should return null for recipientInfo if only one participant', () => {
      component['selectedRoom'].set({
        ...mockRoom,
        participants: [mockRoom.participants[0]],
      });
      expect(component['recipientInfo']()).toBeNull();
    });

    it('should return null for recipientInfo if participants is undefined', () => {
      component['selectedRoom'].set({ ...mockRoom, participants: undefined });
      expect(component['recipientInfo']()).toBeNull();
    });
  });
});

function throwError(errorFactory: () => any): any {
  return new Observable((subscriber) => {
    subscriber.error(errorFactory());
  });
}
