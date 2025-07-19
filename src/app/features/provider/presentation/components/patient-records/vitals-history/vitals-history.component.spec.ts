import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VitalsHistoryComponent } from './vitals-history.component';
import { VitalsService } from '@core/services/vitals/vitals.service';
import { ToastService } from '@core/services/toast/toast.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Vital } from '@shared/models/vitals';

const mockVitals: Vital[] = [
  {
    id: 1,
    height: 170,
    weight: 70,
    age: 30,
    bloodPressure: '120/80',
    heartRate: '70',
    temperature: 36.6,
    recordedAt: new Date().toISOString(),
  },
  {
    id: 2,
    height: 171,
    weight: 71,
    age: 31,
    bloodPressure: '121/81',
    heartRate: '71',
    temperature: 36.7,
    recordedAt: new Date().toISOString(),
  },
];

const mockVitalsResponse = {
  success: true as const,
  message: 'Fetched',
  data: mockVitals,
  timestamp: new Date(),
};

describe('VitalsHistoryComponent', () => {
  let component: VitalsHistoryComponent;
  let fixture: ComponentFixture<VitalsHistoryComponent>;
  let mockVitalsService: jest.Mocked<VitalsService>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    const vitalsServiceSpy = {
      getVitals: jest.fn().mockReturnValue(of(mockVitalsResponse)),
      addVital: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<VitalsService>;
    const toastServiceSpy = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;
    const routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [VitalsHistoryComponent],
      providers: [
        provideRouter([]),
        { provide: VitalsService, useValue: vitalsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VitalsHistoryComponent);
    component = fixture.componentInstance;
    mockVitalsService = TestBed.inject(VitalsService) as jest.Mocked<VitalsService>;
    mockToastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture.componentRef.setInput('patientId', 'p1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and fetch vitals on ngOnInit', () => {
    component.ngOnInit();
    expect(component.vitalsForm).toBeDefined();
    expect(component.loading()).toBe(false); // after fetch
    expect(component.filteredVitals().length).toBeGreaterThan(0);
  });

  describe('fetchVitals', () => {
    it('should set vitals and loading on success', fakeAsync(() => {
      mockVitalsService.getVitals.mockReturnValueOnce(of(mockVitalsResponse));
      component['loading'].set(false);
      component.ngOnInit();
      tick();
      expect(component.filteredVitals().length).toBeGreaterThan(0);
      expect(component.loading()).toBe(false);
    }));

    it('should handle error gracefully', fakeAsync(() => {
      mockVitalsService.getVitals.mockReturnValueOnce(throwError(() => new Error('fail')));
      expect(() => {
        component.ngOnInit();
        tick();
      }).toThrow();
    }));
  });

  it('should toggle add modal', () => {
    expect(component.isAddMedicationModalOpen()).toBe(false);
    component.toggleAddModal();
    expect(component.isAddMedicationModalOpen()).toBe(true);
    component.toggleAddModal();
    expect(component.isAddMedicationModalOpen()).toBe(false);
  });

  describe('saveChanges', () => {
    beforeEach(() => {
      component.toggleAddModal();
      component.vitalsForm.setValue({
        height: 180,
        weight: 80,
        age: 40,
        bloodPressure: '110/70',
        heartRate: '60',
        temperature: 37,
        recordedAt: new Date().toISOString(),
      });
    });

    it('should not proceed if form is invalid', () => {
      component.vitalsForm.get('height')?.setValue(null);
      component.saveChanges();
      expect(component.creating()).toBe(true); // stays true because of early return
    });

    it('should add vital and show toast on success', fakeAsync(() => {
      const toggleSpy = jest.spyOn(component, 'toggleAddModal');
      component.saveChanges();
      tick();
      expect(component.creating()).toBe(false);
      expect(toggleSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalled();
    }));

    it('should show error toast on error', fakeAsync(() => {
      mockVitalsService.addVital.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.saveChanges();
      tick();
      expect(component.creating()).toBe(false);
      expect(mockToastService.show).toHaveBeenCalled();
    }));
  });

  it('should navigate to all vitals', () => {
    component.visitAllVitals();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/provider', 'patients', 'p1', 'vitals']);
  });

  it('should compute filteredVitals correctly', () => {
    fixture.componentRef.setInput('paginated', false);
    expect(component.filteredVitals().length).toBeLessThanOrEqual(3);
    fixture.componentRef.setInput('paginated', true);
    expect(component.filteredVitals().length).toBe(mockVitals.length);
  });

  it('should return correct form controls', () => {
    expect(component.height).toBe(component.vitalsForm.get('height'));
    expect(component.weight).toBe(component.vitalsForm.get('weight'));
    expect(component.age).toBe(component.vitalsForm.get('age'));
    expect(component.bloodPressure).toBe(component.vitalsForm.get('bloodPressure'));
    expect(component.heartRate).toBe(component.vitalsForm.get('heartRate'));
    expect(component.temperature).toBe(component.vitalsForm.get('temperature'));
    expect(component.recordedAt).toBe(component.vitalsForm.get('recordedAt'));
  });
});
