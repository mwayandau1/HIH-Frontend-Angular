/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PatientPageComponent } from './patient.component';
import { PatientService } from '@core/services/patient/patient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PatientDetails } from '@shared/models/patient';
import { getAgeFromDOB } from '@shared/utils/helpers/dates';
import { By } from '@angular/platform-browser';
import { ThemedLoaderComponent } from '@shared/components/themed-loader/themed-loader.component';
import { Gender } from '@shared/models';
import { DestroyRef } from '@angular/core';
import { RoomService } from '@core/services/room/room.service';

class MockActivatedRoute {
  params: Observable<any> = of({ id: '123' });
  emptyParams: Observable<any> = of({});
  undefinedRoute: Observable<any> = of(undefined);
  snapshot = {
    paramMap: {
      get: (key: string) => '123',
      has: (key: string) => true,
      getAll: (key: string) => ['123'],
      keys: ['id'],
    },
  };
}

class MockRoomService {
  getOrCreateRoom = jest.fn().mockReturnValue(of({ id: 'room123' }));
}

describe('PatientPageComponent', () => {
  let component: PatientPageComponent;
  let fixture: ComponentFixture<PatientPageComponent>;
  let mockPatientService: jest.Mocked<PatientService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: MockActivatedRoute;
  let mockRoomService: MockRoomService;

  const mockPatient: PatientDetails = {
    id: 'p12345',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    address: '123 Health Street, Wellness City, GH',
    gender: Gender.Male,
    phoneNumber: '+233201234567',
    dateOfBirth: '1990-03-15',
    emergencyContact: 'Jane Doe - +233501234567',
    allergies: [
      {
        id: '1',
        substance: 'Peanuts',
        reaction: 'Anaphylaxis',
        severity: 'Severe',
      },
    ],
    medications: [
      {
        id: 1,
        prescribedBy: 'Dr. Smith',
        medicationName: 'Atorvastatin',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2025-01-10T08:00:00.000Z',
        endDate: '2025-12-10T08:00:00.000Z',
      },
    ],
    immunizations: [
      {
        id: 1,
        vaccineName: 'COVID-19 Vaccine',
        dateAdministered: '2023-04-05T10:00:00.000Z',
        doseNumber: '2',
      },
    ],
    consents: [
      {
        id: 1,
        providerId: 'prov987',
        consentGiven: true,
        consentedOn: '2025-06-20T14:30:00.000Z',
      },
    ],
    labResults: [
      {
        id: 1,
        labTest: 'Blood Glucose',
        value: '90',
        unit: 'mg/dL',
        resultDate: '2025-06-15T09:00:00.000Z',
        referenceRange: '70-110',
        status: 'Normal',
        notes: 'No concerns.',
      },
    ],
    medInformations: {
      id: 1,
      primaryPhysician: 'Dr. Smith',
      bloodType: 'O',
      rhFactor: 'Positive',
      medicalHistory: 'Hypertension',
      familyMedicalHistory: 'Diabetes',
      geneticDisorders: 'None',
      sexAtBirth: Gender.Male,
    },
    vitals: [
      {
        id: 1,
        height: 1.8,
        weight: 75.5,
        age: 35,
        bloodPressure: '120/80',
        heartRate: '72 bpm',
        temperature: 36.6,
        recordedAt: '2025-07-03T08:30:00.000Z',
      },
    ],
    conditions: [
      {
        id: '1',
        conditionName: 'Hypertension',
        description: 'High blood pressure',
        severity: 'Moderate',
        treatmentPlan: 'Daily medication and lifestyle changes',
        diagnosisDate: '2022-01-12T00:00:00.000Z',
        notes: 'Under control with meds.',
      },
    ],
    visits: [
      {
        visitDate: '2025-07-04T09:00:00.000Z',
        purpose: 'Check-up',
        notes: 'Discussed medication side effects.',
        providerName: 'Dr. Phil',
        providerId: 'prov123',
        id: '1',
        status: 'Completed',
      },
    ],
    insurance: {
      id: 1,
      provider: 'Ghana Health Insurance Corp.',
      insuranceId: 'GHIC-2025-004321',
      patientId: 'p12345',
    },
  };

  beforeEach(async () => {
    mockPatientService = {
      getPatientById: jest.fn().mockReturnValue(of(mockPatient)),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    mockRoomService = new MockRoomService();

    await TestBed.configureTestingModule({
      imports: [PatientPageComponent],
      providers: [
        { provide: PatientService, useValue: mockPatientService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: DestroyRef, useValue: {} },
        { provide: RoomService, useValue: mockRoomService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPageComponent);
    component = fixture.componentInstance;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as unknown as MockActivatedRoute;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component['patientId']()).toBe('123');
    expect(component['isFetchingPatient']()).toBe(false);
  });

  it('should set patientId from route params', () => {
    expect(component['patientId']()).toBe('123');
  });

  it('should fetch patient data when route params change', () => {
    expect(mockPatientService.getPatientById).toHaveBeenCalledWith('123');
    expect(component['patient']()).toEqual(mockPatient);
  });

  it('should clear query params on initialization', () => {
    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: {},
      replaceUrl: true,
    });
  });

  it('should display loader when fetching data', () => {
    component['isFetchingPatient'].set(true);
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.directive(ThemedLoaderComponent));
    expect(loader).toBeTruthy();
  });

  it('should use getAgeFromDOB helper function', () => {
    const testDOB = '2000-01-01';
    const age = component['getAgeFromDOB'](testDOB);
    expect(age).toBe(getAgeFromDOB(testDOB));
  });
  describe('route param handling', () => {
    it('should handle params with id', () => {
      expect(component['patientId']()).toBe('123');
    });

    it('should handle empty params', () => {
      mockActivatedRoute.params = mockActivatedRoute.emptyParams;

      fixture = TestBed.createComponent(PatientPageComponent);
      component = fixture.componentInstance;

      expect(component['patientId']()).toBe('');
    });

    it('should handle undefined params', () => {
      mockActivatedRoute.params = mockActivatedRoute.undefinedRoute;

      fixture = TestBed.createComponent(PatientPageComponent);
      component = fixture.componentInstance;

      expect(component['patientId']()).toBe('');
    });
  });

  it('should navigate to /unauthorized on 401 error from patientService', () => {
    const error401 = { status: 401 };
    mockPatientService.getPatientById = jest.fn().mockReturnValue({
      pipe: () => ({
        subscribe: ({ next, error }: any) => error(error401),
      }),
    } as any);
    fixture = TestBed.createComponent(PatientPageComponent);
    component = fixture.componentInstance;
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should NOT navigate on non-401 error from patientService', () => {
    const error500 = { status: 500 };
    mockPatientService.getPatientById = jest.fn().mockReturnValue({
      pipe: () => ({
        subscribe: ({ next, error }: any) => error(error500),
      }),
    } as any);
    fixture = TestBed.createComponent(PatientPageComponent);
    component = fixture.componentInstance;
    // Should not navigate to /unauthorized
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/unauthorized']);
  });

  describe('handleMessagePatient', () => {
    it('should navigate to messages with room ID when patient has ID', fakeAsync(() => {
      component['patientId'].set('123');
      component['handleMessagePatient']();
      tick();

      expect(mockRoomService.getOrCreateRoom).toHaveBeenCalledWith('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['provider/patients/messages', 'room123']);
    }));
  });
});
