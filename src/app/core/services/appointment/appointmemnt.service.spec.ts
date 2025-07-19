import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AppointmentService } from './appointmemnt.service';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { Appointment, AppointmentResponse, Pageable } from '@shared/models/appointments';
import { environment } from '@core/environments/environments';

const mockApiService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

describe('AppointmentService', () => {
  let service: AppointmentService;
  const baseUrl = environment.gatewayUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentService, { provide: ApiService, useValue: mockApiService }],
    });
    service = TestBed.inject(AppointmentService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppointments', () => {
    it('should call ApiService.get with correct parameters and return AppointmentResponse', (done) => {
      const params: Pageable = { status: 'SCHEDULED', pageNumber: 2, pageSize: 10 };
      const queryString = '?status=SCHEDULED&page=2&size=10';
      const mockResponse: AppointmentResponse = {
        data: {
          content: [],
          pageable: { pageNumber: 2, pageSize: 10, status: 'SCHEDULED' },
          totalElements: 0,
          totalPages: 0,
        },
        message: 'Success',
      };
      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getAppointments(params).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.get).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.getAppointments(queryString),
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should omit status if status is ALL', (done) => {
      const params: Pageable = { status: 'ALL', pageNumber: 1, pageSize: 5 };
      const queryString = '?page=1&size=5';
      const mockResponse: AppointmentResponse = {
        data: {
          content: [],
          pageable: { pageNumber: 1, pageSize: 5, status: 'ALL' },
          totalElements: 0,
          totalPages: 0,
        },
        message: 'Success',
      };
      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getAppointments(params).subscribe({
        next: () => {
          expect(mockApiService.get).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.getAppointments(queryString),
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.get', (done) => {
      const params: Pageable = { status: 'SCHEDULED', pageNumber: 1, pageSize: 5 };
      const error = new Error('Failed to fetch appointments');
      mockApiService.get.mockReturnValue(throwError(() => error));

      service.getAppointments(params).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.get).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle empty query parameters', (done) => {
      const params: Pageable = { status: 'ALL' };
      const mockResponse: AppointmentResponse = {
        data: {
          content: [],
          pageable: { pageNumber: 0, pageSize: 0, status: 'ALL' },
          totalElements: 0,
          totalPages: 0,
        },
        message: 'Success',
      };
      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getAppointments(params).subscribe({
        next: () => {
          expect(mockApiService.get).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.getAppointments(''),
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });
  });

  describe('deleteAppointment', () => {
    it('should call ApiService.delete with correct parameters', (done) => {
      const id = '123';
      mockApiService.delete.mockReturnValue(of(void 0));

      service.deleteAppointment(id).subscribe({
        next: (response) => {
          expect(response).toBeUndefined();
          expect(mockApiService.delete).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.deleteAppointment(id),
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.delete', (done) => {
      const id = '123';
      const error = new Error('Failed to delete appointment');
      mockApiService.delete.mockReturnValue(throwError(() => error));

      service.deleteAppointment(id).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.delete).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.deleteAppointment(id),
          );
          done();
        },
      });
    });
  });

  describe('updateAppointment', () => {
    it('should call ApiService.patch with correct parameters', (done) => {
      const appointment: Appointment = { id: '456', status: 'COMPLETED' } as Appointment;
      mockApiService.patch.mockReturnValue(of(void 0));

      service.updateAppointment(appointment).subscribe({
        next: (response) => {
          expect(response).toBeUndefined();
          expect(mockApiService.patch).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.updateAppointment(appointment.id, appointment.status),
            {},
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.patch', (done) => {
      const appointment: Appointment = { id: '456', status: 'CANCELLED' } as Appointment;
      const error = new Error('Failed to update appointment');
      mockApiService.patch.mockReturnValue(throwError(() => error));

      service.updateAppointment(appointment).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.patch).toHaveBeenCalledWith(
            baseUrl,
            endpoints.appointments.updateAppointment(appointment.id, appointment.status),
            {},
          );
          done();
        },
      });
    });
  });
});
