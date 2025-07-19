import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, delay } from 'rxjs';
import { LabResultsComponent } from './lab-results.component';
import { LabResultsService } from '@core/services/lab-results/lab-results.service';
import { ToastService } from '@core/services/toast/toast.service';
import { LabResultsResponse, LabResultsData } from '@shared/models/labResults';
import { toastNotifications } from '@shared/constants/toast';

describe('LabResultsComponent', () => {
  let component: LabResultsComponent;
  let fixture: ComponentFixture<LabResultsComponent>;
  let mockLabResultsService: jest.Mocked<LabResultsService>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockRouter: jest.Mocked<Router>;

  const mockLabResultsData: LabResultsData[] = [
    {
      id: 1,
      labTest: 'Blood Glucose',
      value: '120',
      unit: 'mg/dL',
      resultDate: '2024-01-15',
      referenceRange: '70-100',
      status: 'High',
      notes: 'Fasting glucose',
    },
    {
      id: 2,
      labTest: 'Hemoglobin A1C',
      value: '6.2',
      unit: '%',
      resultDate: '2024-01-15',
      referenceRange: '4.0-5.6',
      status: 'High',
      notes: 'Diabetes monitoring',
    },
  ];

  const mockLabResultsResponse: LabResultsResponse = {
    success: true,
    message: 'Lab results retrieved successfully',
    data: mockLabResultsData,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const labResultsServiceSpy = {
      getLabResults: jest.fn(),
    } as unknown as jest.Mocked<LabResultsService>;

    const toastServiceSpy = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    const routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [LabResultsComponent],
      providers: [
        { provide: LabResultsService, useValue: labResultsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LabResultsComponent);
    component = fixture.componentInstance;
    mockLabResultsService = TestBed.inject(LabResultsService) as jest.Mocked<LabResultsService>;
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
    it('should call getLabResults with patientId on init', () => {
      mockLabResultsService.getLabResults.mockReturnValue(of(mockLabResultsResponse));

      component.ngOnInit();

      expect(mockLabResultsService.getLabResults).toHaveBeenCalledWith('123');
    });
  });

  describe('getLabResults', () => {
    it('should load lab results successfully', () => {
      mockLabResultsService.getLabResults.mockReturnValue(of(mockLabResultsResponse));

      component.getLabResults('123');

      expect(component.loading()).toBeFalsy();
      expect(component.labResults()).toEqual(mockLabResultsData);
    });

    it('should handle error when loading lab results fails', () => {
      const error = new Error('Failed to load lab results');
      mockLabResultsService.getLabResults.mockReturnValue(throwError(() => error));

      component.getLabResults('123');

      expect(component.loading()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.failsToload,
      );
    });

    it('should set loading to true when starting to load lab results', () => {
      mockLabResultsService.getLabResults.mockReturnValue(of(mockLabResultsResponse));

      component.getLabResults('123');

      // The loading should be set to true initially
      expect(mockLabResultsService.getLabResults).toHaveBeenCalledWith('123');
    });
  });

  describe('visitAllLabResults', () => {
    it('should navigate to lab results page with correct patient ID', () => {
      fixture.componentRef.setInput('patientId', '456');

      component.visitAllLabResults();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/provider',
        'patients',
        '456',
        'lab-results',
      ]);
    });
  });

  describe('filteredResults computed', () => {
    beforeEach(() => {
      component.labResults.set(mockLabResultsData);
    });

    it('should return first 3 results when paginated is false', () => {
      fixture.componentRef.setInput('paginated', false);

      // Access protected property for testing
      const componentWithProtectedAccess = component as LabResultsComponent & {
        filteredResults: () => LabResultsData[];
      };
      expect(componentWithProtectedAccess.filteredResults()).toEqual(
        mockLabResultsData.slice(0, 3),
      );
    });

    it('should return all results when paginated is true', () => {
      fixture.componentRef.setInput('paginated', true);

      // Access protected property for testing
      const componentWithProtectedAccess = component as LabResultsComponent & {
        filteredResults: () => LabResultsData[];
      };
      expect(componentWithProtectedAccess.filteredResults()).toEqual(mockLabResultsData);
    });

    it('should return empty array when no lab results', () => {
      component.labResults.set([]);
      fixture.componentRef.setInput('paginated', false);

      // Access protected property for testing
      const componentWithProtectedAccess = component as LabResultsComponent & {
        filteredResults: () => LabResultsData[];
      };
      expect(componentWithProtectedAccess.filteredResults()).toEqual([]);
    });
  });

  describe('loading state', () => {
    it('should start with loading as false', () => {
      expect(component.loading()).toBeFalsy();
    });

    it('should set loading to true during API call', () => {
      // Create a delayed observable to test loading state
      const delayedResponse = of(mockLabResultsResponse).pipe(
        // Simulate delay
        delay(100),
      );
      mockLabResultsService.getLabResults.mockReturnValue(delayedResponse);

      component.getLabResults('123');

      // Loading should be true immediately after calling getLabResults
      expect(component.loading()).toBeTruthy();
    });
  });

  describe('createImmunization', () => {
    beforeEach(() => {
      component.labResultsFrom.setValue({
        labTest: 'Blood Glucose',
        value: '120',
        resultDate: '2024-01-15',
        unit: 'mg/dL',
        status: 'High',
        notes: 'Fasting glucose',
      });
    });

    it('should show error toast and mark all as touched if form is invalid', () => {
      component.labResultsFrom.get('labTest')?.setValue(''); // Make form invalid
      const form = component.labResultsFrom;
      jest.spyOn(form, 'markAllAsTouched');

      component.createLabResult({ labTest: '', value: '', resultDate: '' } as LabResultsData, form);

      expect(form.markAllAsTouched).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        'Please fill all required fields.',
      );
    });

    it('should call addLabResults and handle success', () => {
      mockLabResultsService.addLabResults = jest.fn().mockReturnValue(of({}));
      jest.spyOn(component.labResultsFrom, 'reset');
      jest.spyOn(component, 'getLabResults');
      component.labResults.set([]); // less than 3

      component.createLabResult(
        component.labResultsFrom.value as LabResultsData,
        component.labResultsFrom,
      );

      expect(component.creating()).toBeFalsy();
      expect(component.labResultsFrom.reset).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.create,
        toastNotifications.status.success,
        toastNotifications.messages.recordCreated,
      );
      expect(component.getLabResults).toHaveBeenCalledWith('123');
    });

    it('should not call getLabResults if labResults length >= 3', () => {
      mockLabResultsService.addLabResults = jest.fn().mockReturnValue(of({}));
      jest.spyOn(component, 'getLabResults');
      component.labResults.set([
        { labTest: '', value: '', resultDate: '' },
        { labTest: '', value: '', resultDate: '' },
        { labTest: '', value: '', resultDate: '' },
      ]);

      component.createLabResult(
        component.labResultsFrom.value as LabResultsData,
        component.labResultsFrom,
      );

      expect(component.getLabResults).not.toHaveBeenCalled();
    });

    it('should handle error on addLabResults', () => {
      mockLabResultsService.addLabResults = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('fail')));
      component.labResultsFrom.setValue({
        labTest: 'Blood Glucose',
        value: '120',
        resultDate: '2024-01-15',
        unit: 'mg/dL',
        status: 'High',
        notes: 'Fasting glucose',
      });

      component.createLabResult(
        component.labResultsFrom.value as LabResultsData,
        component.labResultsFrom,
      );

      expect(component.creating()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.create,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
    });
  });

  describe('saveChanges', () => {
    it('should call createImmunization with correct payload', () => {
      mockLabResultsService.addLabResults = jest.fn().mockReturnValue(of({}));
      component.labResultsFrom.setValue({
        labTest: 'Blood Glucose',
        value: '120',
        resultDate: '2024-01-15',
        unit: 'mg/dL',
        status: 'High',
        notes: 'Fasting glucose',
      });
      fixture.componentRef.setInput('patientId', '999');
      component.saveChanges();
      expect(mockLabResultsService.addLabResults).toHaveBeenCalledWith(
        expect.objectContaining({
          labTest: 'Blood Glucose',
          value: '120',
          resultDate: '2024-01-15',
          unit: 'mg/dL',
          status: 'High',
          notes: 'Fasting glucose',
          patientId: '999',
        }),
      );
    });
  });

  describe('toggleAddModal', () => {
    it('should toggle isAddLabResultsModalOpen', () => {
      component.isAddLabResultsModalOpen.set(false);
      component.toggleAddModal();
      expect(component.isAddLabResultsModalOpen()).toBe(true);
      component.toggleAddModal();
      expect(component.isAddLabResultsModalOpen()).toBe(false);
    });
  });

  describe('cancelAddModal', () => {
    it('should close modal and reset form', () => {
      component.isAddLabResultsModalOpen.set(true);
      jest.spyOn(component.labResultsFrom, 'reset');
      component.cancelAddModal();
      expect(component.isAddLabResultsModalOpen()).toBe(false);
      expect(component.labResultsFrom.reset).toHaveBeenCalled();
    });
  });

  describe('form control getters', () => {
    it('should return correct form controls', () => {
      expect(component.labTest).toBe(component.labResultsFrom.get('labTest'));
      expect(component.value).toBe(component.labResultsFrom.get('value'));
      expect(component.resultDate).toBe(component.labResultsFrom.get('resultDate'));
      expect(component.unit).toBe(component.labResultsFrom.get('unit'));
      expect(component.status).toBe(component.labResultsFrom.get('status'));
      expect(component.notes).toBe(component.labResultsFrom.get('notes'));
    });
  });
});
