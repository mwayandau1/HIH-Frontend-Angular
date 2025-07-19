/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessagePageComponent } from './message.component';
import { RoomService } from '@core/services/room/room.service';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  InputComponent,
  ButtonComponent,
  ModalComponent,
  LoaderComponent,
} from '@shared/components';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { PatientProvider } from '@shared/models';
import { Room } from '@shared/models/websocket';

describe('MessagePageComponent', () => {
  let component: MessagePageComponent;
  let fixture: ComponentFixture<MessagePageComponent>;
  let mockRoomService: jest.Mocked<RoomService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockRoom: Room = {
    id: 'room1',
    participants: [
      { userId: 'user1', userName: 'Current User', active: true },
      { userId: 'user2', userName: 'Recipient User', active: true },
    ],
    messages: [],
  };

  const mockUser: PatientProvider = {
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    mockRoomService = {
      getUserRooms: jest.fn().mockReturnValue(of([mockRoom])),
      getRoomDetails: jest.fn().mockReturnValue(of(mockRoom)),
      getOrCreateRoom: jest.fn().mockReturnValue(of(mockRoom)),
    } as any;

    mockUserService = {
      getProvidersAndPatients: jest.fn().mockReturnValue(of({ content: [mockUser] })),
    } as any;

    mockToastService = {
      show: jest.fn(),
    } as any;

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
      events: of(new NavigationEnd(0, '/', '/')),
    } as any;

    mockActivatedRoute = {
      firstChild: {
        paramMap: of(new Map([['roomId', 'room1']])),
        snapshot: {
          paramMap: new Map([['roomId', 'room1']]),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        MessagePageComponent,
        InputComponent,
        ButtonComponent,
        ModalComponent,
        LoaderComponent,
        LucideAngularModule,
        CommonModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: RoomService, useValue: mockRoomService },
        { provide: UserService, useValue: mockUserService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search keyword', () => {
    expect(component['searchKeyword'].value).toBe('');
  });

  describe('ngOnInit', () => {
    it('should set up route listeners and fetch rooms', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockRoomService.getUserRooms).toHaveBeenCalled();
      expect(component['userRooms']()).toEqual([mockRoom]);
      expect(component['selectedRoomId']()).toBe('room1');
    }));
  });

  describe('fetchRooms', () => {
    it('should fetch rooms and update state', fakeAsync(() => {
      component['fetchRooms']();
      tick();

      expect(mockRoomService.getUserRooms).toHaveBeenCalled();
      expect(component['userRooms']()).toEqual([mockRoom]);
      expect(component['isFetchingRooms']()).toBe(false);
    }));

    it('should handle error when fetching rooms', fakeAsync(() => {
      mockRoomService.getUserRooms.mockReturnValue(throwError(() => new Error('Error')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component['fetchRooms']();
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching rooms:', expect.any(Error));
      expect(component['isFetchingRooms']()).toBe(false);
      consoleSpy.mockRestore();
    }));

    it('should fetch room details if selected room not in list', fakeAsync(() => {
      mockRoomService.getUserRooms.mockReturnValue(of([]));
      component['selectedRoomId'].set('room1');

      component['fetchRooms']();
      tick();

      expect(mockRoomService.getRoomDetails).toHaveBeenCalledWith('room1');
    }));
  });

  describe('selectRoom', () => {
    it('should set selectedRoomId and navigate', () => {
      component['selectRoom']('room1');

      expect(component['selectedRoomId']()).toBe('room1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['provider/patients/messages', 'room1']);
    });
  });

  describe('handleSearch', () => {
    it('should reset selected room and fetch rooms with search term when category is rooms', () => {
      component['searchKeyword'].setValue('test');
      component['selectedRoomId'].set('room1');

      component['handleSearch']('rooms');

      expect(component['selectedRoomId']()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['provider/patients/messages']);
      expect(mockRoomService.getUserRooms).toHaveBeenCalledWith({ search: 'test' });
    });

    it('should reset selected room and fetch users with search term when category is users', () => {
      component['searchKeyword'].setValue('test');
      component['selectedRoomId'].set('room1');

      component['handleSearch']('users');

      expect(component['selectedRoomId']()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['provider/patients/messages']);
      expect(mockUserService.getProvidersAndPatients).toHaveBeenCalledWith({ search: 'test' });
    });
  });

  describe('modal operations', () => {
    it('should open modal and fetch users', fakeAsync(() => {
      component['handleOpenModal']();
      tick();

      expect(component['isModalOpen']()).toBe(true);
      expect(mockUserService.getProvidersAndPatients).toHaveBeenCalled();
      expect(component['allUsers']()).toEqual([mockUser]);
    }));

    it('should handle error when fetching users', fakeAsync(() => {
      mockUserService.getProvidersAndPatients.mockReturnValue(throwError(() => new Error('Error')));

      component['handleOpenModal']();
      tick();

      expect(mockToastService.show).toHaveBeenCalled();
      expect(component['allUsers']()).toEqual([]);
    }));

    it('should start conversation and navigate to room', fakeAsync(() => {
      component['handleStartConvo']('user1');
      tick();

      expect(mockRoomService.getOrCreateRoom).toHaveBeenCalledWith('user1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['provider/patients/messages', 'room1']);
      expect(component['isModalOpen']()).toBe(false);
    }));
  });
});
