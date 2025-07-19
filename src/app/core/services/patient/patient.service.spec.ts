import { TestBed } from '@angular/core/testing';
import { PatientService } from './patient.service';
import { ApiService } from '../api/api.service';
import { of } from 'rxjs';
import {
  ConsentResponse,
  ConsentStatus,
  PaginatedPatientResponse,
  PatientResponse,
  PaginatedPatientNoteResponse,
  PaginatedData,
  PatientNote,
  PaginatedPatientVisitResponse,
} from '@shared/models/patient';
import { environment } from '@core/environments/environments';
import { endpoints } from '@shared/constants/endpoints';

describe('PatientService', () => {
  let service: PatientService;
  let apiServiceMock: jest.Mocked<ApiService>;
  const baseUrl = environment.gatewayUrl;

  const mockPaginatedResponse: PaginatedPatientResponse = {
    content: [],
    totalElements: 0,
    page: 1,
    size: 10,
    totalPages: 1,
    last: true,
  };

  const mockPatientResponse: PatientResponse = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '123456789',
    dateOfBirth: '11/22/33',
    hasConsent: true,
    status: 'PENDING',
  };

  const mockConsentResponse: ConsentResponse = {
    success: true,
    message: 'success',
    data: {
      id: 0,
      patientId: '',
      providerId: '',
      consentGiven: true,
      consentedOn: '2025-07-02T15:26:21.206Z',
      status: ConsentStatus.GRANTED,
      updatedBy: '',
    },
    timestamp: '2025-07-02T15:26:21.206Z',
  };

  const mockPaginatedData: PaginatedData<PatientNote> = {
    totalElements: 10,
    totalPages: 1,
    pageable: {
      paged: true,
      pageNumber: 1,
      pageSize: 10,
      offset: 12,
      sort: {
        sorted: false,
        empty: false,
        unsorted: true,
      },
      unpaged: false,
    },
    first: true,
    last: false,
    size: 1,
    content: [],
    number: 1,
    sort: {
      sorted: false,
      empty: false,
      unsorted: true,
    },
    numberOfElements: 1,
    empty: false,
  };

  const mockPaginatedNotesResponse: PaginatedPatientNoteResponse = {
    success: true,
    message: 'success',
    data: mockPaginatedData,
    timestamp: '',
  };

  const mockPaginatedVisitsResponse: PaginatedPatientVisitResponse = {
    success: true,
    message: 'success',
    data: {
      ...mockPaginatedData,
      content: [
        {
          id: 'visit-001',
          title: 'Annual Checkup',
          visitDate: '2025-07-01T10:00:00.000Z',
          patientId: 'patient-123',
          providerId: 'provider-456',
          notes: 'Patient reported mild headaches and fatigue.',
          status: 'COMPLETED',
          createdAt: '2025-06-25T08:15:00.000Z',
          updatedAt: '2025-07-01T12:00:00.000Z',
          patientUserId: 'user-123',
        },
      ],
    },
    timestamp: '',
  };

  beforeEach(() => {
    apiServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    TestBed.configureTestingModule({
      providers: [PatientService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(PatientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPatients', () => {
    it('should call ApiService.get with correct parameters', () => {
      apiServiceMock.get.mockReturnValue(of(mockPaginatedResponse));

      service.getAllPatients().subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.patients.getAll());
    });

    it('should include query parameters when provided', () => {
      apiServiceMock.get.mockReturnValue(of(mockPaginatedResponse));

      service.getAllPatients('test', 1, 10, '18-30', 'male', '2025-01-01').subscribe();

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.patients.getAll('test', 1, 10, '18-30', 'male', '2025-01-01'),
      );
    });
  });

  describe('getPatientById', () => {
    it('should call ApiService.get with correct parameters', () => {
      const testId = '123';
      apiServiceMock.get.mockReturnValue(of(mockPatientResponse));

      service.getPatientById(testId).subscribe((response) => {
        expect(response).toEqual(mockPatientResponse);
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.patients.getById(testId));
    });
  });

  describe('requestAccess', () => {
    it('should call ApiService.post with correct parameters', () => {
      const testId = '123';
      apiServiceMock.post.mockReturnValue(of(undefined));

      service.requestAccess(testId).subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith(baseUrl, endpoints.patients.requestAccess, {
        patientId: testId,
      });
    });
  });

  describe('getPatientConsent', () => {
    it('should call ApiService.get with correct parameters', () => {
      const testId = 1;
      apiServiceMock.get.mockReturnValue(of(mockConsentResponse));

      service.getPatientConsent(testId).subscribe((response) => {
        expect(response).toEqual(mockConsentResponse);
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.patients.getConsent(testId),
      );
    });
  });

  describe('getPatientNotes', () => {
    it('should call ApiService.get with correct parameters', () => {
      apiServiceMock.get.mockReturnValue(of(mockPaginatedNotesResponse));

      service.getPatientNotes().subscribe((response) => {
        expect(response).toEqual(mockPaginatedNotesResponse);
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.patients.handleNotes);
    });
  });

  describe('postPatientNotes', () => {
    it('should call ApiService.post with correct parameters', () => {
      const testTitle = 'Test Note';
      const testContent = 'This is a test note content';
      apiServiceMock.post.mockReturnValue(of(undefined));

      service.postPatientNotes(testTitle, testContent).subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith(baseUrl, endpoints.patients.handleNotes, {
        title: testTitle,
        content: testContent,
      });
    });
  });

  describe('getPatientVisits', () => {
    it('should call ApiService.get with correct parameters', () => {
      apiServiceMock.get.mockReturnValue(of(mockPaginatedVisitsResponse));

      service.getPatientVisits().subscribe((response) => {
        expect(response).toEqual(mockPaginatedVisitsResponse);
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.patients.getVisits);
    });
  });

  describe('postPatientVisits', () => {
    it('should call ApiService.post with correct parameters', () => {
      const testTitle = 'Checkup';
      const testDate = '2025-07-01T10:00:00Z';
      const testNote = 'Routine checkup';
      const testPatientId = '123';
      apiServiceMock.post.mockReturnValue(of(undefined));

      service.postPatientVisits(testTitle, testDate, testNote, testPatientId).subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith(baseUrl, endpoints.patients.postVisits, {
        purpose: testTitle,
        visitDate: testDate,
        notes: testNote,
        patientId: testPatientId,
      });
    });
  });
});
