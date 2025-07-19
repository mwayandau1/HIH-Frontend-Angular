/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PatientVisitsComponent } from './patient-visits.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ActivatedRoute, convertToParamMap, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '@core/services/patient/patient.service';
import { ToastService } from '@core/services/toast/toast.service';
import {
  LoaderComponent,
  ModalComponent,
  InputComponent,
  DatePickerComponent,
} from '@shared/components';
import { toastNotifications } from '@shared/constants/toast';

describe('PatientVisitsComponent', () => {
  let component: PatientVisitsComponent;
  let fixture: ComponentFixture<PatientVisitsComponent>;

  let mockActivatedRoute: any;
  let mockPatientService: any;
  let mockToastService: any;

  const mockPaginatedVisits = {
    content: [
      {
        id: 'visit-001',
        purpose: 'Annual Checkup',
        visitDate: '2025-07-01T10:00:00.000Z',
        patientId: 'patient-123',
        providerName: 'Provider',
        providerId: 'provider-456',
        notes: 'Patient reported mild headaches and fatigue.',
        status: 'COMPLETED',
        createdAt: '2025-06-25T08:15:00.000Z',
        updatedAt: '2025-07-01T12:00:00.000Z',
      },
      {
        id: 'visit-002',
        purpose: 'Follow-up Visit',
        visitDate: '2025-07-05T14:30:00.000Z',
        patientId: 'patient-789',
        providerName: 'Provider',
        providerId: 'provider-456',
        notes: 'Follow-up after medication adjustments. Patient doing well.',
        status: 'SCHEDULED',
        createdAt: '2025-06-28T09:20:00.000Z',
        updatedAt: '2025-06-28T09:20:00.000Z',
      },
      {
        id: 'visit-003',
        purpose: 'Initial Consultation',
        visitDate: '2025-07-10T09:00:00.000Z',
        patientId: 'patient-456',
        providerName: 'Provider',
        providerId: 'provider-999',
        notes: 'New patient consultation. Discussed medical history and symptoms.',
        status: 'SCHEDULED',
        createdAt: '2025-07-01T10:10:00.000Z',
        updatedAt: '2025-07-01T10:10:00.000Z',
      },
      {
        id: 'visit-004',
        purpose: 'Lab Results Review',
        visitDate: '2025-07-12T11:45:00.000Z',
        patientId: 'patient-321',
        providerName: 'Provider',
        providerId: 'provider-123',
        notes: 'Discussed blood test results. No anomalies found.',
        status: 'COMPLETED',
        createdAt: '2025-07-05T08:00:00.000Z',
        updatedAt: '2025-07-12T12:00:00.000Z',
      },
      {
        id: 'visit-005',
        purpose: 'Physiotherapy Session',
        visitDate: '2025-07-15T16:00:00.000Z',
        patientId: 'patient-654',
        providerName: 'Provider',
        providerId: 'provider-777',
        notes: 'Started mobility exercises. Patient progressing well.',
        status: 'SCHEDULED',
        createdAt: '2025-07-06T13:30:00.000Z',
        updatedAt: '2025-07-06T13:30:00.000Z',
      },
    ],
    totalPages: 2,
    totalElements: 5,
    size: 4,
    number: 1,
  };

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: of({ page: '1' }),
      queryParamMap: of(convertToParamMap({ page: '1' })),
      params: of({ id: '123' }),
    };

    mockPatientService = {
      getPatientVisits: jest.fn().mockReturnValue(of({ data: mockPaginatedVisits })),
      postPatientVisits: jest.fn().mockReturnValue(of({})),
    };

    mockToastService = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        PatientVisitsComponent,
        ButtonComponent,
        DatePipe,
        LucideAngularModule,
        PaginationComponent,
        RouterModule,
        ReactiveFormsModule,
        LoaderComponent,
        ModalComponent,
        InputComponent,
        DatePickerComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PatientService, useValue: mockPatientService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component['currentPage']()).toBe(1);
    expect(component['pageItems']()?.length).toBe(4);
    expect(component['patientId']()).toBe('123');
  });

  it('should correctly paginate visits', () => {
    expect(component['pageItems']()?.length).toBe(4);
    expect(component['pageItems']()?.[0].id).toBe('visit-001');
    expect(component['pageItems']()?.[3].id).toBe('visit-004');

    component['currentPage'].set(2);
    fixture.detectChanges();

    expect(component['pageItems']()?.length).toBe(1);
    expect(component['pageItems']()?.[0].id).toBe('visit-005');
  });

  it('should handle invalid page numbers from query params', () => {
    mockActivatedRoute.queryParams = of({ page: 'invalid' });
    fixture.detectChanges();
    expect(component['currentPage']()).toBe(1);

    mockActivatedRoute.queryParams = of({ page: '-1' });
    fixture.detectChanges();
    expect(component['currentPage']()).toBe(1);
  });

  it('should update currentPage from query params', fakeAsync(() => {
    mockActivatedRoute.queryParams = of({ page: '2' });
    fixture = TestBed.createComponent(PatientVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(component['currentPage']()).toBe(2);
  }));

  it('should handle empty visits input', () => {
    mockPatientService.getPatientVisits.mockReturnValue(
      of({ data: { content: [], totalElements: 0 } }),
    );
    fixture = TestBed.createComponent(PatientVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['pageItems']()?.length).toBe(0);
  });

  it('should display correct icons', () => {
    expect(component['icons']).toEqual({
      Calendar: expect.anything(),
      User: expect.anything(),
      FileText: expect.anything(),
    });
  });

  it('should fetch visits on init', () => {
    expect(mockPatientService.getPatientVisits).toHaveBeenCalled();
    expect(component['visits']()).toEqual(mockPaginatedVisits);
  });

  it('should handle form submission', fakeAsync(() => {
    component['isModalOpen'].set(true);
    fixture.detectChanges();

    component['visitForm'].setValue({
      date: '2023-06-01',
      visitPurpose: 'Checkup',
      visitNote: 'Routine checkup',
    });

    component['onSubmit']();
    tick();

    expect(mockPatientService.postPatientVisits).toHaveBeenCalledWith(
      'Checkup',
      expect.any(String),
      'Routine checkup',
      '123',
    );
    expect(mockToastService.show).toHaveBeenCalled();
    expect(component['isModalOpen']()).toBe(false);
  }));

  it('should not submit invalid form', () => {
    component['visitForm'].setValue({
      date: '',
      visitPurpose: '',
      visitNote: '',
    });

    component['onSubmit']();

    expect(mockPatientService.postPatientVisits).not.toHaveBeenCalled();
  });

  it('should handle fetch visits error', fakeAsync(() => {
    mockPatientService.getPatientVisits.mockReturnValue(throwError(() => new Error('Error')));

    fixture = TestBed.createComponent(PatientVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(mockToastService.show).toHaveBeenCalled();
  }));

  it('should show error toast when form submission fails', fakeAsync(() => {
    const { operations, status } = toastNotifications;
    mockPatientService.postPatientVisits.mockReturnValue(throwError(() => new Error('API Error')));

    component['isModalOpen'].set(true);
    fixture.detectChanges();

    component['visitForm'].setValue({
      date: '2023-06-01',
      visitPurpose: 'Checkup',
      visitNote: 'Routine checkup',
    });

    component['onSubmit']();
    tick();

    expect(mockPatientService.postPatientVisits).toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith(operations.actionFail, status.error);
  }));

  describe('initializeQueryParams', () => {
    it('should set currentPage to 1 when no page param', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({});
      fixture = TestBed.createComponent(PatientVisitsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(1);
    }));

    it('should set currentPage to parsed page number', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ page: '2' });
      fixture = TestBed.createComponent(PatientVisitsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(2);
    }));

    it('should handle invalid page numbers', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ page: 'invalid' });
      fixture = TestBed.createComponent(PatientVisitsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(1);
    }));

    it('should handle negative page numbers', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ page: '-1' });
      fixture = TestBed.createComponent(PatientVisitsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(1);
    }));
  });

  describe('initializeRouteParams', () => {
    it('should set patientId from route params', fakeAsync(() => {
      mockActivatedRoute.params = of({ id: 'patient-123' });
      fixture = TestBed.createComponent(PatientVisitsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component['patientId']()).toBe('patient-123');
    }));

    it('should set empty patientId when no id param', fakeAsync(() => {
      mockActivatedRoute.params = of({});
      fixture = TestBed.createComponent(PatientVisitsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component['patientId']()).toBe('');
    }));
  });
});
