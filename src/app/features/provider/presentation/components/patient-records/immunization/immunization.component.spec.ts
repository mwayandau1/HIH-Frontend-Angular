import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, delay } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ImmunizationComponent } from './immunization.component';
import { ImmunizationsService } from '@core/services/immunizations/immunizations.service';
import { ToastService } from '@core/services/toast/toast.service';
import { ImmunizationResponse, Immunization } from '@shared/models/immunizations';
import { toastNotifications } from '@shared/constants/toast';

describe('ImmunizationComponent', () => {
  let component: ImmunizationComponent;
  let fixture: ComponentFixture<ImmunizationComponent>;
  let mockImmunizationsService: jest.Mocked<ImmunizationsService>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockRouter: jest.Mocked<Router>;

  const mockImmunizationsData: Immunization[] = [
    {
      id: 1,
      vaccineName: 'COVID-19 Vaccine',
      dateAdministered: '2024-01-15T00:00:00.000Z',
      doseNumber: '1st dose',
    },
    {
      id: 2,
      vaccineName: 'Flu Shot',
      dateAdministered: '2024-01-20T00:00:00.000Z',
      doseNumber: 'Annual',
    },
  ];

  const mockImmunizationResponse: ImmunizationResponse = {
    success: true,
    message: 'Immunizations retrieved successfully',
    data: mockImmunizationsData,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const immunizationsServiceSpy = {
      getImmunizations: jest.fn(),
      addImmunization: jest.fn(),
    } as unknown as jest.Mocked<ImmunizationsService>;

    const toastServiceSpy = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    const routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [ImmunizationComponent, ReactiveFormsModule],
      providers: [
        { provide: ImmunizationsService, useValue: immunizationsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImmunizationComponent);
    component = fixture.componentInstance;
    mockImmunizationsService = TestBed.inject(
      ImmunizationsService,
    ) as jest.Mocked<ImmunizationsService>;
    mockToastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;

    fixture.componentRef.setInput('patientId', '123');
    fixture.componentRef.setInput('paginated', false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getImmunizations with patientId on init when patientId exists', () => {
      mockImmunizationsService.getImmunizations.mockReturnValue(
        of(mockImmunizationResponse).pipe(delay(1)),
      );

      component.ngOnInit();

      expect(mockImmunizationsService.getImmunizations).toHaveBeenCalledWith('123');
    });

    it('should not call getImmunizations when patientId is empty', () => {
      fixture.componentRef.setInput('patientId', '');

      component.ngOnInit();

      expect(mockImmunizationsService.getImmunizations).not.toHaveBeenCalled();
    });
  });

  describe('getImmunizations', () => {
    it('should load immunizations successfully', fakeAsync(() => {
      mockImmunizationsService.getImmunizations.mockReturnValue(
        of(mockImmunizationResponse).pipe(delay(1)),
      );

      component.getImmunizations('123');
      tick(1);

      expect(component.loading()).toBeFalsy();
      expect(component.immunizations()).toEqual(mockImmunizationsData);
    }));

    it('should handle error when loading immunizations fails', fakeAsync(() => {
      const error = new Error('Failed to load immunizations');
      mockImmunizationsService.getImmunizations.mockReturnValue(
        throwError(() => error).pipe(delay(1)),
      );

      component.getImmunizations('123');
      tick(1);

      expect(component.loading()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.failsToload,
      );
    }));

    it('should set loading to true when starting to load immunizations', fakeAsync(() => {
      mockImmunizationsService.getImmunizations.mockReturnValue(
        of(mockImmunizationResponse).pipe(delay(1)),
      );

      component.getImmunizations('123');
      expect(component.loading()).toBeTruthy();

      tick(1);
      expect(component.loading()).toBeFalsy();
    }));
  });

  describe('createImmunization', () => {
    beforeEach(() => {
      // Ensure the form is valid by setting required fields
      component.immunizationFrom.patchValue({
        vaccineName: 'Test Vaccine',
        doseNumber: '1st dose',
        dateAdministered: '2024-01-15T00:00:00.000Z',
      });
    });

    it('should create immunization successfully', fakeAsync(() => {
      const mockNewImmunization: Immunization = {
        vaccineName: 'Test Vaccine',
        dateAdministered: '2024-01-15T00:00:00.000Z',
        doseNumber: '1st dose',
      };

      mockImmunizationsService.addImmunization.mockReturnValue(
        of(mockNewImmunization).pipe(delay(1)),
      );

      component.createImmunization(mockNewImmunization, component.immunizationFrom);
      tick(1);

      expect(component.creating()).toBeFalsy();
      expect(mockImmunizationsService.addImmunization).toHaveBeenCalledWith(mockNewImmunization);
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.create,
        toastNotifications.status.success,
        toastNotifications.messages.recordCreated,
      );
      expect(component.immunizationFrom.value).toEqual({
        vaccineName: null,
        doseNumber: null,
        dateAdministered: null,
      });
    }));

    it('should handle error when creating immunization fails', fakeAsync(() => {
      const error = new Error('Failed to create immunization');
      mockImmunizationsService.addImmunization.mockReturnValue(
        throwError(() => error).pipe(delay(1)),
      );

      const mockNewImmunization: Immunization = {
        vaccineName: 'Test Vaccine',
        dateAdministered: '2024-01-15T00:00:00.000Z',
        doseNumber: '1st dose',
      };

      component.createImmunization(mockNewImmunization, component.immunizationFrom);
      tick(1);

      expect(component.creating()).toBeFalsy();
      expect(mockImmunizationsService.addImmunization).toHaveBeenCalledWith(mockNewImmunization);
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.create, // Assuming this is the correct constant name
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
    }));

    it('should set creating to true during immunization creation', fakeAsync(() => {
      const mockNewImmunization: Immunization = {
        vaccineName: 'Test Vaccine',
        dateAdministered: '2024-01-15T00:00:00.000Z',
        doseNumber: '1st dose',
      };

      mockImmunizationsService.addImmunization.mockReturnValue(
        of(mockNewImmunization).pipe(delay(1)),
      );

      component.createImmunization(mockNewImmunization, component.immunizationFrom);
      expect(component.creating()).toBeTruthy();

      tick(1);
      expect(component.creating()).toBeFalsy();
      expect(mockImmunizationsService.addImmunization).toHaveBeenCalledWith(mockNewImmunization);
    }));

    it('should not create immunization if form is invalid', () => {
      component.immunizationFrom.reset(); // Reset to make form invalid (vaccineName is required)
      const mockNewImmunization: Immunization = {
        vaccineName: '',
        dateAdministered: '2024-01-15T00:00:00.000Z',
        doseNumber: '1st dose',
      };

      component.createImmunization(mockNewImmunization, component.immunizationFrom);

      expect(mockImmunizationsService.addImmunization).not.toHaveBeenCalled();
      expect(component.immunizationFrom.touched).toBeTruthy();
    });
  });

  describe('visitAllImmunizations', () => {
    it('should navigate to immunizations page with correct patient ID', () => {
      fixture.componentRef.setInput('patientId', '456');

      component.visitAllImmunizations();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/provider',
        'patients',
        '456',
        'immunizations',
      ]);
    });
  });

  describe('filteredImmunizations computed', () => {
    beforeEach(() => {
      component.immunizations.set(mockImmunizationsData);
    });

    it('should return first 3 immunizations when paginated is false', () => {
      fixture.componentRef.setInput('paginated', false);

      const componentWithProtectedAccess = component as ImmunizationComponent & {
        filteredImmunizations: () => Immunization[];
      };
      expect(componentWithProtectedAccess.filteredImmunizations()).toEqual(
        mockImmunizationsData.slice(0, 3),
      );
    });

    it('should return all immunizations when paginated is true', () => {
      fixture.componentRef.setInput('paginated', true);

      const componentWithProtectedAccess = component as ImmunizationComponent & {
        filteredImmunizations: () => Immunization[];
      };
      expect(componentWithProtectedAccess.filteredImmunizations()).toEqual(mockImmunizationsData);
    });

    it('should return empty array when no immunizations', () => {
      component.immunizations.set([]);
      fixture.componentRef.setInput('paginated', false);

      const componentWithProtectedAccess = component as ImmunizationComponent & {
        filteredImmunizations: () => Immunization[];
      };
      expect(componentWithProtectedAccess.filteredImmunizations()).toEqual([]);
    });
  });

  describe('modal functionality', () => {
    it('shouldursul toggle add immunization modal', () => {
      expect(component.isAddMedicationModalOpen).toBeFalsy();

      component.toggleAddModal();
      expect(component.isAddMedicationModalOpen).toBeTruthy();

      component.toggleAddModal();
      expect(component.isAddMedicationModalOpen).toBeFalsy();
    });

    it('should cancel add modal', () => {
      component.isAddMedicationModalOpen = true;

      component.cancelAddModal();

      expect(component.isAddMedicationModalOpen).toBeFalsy();
    });
  });

  describe('form functionality', () => {
    it('should initialize form with correct controls', () => {
      expect(component.immunizationFrom).toBeTruthy();
      expect(component.immunizationFrom.get('vaccineName')).toBeTruthy();
      expect(component.immunizationFrom.get('doseNumber')).toBeTruthy();
      expect(component.immunizationFrom.get('dateAdministered')).toBeTruthy();
    });

    it('should return correct form controls from getters', () => {
      expect(component.vaccineName).toBe(component.immunizationFrom.get('vaccineName'));
      expect(component.doseNumber).toBe(component.immunizationFrom.get('doseNumber'));
    });

    it('should validate form when values are entered', () => {
      component.immunizationFrom.patchValue({
        vaccineName: 'Test Vaccine',
        doseNumber: '1st dose',
        dateAdministered: '2024-01-15T00:00:00.000Z',
      });

      expect(component.immunizationFrom.valid).toBeTruthy();
    });

    it('should be invalid when required fields are empty', () => {
      expect(component.immunizationFrom.valid).toBeFalsy();
    });
  });

  describe('saveChanges', () => {
    it('should call createImmunization with form data', fakeAsync(() => {
      const createImmunizationSpy = jest.spyOn(component, 'createImmunization');
      const mockNewImmunization: Immunization = {
        vaccineName: 'Test Vaccine',
        doseNumber: '1st dose',
        dateAdministered: '2024-01-15T00:00:00.000Z',
        patientId: '123',
      };

      mockImmunizationsService.addImmunization.mockReturnValue(
        of(mockNewImmunization).pipe(delay(1)),
      );

      component.immunizationFrom.patchValue({
        vaccineName: 'Test Vaccine',
        doseNumber: '1st dose',
        dateAdministered: '2024-01-15T00:00:00.000Z',
      });

      component.saveChanges();
      tick(1);

      expect(createImmunizationSpy).toHaveBeenCalledWith(
        mockNewImmunization,
        component.immunizationFrom,
      );
    }));
  });

  describe('loading state', () => {
    it('should start with loading as false', () => {
      expect(component.loading()).toBeFalsy();
    });

    it('should start with creating as false', () => {
      expect(component.creating()).toBeFalsy();
    });

    it('should set loading to true during API call', fakeAsync(() => {
      mockImmunizationsService.getImmunizations.mockReturnValue(
        of(mockImmunizationResponse).pipe(delay(1)),
      );

      component.getImmunizations('123');
      expect(component.loading()).toBeTruthy();

      tick(1);
      expect(component.loading()).toBeFalsy();
    }));

    it('should set creating to true during immunization creation', fakeAsync(() => {
      const mockNewImmunization: Immunization = {
        vaccineName: 'Test Vaccine',
        dateAdministered: '2024-01-15T00:00:00.000Z',
        doseNumber: '1st dose',
      };

      mockImmunizationsService.addImmunization.mockReturnValue(
        of(mockNewImmunization).pipe(delay(1)),
      );

      component.immunizationFrom.patchValue({
        vaccineName: 'Test Vaccine',
        doseNumber: '1st dose',
        dateAdministered: '2024-01-15T00:00:00.000Z',
      });

      component.createImmunization(mockNewImmunization, component.immunizationFrom);
      expect(component.creating()).toBeTruthy();

      tick(1);
      expect(mockImmunizationsService.addImmunization).toHaveBeenCalled();
      expect(component.creating()).toBeFalsy();
    }));
  });
});
