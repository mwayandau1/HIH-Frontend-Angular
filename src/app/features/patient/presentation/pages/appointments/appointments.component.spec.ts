import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentsPageComponent } from './appointments.component';
import { AppointmentService } from '@core/services/appointment/appointmemnt.service';
import { RoomService } from '@core/services/room/room.service';
import { ToastService } from '@core/services/toast/toast.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Appointment, AppointmentStatus } from '@shared/models/appointments';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('AppointmentsPageComponent', () => {
  let component: AppointmentsPageComponent;
  let fixture: ComponentFixture<AppointmentsPageComponent>;
  let appointmentService: jest.Mocked<AppointmentService>;
  let roomService: jest.Mocked<RoomService>;
  let toastService: jest.Mocked<ToastService>;
  let router: jest.Mocked<Router>;
  let activatedRoute: {
    queryParams: BehaviorSubject<Record<string, string>>;
    queryParamMap: BehaviorSubject<ParamMap>;
  };

  const mockAppointments: Appointment[] = [
    { id: '1', status: 'SCHEDULED', visitDate: '2025-07-11', time: '10:00' },
    { id: '2', status: 'IN_PROGRESS', visitDate: '2025-07-12', time: '11:00' },
  ];

  const mockResponse = {
    data: {
      content: mockAppointments,
      pageable: { pageNumber: 0, pageSize: 12 },
      totalElements: 2,
      totalPages: 1,
    },
    message: 'Success',
  };

  const mockRoom = { id: 'room1' };

  beforeEach(async () => {
    const appointmentServiceMock = {
      getAppointments: jest.fn().mockReturnValue(of(mockResponse)),
      deleteAppointment: jest.fn().mockReturnValue(of({})),
      updateAppointment: jest.fn().mockReturnValue(of({})),
    };

    const roomServiceMock = {
      getOrCreateRoom: jest.fn().mockReturnValue(of(mockRoom)),
    };

    const toastServiceMock = { show: jest.fn() };
    const routerMock = { navigate: jest.fn().mockResolvedValue(true) };
    const queryParamsSubject = new BehaviorSubject<Record<string, string>>({
      page: '1',
      size: '12',
    });
    const queryParamMapSubject = new BehaviorSubject<ParamMap>({
      get: (key: string) => queryParamsSubject.value[key] ?? null,
      has: (key: string) => !!queryParamsSubject.value[key],
      keys: Object.keys(queryParamsSubject.value),
    } as ParamMap);
    activatedRoute = {
      queryParams: queryParamsSubject,
      queryParamMap: queryParamMapSubject,
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DropdownComponent,
        PaginationComponent,
        LoaderComponent,
        ButtonComponent,
        HttpClientTestingModule,
      ],
      providers: [
        DatePipe,
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: RoomService, useValue: roomServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsPageComponent);
    component = fixture.componentInstance;
    appointmentService = TestBed.inject(AppointmentService) as jest.Mocked<AppointmentService>;
    roomService = TestBed.inject(RoomService) as jest.Mocked<RoomService>;
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct itemsPerPage and fetch appointments', () => {
    expect(component.itemsPerPage).toBe(12);
    expect(component.currentPage()).toBe(0);
    expect(appointmentService.getAppointments).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 12,
    });
    expect(component.appointments()).toEqual(mockAppointments);
    expect(component.totalRecords()).toBe(2);
    expect(component.numOfPages()).toBe(1);
  });

  it('should handle invalid query params', () => {
    activatedRoute.queryParams.next({ page: 'invalid', size: 'invalid' });
    expect(component.currentPage()).toBe(0);
    expect(component.itemsPerPage).toBe(12);
    expect(appointmentService.getAppointments).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 12,
    });
  });

  it('should filter appointments and reset page', () => {
    component.onFilterSelected('CANCELLED');
    expect(component.currentPage()).toBe(0);
    expect(component.selectedState).toBe('CANCELLED');
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRoute,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
    expect(appointmentService.getAppointments).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 12,
      status: 'CANCELLED',
    });
  });

  it('should toggle appointment modal', () => {
    const event = new Event('click');
    jest.spyOn(event, 'stopPropagation');
    component.toggleAppointmentModal('1', event);
    expect(component.openModalAppointmentId).toBe('1');
    expect(event.stopPropagation).toHaveBeenCalled();
    component.toggleAppointmentModal('1', event);
    expect(component.openModalAppointmentId).toBeNull();
  });

  it('should close modal on document click', () => {
    component.openModalAppointmentId = '1';
    component.onDocumentClick();
    expect(component.openModalAppointmentId).toBeNull();
  });

  it('should determine last or second-to-last appointments', () => {
    component.appointments.set([
      ...mockAppointments,
      { id: '3', status: 'COMPLETED', visitDate: '2025-07-13', time: '12:00' },
      { id: '4', status: 'CANCELLED', visitDate: '2025-07-14', time: '13:00' },
    ]);
    expect(component.isLastOrSecondToLast(0)).toBe(false);
    expect(component.isLastOrSecondToLast(2)).toBe(true);
    expect(component.isLastOrSecondToLast(3)).toBe(true);
  });

  it('should handle getAppointments with 404 error', () => {
    appointmentService.getAppointments.mockReturnValue(throwError(() => ({ status: 404 })));
    component.getAppointments();
    expect(component.loading()).toBe(false);
    expect(toastService.show).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(String));
  });

  it('should handle getAppointments with general error', () => {
    appointmentService.getAppointments.mockReturnValue(throwError(() => new Error('Server error')));
    component.getAppointments();
    expect(component.loading()).toBe(false);
    expect(toastService.show).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(String));
  });

  it('should delete appointment and update state', fakeAsync(() => {
    component.appointments.set([mockAppointments[0]]);
    component.totalRecords.set(1);
    component.deleteAppointment('1', '1:DELETE');
    tick();
    expect(component.actionLoading['1:DELETE']).toBe(false);
    expect(component.appointments()).toEqual([]);
    expect(component.totalRecords()).toBe(0);
    expect(component.numOfPages()).toBe(1);
    expect(component.openModalAppointmentId).toBeNull();
  }));

  it('should navigate to previous page when current page is empty after deletion', fakeAsync(() => {
    component.appointments.set([mockAppointments[0]]);
    component.totalRecords.set(1);
    component.currentPage.set(1);
    component.deleteAppointment('1', '1:DELETE');
    tick();
    expect(component.currentPage()).toBe(0);
    expect(appointmentService.getAppointments).toHaveBeenCalled();
  }));

  it('should handle delete appointment error', fakeAsync(() => {
    appointmentService.deleteAppointment.mockReturnValue(
      throwError(() => new Error('Delete failed')),
    );
    component.deleteAppointment('1', '1:DELETE');
    tick();
    expect(toastService.show).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(String));
    expect(component.actionLoading['1:DELETE']).toBe(false);
  }));

  it('should update appointment and update state', fakeAsync(() => {
    component.appointments.set([mockAppointments[0]]);
    component.updateAppointment({ id: '1', status: 'CANCELLED' }, '1:CANCELLED');
    tick();
    expect(component.actionLoading['1:CANCELLED']).toBe(false);
    expect(component.appointments()).toEqual([{ ...mockAppointments[0], status: 'CANCELLED' }]);
    expect(component.openModalAppointmentId).toBeNull();
  }));

  it('should handle update appointment error', fakeAsync(() => {
    appointmentService.updateAppointment.mockReturnValue(
      throwError(() => new Error('Update failed')),
    );
    component.updateAppointment({ id: '1', status: 'CANCELLED' }, '1:CANCELLED');
    tick();
    expect(toastService.show).toHaveBeenCalledWith(expect.any(String), 'error', expect.any(String));
    expect(component.actionLoading['1:CANCELLED']).toBe(false);
  }));

  it('should navigate to chat room', fakeAsync(() => {
    component.messageDoctor('provider1');
    tick();
    expect(roomService.getOrCreateRoom).toHaveBeenCalledWith('provider1');
    expect(router.navigate).toHaveBeenCalledWith(['patients/appointments/message', 'room1']);
    expect(component.openModalAppointmentId).toBeNull();
  }));

  it('should return correct appointment actions', () => {
    expect(component.getAppointmentActions('SCHEDULED')).toEqual([
      { label: 'Cancel Appointment', status: 'CANCELLED', color: 'text-red-600' },
      { label: 'In Progress', status: 'IN_PROGRESS', color: 'text-amber-600' },
      { label: 'Completed', status: 'COMPLETED', color: 'text-green-600' },
    ]);
    expect(component.getAppointmentActions('IN_PROGRESS')).toEqual([
      { label: 'Completed', status: 'COMPLETED', color: 'text-green-600' },
    ]);
    expect(component.getAppointmentActions('COMPLETED')).toEqual([
      { label: 'Delete Appointment', status: 'DELETE', color: 'text-red-600' },
    ]);
    expect(component.getAppointmentActions('CANCELLED')).toEqual([
      { label: 'Delete Appointment', status: 'DELETE', color: 'text-red-600' },
    ]);
    expect(component.getAppointmentActions('UNKNOWN' as AppointmentStatus)).toEqual([]);
  });

  it('should check action loading state', () => {
    component.actionLoading['1:DELETE'] = true;
    expect(component.isActionLoading('1', 'DELETE')).toBe(true);
    expect(component.isActionLoading('1', 'CANCELLED')).toBe(false);
  });
});
