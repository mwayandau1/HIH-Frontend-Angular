import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, delay } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MedicationsComponent } from './medications.component';
import { MedicationsService } from '@core/services/medications/medications.service';
import { ToastService } from '@core/services/toast/toast.service';
import { MedicationsResponse, MedicationsData } from '@shared/models/medications';
import { toastNotifications } from '@shared/constants/toast';

describe('MedicationsComponent', () => {
  let component: MedicationsComponent;
  let fixture: ComponentFixture<MedicationsComponent>;
  let mockMedicationsService: jest.Mocked<MedicationsService>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockRouter: jest.Mocked<Router>;

  const mockMedicationsData: MedicationsData[] = [
    {
      id: 1,
      patientId: '123',
      prescribedBy: 'Dr. Smith',
      medicationName: 'Aspirin',
      dosage: '100mg',
      frequency: 'Once daily',
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-02-15T00:00:00.000Z',
    },
    {
      id: 2,
      patientId: '123',
      prescribedBy: 'Dr. Johnson',
      medicationName: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Twice daily',
      startDate: '2024-01-20T00:00:00.000Z',
      endDate: '2024-02-20T00:00:00.000Z',
    },
  ];

  const mockMedicationsResponse: MedicationsResponse = {
    success: true,
    message: 'Medications retrieved successfully',
    data: mockMedicationsData,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const medicationsServiceSpy = {
      getMedications: jest.fn(),
      addMedications: jest.fn(),
    } as unknown as jest.Mocked<MedicationsService>;

    const toastServiceSpy = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    const routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [MedicationsComponent, ReactiveFormsModule],
      providers: [
        { provide: MedicationsService, useValue: medicationsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicationsComponent);
    component = fixture.componentInstance;
    mockMedicationsService = TestBed.inject(MedicationsService) as jest.Mocked<MedicationsService>;
    mockToastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;

    // Set required inputs using Angular 18 pattern
    fixture.componentRef.setInput('patientId', '123');
    fixture.componentRef.setInput('paginated', false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getMedications with patientId on init', () => {
      mockMedicationsService.getMedications.mockReturnValue(of(mockMedicationsResponse));

      component.ngOnInit();

      expect(mockMedicationsService.getMedications).toHaveBeenCalledWith('123');
    });
  });

  describe('getMedications', () => {
    it('should load medications successfully', () => {
      mockMedicationsService.getMedications.mockReturnValue(of(mockMedicationsResponse));

      component.getMedications('123');

      expect(component.loading()).toBeFalsy();
      expect(component.medications()).toEqual(mockMedicationsData);
    });

    it('should handle error when loading medications fails', () => {
      const error = new Error('Failed to load medications');
      mockMedicationsService.getMedications.mockReturnValue(throwError(() => error));

      component.getMedications('123');

      expect(component.loading()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.failsToload,
      );
    });

    it('should set loading to true when starting to load medications', () => {
      mockMedicationsService.getMedications.mockReturnValue(of(mockMedicationsResponse));

      component.getMedications('123');

      expect(mockMedicationsService.getMedications).toHaveBeenCalledWith('123');
    });
  });

  describe('createMedication', () => {
    it('should create medication successfully', () => {
      const mockNewMedication: MedicationsData = {
        medicationName: 'Test Medication',
        dosage: '50mg',
        patientId: '123',
        frequency: 'Once daily',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-02-15T00:00:00.000Z',
      };

      mockMedicationsService.addMedications.mockReturnValue(of(mockNewMedication));
      mockMedicationsService.getMedications.mockReturnValue(of(mockMedicationsResponse));

      // Set form values
      component.medicationFrom.patchValue({
        name: 'Test Medication',
        dosage: '50mg',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        frequency: 'Once daily',
      });

      component.createMedication(component.medicationFrom);

      expect(component.creating()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.create,
        toastNotifications.status.success,
        toastNotifications.messages.recordCreated,
      );
      expect(mockMedicationsService.getMedications).toHaveBeenCalledWith('123');
    });

    it('should handle error when creating medication fails', () => {
      const error = new Error('Failed to create medication');
      mockMedicationsService.addMedications.mockReturnValue(throwError(() => error));

      // Set form values
      component.medicationFrom.patchValue({
        name: 'Test Medication',
        dosage: '50mg',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        frequency: 'Once daily',
      });

      component.createMedication(component.medicationFrom);

      expect(component.creating()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.failsToload,
      );
    });

    it('should not create medication if form is invalid', () => {
      // Leave form empty to make it invalid
      component.createMedication(component.medicationFrom);

      expect(component.medicationFrom.touched).toBeTruthy();
      expect(mockMedicationsService.addMedications).not.toHaveBeenCalled();
    });

    it('should set creating to true during medication creation', () => {
      const mockNewMedication: MedicationsData = {
        medicationName: 'Test Medication',
        dosage: '50mg',
        patientId: '123',
        frequency: 'Once daily',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-02-15T00:00:00.000Z',
      };

      mockMedicationsService.addMedications.mockReturnValue(of(mockNewMedication));
      mockMedicationsService.getMedications.mockReturnValue(of(mockMedicationsResponse));

      // Set form values
      component.medicationFrom.patchValue({
        name: 'Test Medication',
        dosage: '50mg',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        frequency: 'Once daily',
      });

      component.createMedication(component.medicationFrom);

      expect(mockMedicationsService.addMedications).toHaveBeenCalledWith({
        medicationName: 'Test Medication',
        dosage: '50mg',
        patientId: '123',
        frequency: 'Once daily',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-02-15T00:00:00.000Z',
      });
    });
  });

  describe('visitAllMedications', () => {
    it('should navigate to medications page with correct patient ID', () => {
      fixture.componentRef.setInput('patientId', '456');

      component.visitAllMedications();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/provider',
        'patients',
        '456',
        'medications',
      ]);
    });
  });

  describe('filteredMedications computed', () => {
    beforeEach(() => {
      component.medications.set(mockMedicationsData);
    });

    it('should return first 3 medications when paginated is false', () => {
      fixture.componentRef.setInput('paginated', false);

      // Access protected property for testing
      const componentWithProtectedAccess = component as MedicationsComponent & {
        filteredMedications: () => MedicationsData[];
      };
      expect(componentWithProtectedAccess.filteredMedications()).toEqual(
        mockMedicationsData.slice(0, 3),
      );
    });

    it('should return all medications when paginated is true', () => {
      fixture.componentRef.setInput('paginated', true);

      // Access protected property for testing
      const componentWithProtectedAccess = component as MedicationsComponent & {
        filteredMedications: () => MedicationsData[];
      };
      expect(componentWithProtectedAccess.filteredMedications()).toEqual(mockMedicationsData);
    });

    it('should return empty array when no medications', () => {
      component.medications.set([]);
      fixture.componentRef.setInput('paginated', false);

      // Access protected property for testing
      const componentWithProtectedAccess = component as MedicationsComponent & {
        filteredMedications: () => MedicationsData[];
      };
      expect(componentWithProtectedAccess.filteredMedications()).toEqual([]);
    });
  });

  describe('modal functionality', () => {
    it('should toggle add medication modal', () => {
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

  describe('form getters', () => {
    it('should return correct form controls', () => {
      expect(component.name).toBe(component.medicationFrom.get('name'));
      expect(component.dosage).toBe(component.medicationFrom.get('dosage'));
      expect(component.startDate).toBe(component.medicationFrom.get('startDate'));
      expect(component.endDate).toBe(component.medicationFrom.get('endDate'));
      expect(component.frequency).toBe(component.medicationFrom.get('frequency'));
    });
  });

  describe('saveChanges', () => {
    it('should call createMedication with form', () => {
      const createMedicationSpy = jest.spyOn(component, 'createMedication');

      component.saveChanges();

      expect(createMedicationSpy).toHaveBeenCalledWith(component.medicationFrom);
    });
  });

  describe('loading state', () => {
    it('should start with loading as false', () => {
      expect(component.loading()).toBeFalsy();
    });

    it('should start with creating as false', () => {
      expect(component.creating()).toBeFalsy();
    });

    it('should set loading to true during API call', () => {
      const delayedResponse = of(mockMedicationsResponse).pipe(delay(100));
      mockMedicationsService.getMedications.mockReturnValue(delayedResponse);

      component.getMedications('123');

      expect(component.loading()).toBeTruthy();
    });

    it('should set creating to true during medication creation', () => {
      const mockNewMedication: MedicationsData = {
        medicationName: 'Test Medication',
        dosage: '50mg',
        patientId: '123',
        frequency: 'Once daily',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-02-15T00:00:00.000Z',
      };

      mockMedicationsService.addMedications.mockReturnValue(of(mockNewMedication));
      mockMedicationsService.getMedications.mockReturnValue(of(mockMedicationsResponse));

      component.medicationFrom.patchValue({
        name: 'Test Medication',
        dosage: '50mg',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        frequency: 'Once daily',
      });

      component.createMedication(component.medicationFrom);

      expect(mockMedicationsService.addMedications).toHaveBeenCalled();
    });
  });
});
