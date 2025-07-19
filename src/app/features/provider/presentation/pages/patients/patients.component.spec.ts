/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientsPageComponent } from './patients.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { PatientService } from '@core/services/patient/patient.service';
import { ToastService } from '@core/services/toast/toast.service';
import { PaginatedPatientResponse, PatientResponse } from '@shared/models/patient';
import { toastNotifications } from '@shared/constants/toast';

describe('PatientsPageComponent', () => {
  let component: PatientsPageComponent;
  let fixture: ComponentFixture<PatientsPageComponent>;
  let router: Router;
  let patientService: PatientService;
  let toastService: ToastService;

  const mockPatients: PatientResponse[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'jonedoe@example.com',
      dateOfBirth: '11/12/2321',
      phoneNumber: '1234567890',
      hasConsent: true,
      status: 'PENDING',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'janesmith@example.com',
      dateOfBirth: '11/12/2321',
      phoneNumber: '1234567890',
      hasConsent: false,
      status: 'PENDING',
    },
  ];

  const mockPaginatedResponse: PaginatedPatientResponse = {
    content: mockPatients,
    totalElements: 2,
    page: 1,
    size: 10,
    totalPages: 1,
    last: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            queryParamMap: of({
              get: (key: string) => null,
              has: (key: string) => false,
              getAll: (key: string) => [],
              keys: [],
            }),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
        {
          provide: PatientService,
          useValue: {
            getAllPatients: jest.fn(() => of(mockPaginatedResponse)),
            requestAccess: jest.fn(() => of(void 0)),
          },
        },
        {
          provide: ToastService,
          useValue: {
            show: jest.fn(),
          },
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    patientService = TestBed.inject(PatientService);
    toastService = TestBed.inject(ToastService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load patients on init', fakeAsync(() => {
      const getAllPatientsSpy = jest.spyOn(patientService, 'getAllPatients');
      fixture.detectChanges();
      tick();

      expect(getAllPatientsSpy).toHaveBeenCalled();
      expect(component['patients']()).toEqual(mockPatients);
    }));
  });

  describe('handlePatientSearch', () => {
    it('should search patients with valid keyword', fakeAsync(() => {
      const searchSpy = jest.spyOn(patientService, 'getAllPatients');
      const searchTerm = 'John';
      component['searchKeyword']().setValue(searchTerm);

      component['handlePatientSearch']();
      tick();

      expect(searchSpy).toHaveBeenCalledWith(
        searchTerm,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(component['patients']()).toEqual(mockPatients);
    }));
  });

  describe('handleViewRecords', () => {
    beforeEach(fakeAsync(() => {
      jest.spyOn(patientService, 'getAllPatients').mockReturnValue(of(mockPaginatedResponse));
      fixture.detectChanges();
      tick();
    }));

    it('should navigate to patient records if consent exists', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component['handleViewRecords']('1');

      expect(navigateSpy).toHaveBeenCalledWith(['/provider/patients', '1']);
    });

    it('should request access if no consent exists', fakeAsync(() => {
      const requestSpy = jest.spyOn(patientService, 'requestAccess').mockReturnValue(of(void 0));
      const toastSpy = jest.spyOn(toastService, 'show');

      component['handleViewRecords']('2');
      tick();

      expect(requestSpy).toHaveBeenCalledWith('2');
      expect(toastSpy).toHaveBeenCalledWith(
        toastNotifications.operations.request,
        toastNotifications.status.success,
      );
    }));

    it('should handle error when request access fails', fakeAsync(() => {
      const requestSpy = jest
        .spyOn(patientService, 'requestAccess')
        .mockReturnValue(throwError(() => new Error('Failed to request')));
      const toastSpy = jest.spyOn(toastService, 'show');

      component['handleViewRecords']('2');
      tick();

      expect(requestSpy).toHaveBeenCalledWith('2');
      expect(toastSpy).toHaveBeenCalledWith(
        toastNotifications.operations.actionFail,
        toastNotifications.status.error,
      );
    }));
  });

  describe('onFilterChange', () => {
    let filterSpy: jest.SpyInstance;

    beforeEach(fakeAsync(() => {
      filterSpy = jest
        .spyOn(patientService, 'getAllPatients')
        .mockReturnValue(of(mockPaginatedResponse));
      fixture.detectChanges();
      tick();
    }));

    it('should apply age range filter', fakeAsync(() => {
      filterSpy.mockClear();
      component['onFilterChange']({ label: 'Age Range', value: '18-30' });
      tick();

      expect(filterSpy).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        '18-30',
        undefined,
        undefined,
      );
    }));

    it('should apply gender filter', fakeAsync(() => {
      filterSpy.mockClear();
      component['onFilterChange']({ label: 'Gender', value: 'Male' });
      tick();

      expect(filterSpy).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        'Male',
        undefined,
      );
    }));

    it('should apply last visit filter', fakeAsync(() => {
      filterSpy.mockClear();
      component['onFilterChange']({ label: 'Last Visit', value: '2025-01-01' });
      tick();

      expect(filterSpy).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '2025-01-01',
      );
    }));

    it('should reset filters when no value provided', fakeAsync(() => {
      const filterSpy = jest.spyOn(patientService, 'getAllPatients');
      component['searchKeyword']().setValue('John');
      component['onFilterChange']({ label: 'Age Range', value: null });
      tick();

      expect(filterSpy).toHaveBeenCalledWith(
        'John',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    }));

    it('should combine search term with filters', fakeAsync(() => {
      const filterSpy = jest.spyOn(patientService, 'getAllPatients');
      component['searchKeyword']().setValue('John');
      component['onFilterChange']({ label: 'Gender', value: 'Male' });
      tick();

      expect(filterSpy).toHaveBeenCalledWith(
        'John',
        undefined,
        undefined,
        undefined,
        'Male',
        undefined,
      );
    }));
  });

  describe('Navigation', () => {
    it('should navigate to chat room when handleNavigateToChatRoom is called', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      component['handleNavigateToChatRoom']();

      expect(navigateSpy).toHaveBeenCalledWith(['provider/patients/messages']);
    });
  });
});
