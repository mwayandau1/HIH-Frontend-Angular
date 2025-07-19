import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AllergiesConditionsComponent } from './allergies-conditions.component';
import { CommonModule, DOCUMENT } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  ListContainerComponent,
  BadgeListComponent,
  ModalComponent,
  InputComponent,
} from '@shared/components';

import { AllergiesService } from '@core/services/allergies/allergies.service';
import { ConditionsService } from '@core/services/conditions/conditions.service';
import { ToastService } from '@core/services/toast/toast.service';
import {
  Allergy,
  AllergiesResponse,
  Condition,
  ConditionsResponse,
  DisplayBadge,
} from '@shared/models/allergiesAndConditions';
import { toastNotifications } from '@shared/constants/toast';
import { of, throwError } from 'rxjs';

describe('AllergiesConditionsComponent', () => {
  let component: AllergiesConditionsComponent;
  let fixture: ComponentFixture<AllergiesConditionsComponent>;
  let document: Document;
  let mockAllergiesService: jest.Mocked<AllergiesService>;
  let mockConditionsService: jest.Mocked<ConditionsService>;
  let mockToastService: jest.Mocked<ToastService>;

  const mockAllergies: Allergy[] = [
    { id: '1', patientId: 'p1', substance: 'Peanuts', reaction: 'Hives', severity: 'High' },
    { id: '2', patientId: 'p1', substance: 'Dust', reaction: 'Sneezing', severity: 'Low' },
  ];
  const mockConditions: Condition[] = [
    {
      id: '1',
      patientId: 'p1',
      conditionName: 'Asthma',
      description: 'Chronic',
      severity: 'Medium',
    },
    {
      id: '2',
      patientId: 'p1',
      conditionName: 'Diabetes',
      description: 'Type 2',
      severity: 'High',
    },
  ];
  const allergiesResponse: AllergiesResponse = {
    success: true,
    message: 'Fetched',
    data: mockAllergies,
    timestamp: new Date(),
  };
  const conditionsResponse: ConditionsResponse = {
    success: true,
    message: 'Fetched',
    data: mockConditions,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const allergiesServiceSpy = {
      getAllergies: jest.fn().mockReturnValue(of(allergiesResponse)),
      addAllergy: jest.fn().mockReturnValue(of(mockAllergies[0])),
      editAllergy: jest.fn().mockReturnValue(of(mockAllergies[0])),
      deleteAllergy: jest.fn().mockReturnValue(of(void 0)),
    } as unknown as jest.Mocked<AllergiesService>;
    const conditionsServiceSpy = {
      getConditions: jest.fn().mockReturnValue(of(conditionsResponse)),
      addCondition: jest.fn().mockReturnValue(of(mockConditions[0])),
      editCondition: jest.fn().mockReturnValue(of(mockConditions[0])),
      deleteCondition: jest.fn().mockReturnValue(of(void 0)),
    } as unknown as jest.Mocked<ConditionsService>;
    const toastServiceSpy = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        LucideAngularModule,
        AllergiesConditionsComponent,
        ListContainerComponent,
        BadgeListComponent,
        ModalComponent,
        InputComponent,
      ],
      providers: [
        { provide: AllergiesService, useValue: allergiesServiceSpy },
        { provide: ConditionsService, useValue: conditionsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllergiesConditionsComponent);
    component = fixture.componentInstance;
    document = TestBed.inject(DOCUMENT);
    mockAllergiesService = TestBed.inject(AllergiesService) as jest.Mocked<AllergiesService>;
    mockConditionsService = TestBed.inject(ConditionsService) as jest.Mocked<ConditionsService>;
    mockToastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;

    // Set up default mock return values
    mockAllergiesService.getAllergies.mockReturnValue(of(allergiesResponse));
    mockAllergiesService.addAllergy.mockReturnValue(of(mockAllergies[0]));
    mockAllergiesService.editAllergy.mockReturnValue(of(mockAllergies[0]));
    mockAllergiesService.deleteAllergy.mockReturnValue(of(void 0));
    mockConditionsService.getConditions.mockReturnValue(of(conditionsResponse));
    mockConditionsService.addCondition.mockReturnValue(of(mockConditions[0]));
    mockConditionsService.editCondition.mockReturnValue(of(mockConditions[0]));
    mockConditionsService.deleteCondition.mockReturnValue(of(void 0));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.allergies()).toEqual(mockAllergies);
      expect(component.conditions()).toEqual(mockConditions);
      expect(component.selectedBadge()).toBeNull();
      expect(component.selectedType()).toBeNull();
      expect(component.modalAction()).toBeNull();
      expect(component.isModalOpen()).toBe(false);
    });
  });

  describe('onSelectBadge', () => {
    it('should set selectedBadge and selectedType when clicking a new badge', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onSelectBadge(testBadge, 'ALLERGY');
      expect(component.selectedBadge()).toEqual(testBadge);
      expect(component.selectedType()).toEqual('ALLERGY');
    });

    it('should unset selectedBadge and selectedType when clicking the same badge', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onSelectBadge(testBadge, 'ALLERGY');
      component.onSelectBadge(testBadge, 'ALLERGY');
      expect(component.selectedBadge()).toBeNull();
      expect(component.selectedType()).toBeNull();
    });

    it('should set new badge when clicking a different badge', () => {
      const testBadge1: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      const testBadge2: DisplayBadge = { id: '2', name: 'Dust', original: mockAllergies[1] };
      component.onSelectBadge(testBadge1, 'ALLERGY');
      component.onSelectBadge(testBadge2, 'ALLERGY');
      expect(component.selectedBadge()).toEqual(testBadge2);
      expect(component.selectedType()).toEqual('ALLERGY');
    });
  });

  describe('onAction', () => {
    it('should set modal state for EDIT action', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onAction('EDIT', testBadge, 'ALLERGY');
      expect(component.selectedBadge()).toEqual(testBadge);
      expect(component.selectedType()).toEqual('ALLERGY');
      expect(component.modalAction()).toEqual('EDIT');
      expect(component.isModalOpen()).toBe(true);
    });

    it('should set modal state for DELETE action', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Asthma', original: mockConditions[0] };
      component.onAction('DELETE', testBadge, 'CONDITION');
      expect(component.selectedBadge()).toEqual(testBadge);
      expect(component.selectedType()).toEqual('CONDITION');
      expect(component.modalAction()).toEqual('DELETE');
      expect(component.isModalOpen()).toBe(true);
    });
  });

  describe('closeModal', () => {
    it('should reset modal state', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onAction('EDIT', testBadge, 'ALLERGY');
      component.closeModal();
      expect(component.selectedBadge()).toBeNull();
      expect(component.selectedType()).toBeNull();
      expect(component.modalAction()).toBeNull();
      expect(component.isModalOpen()).toBe(false);
    });
  });

  describe('editAction', () => {
    it('should call onAction and edit methods', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      const spy = jest.spyOn(component, 'onAction');
      const editSpy = jest.spyOn(component, 'editAllergy');

      component.editAction(testBadge.original, '1');

      expect(spy).toHaveBeenCalledWith('EDIT', testBadge, 'ALLERGY');
      expect(editSpy).toHaveBeenCalledWith(testBadge.original);
    });
  });

  describe('deleteAction', () => {
    it('should call delete methods', () => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      const deleteSpy = jest.spyOn(component, 'deleteAllergy');

      component.deleteAction(testBadge.original);

      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });

  describe('effect handling', () => {
    it('should add click event listener when selectedBadge is set', fakeAsync(() => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };

      component.onSelectBadge(testBadge, 'ALLERGY');
      tick();

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    }));

    it('should remove click event listener when selectedBadge is null', fakeAsync(() => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };

      component.onSelectBadge(testBadge, 'ALLERGY');
      component.onSelectBadge(testBadge, 'ALLERGY'); // Unselect
      tick();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    }));

    it('should handle outside click', fakeAsync(() => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onSelectBadge(testBadge, 'ALLERGY');
      tick();

      // Mock an outside click
      const mockElement = document.createElement('div');
      jest.spyOn(mockElement, 'closest').mockReturnValue(null);
      const mockEvent = { target: mockElement } as unknown as MouseEvent;

      component['handleOutsideClick'](mockEvent);

      expect(component.selectedBadge()).toBeNull();
    }));

    it('should not unselect when clicking inside menu', fakeAsync(() => {
      const testBadge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onSelectBadge(testBadge, 'ALLERGY');
      tick();

      // Mock an inside click
      const mockElement = document.createElement('div');
      jest.spyOn(mockElement, 'closest').mockReturnValue(document.createElement('div'));
      const mockEvent = { target: mockElement } as unknown as MouseEvent;

      component['handleOutsideClick'](mockEvent);

      expect(component.selectedBadge()).toEqual(testBadge);
    }));
  });

  describe('ngOnInit', () => {
    it('should fetch allergies and conditions', () => {
      mockAllergiesService.getAllergies.mockReturnValue(of(allergiesResponse));
      mockConditionsService.getConditions.mockReturnValue(of(conditionsResponse));
      const fetchAllergiesSpy = jest.spyOn(component, 'fetchAllergies');
      const fetchConditionsSpy = jest.spyOn(component, 'fetchConditions');
      component.ngOnInit();
      expect(fetchAllergiesSpy).toHaveBeenCalled();
      expect(fetchConditionsSpy).toHaveBeenCalled();
    });
  });

  describe('fetchAllergies', () => {
    it('should set allergies on success', () => {
      mockAllergiesService.getAllergies.mockReturnValue(of(allergiesResponse));
      component.fetchAllergies();
      expect(component.allergies()).toEqual(mockAllergies);
      expect(component.loadingAllergies()).toBeFalsy();
    });
    it('should show toast on error', () => {
      mockAllergiesService.getAllergies.mockReturnValue(throwError(() => new Error('fail')));
      component.fetchAllergies();
      expect(component.loadingAllergies()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.fetch,
        toastNotifications.status.error,
        toastNotifications.messages.failsToload,
      );
    });
  });

  describe('fetchConditions', () => {
    it('should set conditions on success', () => {
      mockConditionsService.getConditions.mockReturnValue(of(conditionsResponse));
      component.fetchConditions();
      expect(component.conditions()).toEqual(mockConditions);
      expect(component.loadingConditions()).toBeFalsy();
    });
    it('should show toast on error', () => {
      mockConditionsService.getConditions.mockReturnValue(throwError(() => new Error('fail')));
      component.fetchConditions();
      expect(component.loadingConditions()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.fetch,
        toastNotifications.status.error,
        toastNotifications.messages.failsToload,
      );
    });
  });

  describe('createAllergy', () => {
    it('should add allergy and fetch allergies on success', () => {
      mockAllergiesService.addAllergy.mockReturnValue(of(mockAllergies[0]));
      const fetchAllergiesSpy = jest.spyOn(component, 'fetchAllergies');
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.createAllergy(mockAllergies[0]);
      expect(component.creating()).toBeFalsy();
      expect(fetchAllergiesSpy).toHaveBeenCalled();
      expect(closeModalSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.create,
        toastNotifications.status.success,
        toastNotifications.messages.recordCreated,
      );
    });
    it('should show toast on error', () => {
      mockAllergiesService.addAllergy.mockReturnValue(throwError(() => new Error('fail')));
      component.createAllergy(mockAllergies[0]);
      expect(component.creating()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.create,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
    });
  });

  describe('createCondition', () => {
    it('should add condition and fetch conditions on success', () => {
      mockConditionsService.addCondition.mockReturnValue(of(mockConditions[0]));
      const fetchConditionsSpy = jest.spyOn(component, 'fetchConditions');
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.createCondition(mockConditions[0]);
      expect(component.creating()).toBeFalsy();
      expect(fetchConditionsSpy).toHaveBeenCalled();
      expect(closeModalSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.create,
        toastNotifications.status.success,
        toastNotifications.messages.recordCreated,
      );
    });
    it('should show toast on error', () => {
      mockConditionsService.addCondition.mockReturnValue(throwError(() => new Error('fail')));
      component.createCondition(mockConditions[0]);
      expect(component.creating()).toBeFalsy();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.create,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
    });
  });

  describe('editAllergy', () => {
    it('should edit allergy and fetch allergies on success', () => {
      component.selectedBadge.set({ id: '1', name: 'Peanuts', original: mockAllergies[0] });
      mockAllergiesService.editAllergy.mockReturnValue(of(mockAllergies[0]));
      const fetchAllergiesSpy = jest.spyOn(component, 'fetchAllergies');
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.editAllergy(mockAllergies[0]);
      expect(fetchAllergiesSpy).toHaveBeenCalled();
      expect(closeModalSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.update,
        toastNotifications.status.success,
        toastNotifications.messages.recordUpdated,
      );
      expect(component.creating()).toBeFalsy();
    });
    it('should show toast on error', () => {
      component.selectedBadge.set({ id: '1', name: 'Peanuts', original: mockAllergies[0] });
      mockAllergiesService.editAllergy.mockReturnValue(throwError(() => new Error('fail')));
      component.editAllergy(mockAllergies[0]);
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.update,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
      expect(component.creating()).toBeFalsy();
    });
    it('should show toast if no id', () => {
      component.selectedBadge.set(null);
      component.editAllergy(mockAllergies[0]);
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.update,
        toastNotifications.status.error,
        'Unable to update: missing allergy ID.',
      );
    });
  });

  describe('editCondition', () => {
    it('should edit condition and fetch conditions on success', () => {
      component.selectedBadge.set({ id: '1', name: 'Asthma', original: mockConditions[0] });
      mockConditionsService.editCondition.mockReturnValue(of(mockConditions[0]));
      const fetchConditionsSpy = jest.spyOn(component, 'fetchConditions');
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.editCondition(mockConditions[0]);
      expect(fetchConditionsSpy).toHaveBeenCalled();
      expect(closeModalSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.update,
        toastNotifications.status.success,
        toastNotifications.messages.recordUpdated,
      );
      expect(component.creating()).toBeFalsy();
    });
    it('should show toast on error', () => {
      component.selectedBadge.set({ id: '1', name: 'Asthma', original: mockConditions[0] });
      mockConditionsService.editCondition.mockReturnValue(throwError(() => new Error('fail')));
      component.editCondition(mockConditions[0]);
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.update,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
      expect(component.creating()).toBeFalsy();
    });
    it('should show toast if no id', () => {
      component.selectedBadge.set(null);
      component.editCondition(mockConditions[0]);
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.update,
        toastNotifications.status.error,
        'Unable to update: missing condition ID.',
      );
    });
  });

  describe('deleteAllergy', () => {
    it('should delete allergy and fetch allergies on success', () => {
      mockAllergiesService.deleteAllergy.mockReturnValue(of(void 0));
      const fetchAllergiesSpy = jest.spyOn(component, 'fetchAllergies');
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.deleteAllergy('1');
      expect(fetchAllergiesSpy).toHaveBeenCalled();
      expect(closeModalSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.delete,
        toastNotifications.status.success,
        toastNotifications.messages.recordDeleted,
      );
      expect(component.creating()).toBeFalsy();
    });
    it('should show toast on error', () => {
      mockAllergiesService.deleteAllergy.mockReturnValue(throwError(() => new Error('fail')));
      component.deleteAllergy('1');
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.delete,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
      expect(component.creating()).toBeFalsy();
    });
  });

  describe('deleteCondition', () => {
    it('should delete condition and fetch conditions on success', () => {
      mockConditionsService.deleteCondition.mockReturnValue(of(void 0));
      const fetchConditionsSpy = jest.spyOn(component, 'fetchConditions');
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.deleteCondition('1');
      expect(fetchConditionsSpy).toHaveBeenCalled();
      expect(closeModalSpy).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.delete,
        toastNotifications.status.success,
        toastNotifications.messages.recordDeleted,
      );
      expect(component.creating()).toBeFalsy();
    });
    it('should show toast on error', () => {
      mockConditionsService.deleteCondition.mockReturnValue(throwError(() => new Error('fail')));
      component.deleteCondition('1');
      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.faildOperations.delete,
        toastNotifications.status.error,
        toastNotifications.messages.failedRecord,
      );
      expect(component.creating()).toBeFalsy();
    });
  });

  describe('modal and badge logic', () => {
    it('should open and close modal', () => {
      component.isModalOpen.set(false);
      component.closeModal();
      expect(component.isModalOpen()).toBe(false);
    });
    it('should select and unselect badge', () => {
      const badge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onSelectBadge(badge, 'ALLERGY');
      expect(component.selectedBadge()).toEqual(badge);
      component.onSelectBadge(badge, 'ALLERGY');
      expect(component.selectedBadge()).toBeNull();
    });
    it('should set modal state on onAction', () => {
      const badge: DisplayBadge = { id: '1', name: 'Peanuts', original: mockAllergies[0] };
      component.onAction('EDIT', badge, 'ALLERGY');
      expect(component.isModalOpen()).toBe(true);
    });
    it('should handle handleAddAction', () => {
      const result = component.handleAddAction('ADD', new Event('click'), 'ALLERGY');
      expect(result.action).toBe('ADD');
      expect(result.type).toBe('ALLERGY');
    });
  });

  describe('computed properties', () => {
    it('should compute displayAllergies', () => {
      component.allergies.set(mockAllergies);
      expect(component.displayAllergies()).toEqual([
        { id: '1', name: 'Peanuts', original: mockAllergies[0] },
        { id: '2', name: 'Dust', original: mockAllergies[1] },
      ]);
    });
    it('should compute displayConditions', () => {
      component.conditions.set(mockConditions);
      expect(component.displayConditions()).toEqual([
        { id: '1', name: 'Asthma', original: mockConditions[0] },
        { id: '2', name: 'Diabetes', original: mockConditions[1] },
      ]);
    });
  });

  describe('form logic', () => {
    it('should initialize allergy form', () => {
      component.selectedType.set('ALLERGY');
      component.selectedBadge.set({ id: '1', name: 'Peanuts', original: mockAllergies[0] });
      component.initializeFrom();
      expect(component.formData.get('substance')).toBeTruthy();
    });
    it('should initialize condition form', () => {
      component.selectedType.set('CONDITION');
      component.selectedBadge.set({ id: '1', name: 'Asthma', original: mockConditions[0] });
      component.initializeFrom();
      expect(component.formData.get('conditionName')).toBeTruthy();
    });
    it('should initialize empty form for unknown type', () => {
      component.selectedType.set(null);
      component.selectedBadge.set(null);
      component.initializeFrom();
      expect(Object.keys(component.formData.controls).length).toBe(0);
    });
  });

  describe('handleModalSubmit (branch coverage)', () => {
    beforeEach(() => {
      component.isModalOpen.set(true);
    });

    it('should call handleAllergySubmit if type is ALLERGY and form is valid', () => {
      component.modalAction.set('ADD');
      component.selectedType.set('ALLERGY');
      component.formData = new FormGroup({
        substance: new FormControl('Eggs', Validators.required),
        reaction: new FormControl(''),
        severity: new FormControl(''),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spy = jest.spyOn(component as any, 'handleAllergySubmit');
      component.handleModalSubmit();
      expect(spy).toHaveBeenCalledWith({ substance: 'Eggs', reaction: '', severity: '' }, 'ADD');
    });

    it('should call handleConditionSubmit if type is CONDITION and form is valid', () => {
      component.modalAction.set('ADD');
      component.selectedType.set('CONDITION');
      component.formData = new FormGroup({
        conditionName: new FormControl('Flu', Validators.required),
        description: new FormControl(''),
        severity: new FormControl(''),
        treatmentPlan: new FormControl(''),
        diagnosisDate: new FormControl(''),
        notes: new FormControl(''),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spy = jest.spyOn(component as any, 'handleConditionSubmit');
      component.handleModalSubmit();
      expect(spy).toHaveBeenCalledWith(
        {
          conditionName: 'Flu',
          description: '',
          severity: '',
          treatmentPlan: '',
          diagnosisDate: '',
          notes: '',
        },
        'ADD',
      );
    });
  });
});
