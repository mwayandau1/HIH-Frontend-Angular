import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, signal, effect, inject, OnInit, input, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ListContainerComponent,
  ModalComponent,
  BadgeListComponent,
  InputComponent,
} from '@shared/components';
import { LucideAngularModule } from 'lucide-angular';
import {
  ItemType,
  ModalAction,
  Allergy,
  Condition,
  DisplayBadge,
  FormValues,
} from '@shared/models';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { AllergiesService } from '@core/services/allergies/allergies.service';
import { ConditionsService } from '@core/services/conditions/conditions.service';
import { toastNotifications } from '@shared/constants/toast';
import { ToastService } from '@core/services/toast/toast.service';

@Component({
  selector: 'app-allergies-conditions',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    ListContainerComponent,
    BadgeListComponent,
    ModalComponent,
    InputComponent,
  ],
  templateUrl: './allergies-conditions.component.html',
})
export class AllergiesConditionsComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  public patientId = input<string>('');
  public allergies = signal<Allergy[]>([]);
  public conditions = signal<Condition[]>([]);
  protected readonly checkFieldError = checkFieldErrors;
  public selectedBadge = signal<DisplayBadge | null>(null);
  public selectedType = signal<ItemType | null>(null);
  public modalAction = signal<ModalAction | null>(null);
  public loadingAllergies = signal(false);
  public loadingConditions = signal(false);
  public formData!: FormGroup;
  public isModalOpen = signal(false);
  public creating = signal(false);
  public allergiesService = inject(AllergiesService);
  public conditionsService = inject(ConditionsService);
  public toast = inject(ToastService);

  constructor() {
    effect(() => {
      if (this.selectedBadge()) {
        this.document.addEventListener('click', this.handleOutsideClick);
      } else {
        this.document.removeEventListener('click', this.handleOutsideClick);
      }
    });
    this.formData = new FormGroup({});
  }

  public displayAllergies = computed(() =>
    this.allergies().map((allergy) => ({
      id: allergy.id!,
      name: allergy.substance,
      original: allergy,
    })),
  );

  public displayConditions = computed(() =>
    this.conditions().map((condition) => ({
      id: condition.id!,
      name: condition.conditionName,
      original: condition,
    })),
  );

  fetchAllergies(): void {
    this.loadingAllergies.set(true);
    this.allergiesService.getAllergies(this.patientId()).subscribe({
      next: (data) => {
        this.allergies.set(data.data);
        this.loadingAllergies.set(false);
      },
      error: () => {
        this.loadingAllergies.set(false);
        this.toast.show(
          toastNotifications.faildOperations.fetch,
          toastNotifications.status.error,
          toastNotifications.messages.failsToload,
        );
      },
    });
  }

  fetchConditions(): void {
    this.loadingConditions.set(true);
    this.conditionsService.getConditions(this.patientId()).subscribe({
      next: (data) => {
        this.conditions.set(data.data);
        this.loadingConditions.set(false);
      },
      error: () => {
        this.loadingConditions.set(false);
        this.toast.show(
          toastNotifications.faildOperations.fetch,
          toastNotifications.status.error,
          toastNotifications.messages.failsToload,
        );
      },
    });
  }

  createAllergy(data: Allergy): void {
    this.creating.set(true);
    this.allergiesService.addAllergy(data).subscribe({
      next: () => {
        this.creating.set(false);
        this.fetchAllergies();
        this.closeModal();
        this.toast.show(
          toastNotifications.operations.create,
          toastNotifications.status.success,
          toastNotifications.messages.recordCreated,
        );
      },
      error: () => {
        this.creating.set(false);
        this.toast.show(
          toastNotifications.faildOperations.create,
          toastNotifications.status.error,
          toastNotifications.messages.failedRecord,
        );
      },
    });
  }

  createCondition(data: Condition): void {
    this.creating.set(true);
    this.conditionsService.addCondition(data).subscribe({
      next: () => {
        this.creating.set(false);
        this.fetchConditions();
        this.closeModal();
        this.toast.show(
          toastNotifications.operations.create,
          toastNotifications.status.success,
          toastNotifications.messages.recordCreated,
        );
      },
      error: () => {
        this.creating.set(false);
        this.toast.show(
          toastNotifications.faildOperations.create,
          toastNotifications.status.error,
          toastNotifications.messages.failedRecord,
        );
      },
    });
  }

  editAllergy(data: Allergy): void {
    const id = this.selectedBadge()?.id;
    if (!id) {
      this.toast.show(
        toastNotifications.faildOperations.update,
        toastNotifications.status.error,
        'Unable to update: missing allergy ID.',
      );
      return;
    }
    this.creating.set(true);
    this.allergiesService.editAllergy(id, data).subscribe({
      next: () => {
        this.fetchAllergies();
        this.closeModal();
        this.toast.show(
          toastNotifications.operations.update,
          toastNotifications.status.success,
          toastNotifications.messages.recordUpdated,
        );
        this.creating.set(false);
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.update,
          toastNotifications.status.error,
          toastNotifications.messages.failedRecord,
        );
        this.creating.set(false);
      },
    });
  }

  editCondition(data: Condition): void {
    const id = this.selectedBadge()?.id;
    if (!id) {
      this.toast.show(
        toastNotifications.faildOperations.update,
        toastNotifications.status.error,
        'Unable to update: missing condition ID.',
      );
      return;
    }
    this.creating.set(true);
    this.conditionsService.editCondition(data, id).subscribe({
      next: () => {
        this.creating.set(false);
        this.fetchConditions();
        this.closeModal();
        this.toast.show(
          toastNotifications.operations.update,
          toastNotifications.status.success,
          toastNotifications.messages.recordUpdated,
        );
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.update,
          toastNotifications.status.error,
          toastNotifications.messages.failedRecord,
        );
        this.creating.set(false);
      },
    });
  }

  deleteAllergy(id: string): void {
    this.creating.set(true);
    this.allergiesService.deleteAllergy(id).subscribe({
      next: () => {
        this.creating.set(false);
        this.fetchAllergies();
        this.closeModal();
        this.toast.show(
          toastNotifications.operations.delete,
          toastNotifications.status.success,
          toastNotifications.messages.recordDeleted,
        );
      },
      error: () => {
        this.creating.set(false);
        this.toast.show(
          toastNotifications.faildOperations.delete,
          toastNotifications.status.error,
          toastNotifications.messages.failedRecord,
        );
      },
    });
  }

  deleteCondition(id: string): void {
    this.creating.set(true);
    this.conditionsService.deleteCondition(id).subscribe({
      next: () => {
        this.creating.set(false);
        this.fetchConditions();
        this.closeModal();
        this.toast.show(
          toastNotifications.operations.delete,
          toastNotifications.status.success,
          toastNotifications.messages.recordDeleted,
        );
      },
      error: () => {
        this.creating.set(false);
        this.toast.show(
          toastNotifications.faildOperations.delete,
          toastNotifications.status.error,
          toastNotifications.messages.failedRecord,
        );
      },
    });
  }

  private createAllergyForm(original?: Allergy): FormGroup {
    return new FormGroup({
      substance: new FormControl(original?.substance ?? '', Validators.required),
      reaction: new FormControl(original?.reaction ?? ''),
      severity: new FormControl(original?.severity ?? ''),
    });
  }

  private createConditionForm(original?: Condition): FormGroup {
    return new FormGroup({
      conditionName: new FormControl(original?.conditionName ?? '', Validators.required),
      description: new FormControl(original?.description ?? ''),
      severity: new FormControl(original?.severity ?? ''),
      treatmentPlan: new FormControl(original?.treatmentPlan ?? ''),
      diagnosisDate: new FormControl(original?.diagnosisDate ?? ''),
      notes: new FormControl(original?.notes ?? ''),
    });
  }

  initializeFrom(): void {
    const type = this.selectedType();
    const original = this.selectedBadge()?.original;

    if (type === 'ALLERGY') {
      this.formData = this.createAllergyForm(original as Allergy);
    } else if (type === 'CONDITION') {
      this.formData = this.createConditionForm(original as Condition);
    } else {
      this.formData = new FormGroup({});
    }
  }

  get substanceControl(): FormControl {
    return this.formData.get('substance') as FormControl;
  }

  get reactionControl(): FormControl {
    return this.formData.get('reaction') as FormControl;
  }

  get severityControl(): FormControl {
    return this.formData.get('severity') as FormControl;
  }

  get conditionNameControl(): FormControl {
    return this.formData.get('conditionName') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.formData.get('description') as FormControl;
  }

  get treatmentPlanControl(): FormControl {
    return this.formData.get('treatmentPlan') as FormControl;
  }

  get diagnosisDateControl(): FormControl {
    return this.formData.get('diagnosisDate') as FormControl;
  }

  get notesControl(): FormControl {
    return this.formData.get('notes') as FormControl;
  }

  get nameControl(): FormControl {
    return this.formData.get('name') as FormControl;
  }

  onSelectBadge(badge: DisplayBadge, type: ItemType) {
    const isSame = this.selectedBadge()?.id === badge.id;
    this.selectedBadge.set(isSame ? null : badge);
    this.selectedType.set(isSame ? null : type);
  }

  onAction(action: ModalAction, badge: DisplayBadge, type: ItemType) {
    this.selectedBadge.set(badge);
    this.selectedType.set(type);
    this.modalAction.set(action);
    this.initializeFrom();
    this.isModalOpen.set(true);
  }

  handleAddAction(action: ModalAction, event: Event, type: ItemType) {
    this.selectedType.set(type);
    this.modalAction.set(action);
    this.selectedBadge.set(null);
    this.initializeFrom();
    this.isModalOpen.set(true);
    return { action, event, type };
  }

  closeModal() {
    this.selectedBadge.set(null);
    this.selectedType.set(null);
    this.modalAction.set(null);
    this.isModalOpen.set(false);
    this.formData = new FormGroup({});
  }

  editAction(item: Allergy | Condition, id?: string) {
    this.onAction(
      'EDIT',
      {
        id: id!,
        name: 'substance' in item ? item.substance : item.conditionName,
        original: item,
      },
      'substance' in item ? 'ALLERGY' : 'CONDITION',
    );
    if ('substance' in item) {
      this.editAllergy(item);
    } else {
      this.editCondition(item);
    }
  }

  add(item: Allergy | Condition) {
    if ('substance' in item) {
      this.createAllergy(item);
    } else {
      this.createCondition(item);
    }
  }

  deleteAction(item: Allergy | Condition) {
    if ('substance' in item) {
      this.deleteAllergy(item.id!.toString());
    } else {
      this.deleteCondition(item.id!.toString());
    }
  }

  private handleAllergySubmit(formValue: FormValues, action: ModalAction): void {
    const allergy: Allergy = {
      substance: formValue.substance ?? '',
      reaction: formValue.reaction,
      severity: formValue.severity,
    };
    if (action === 'ADD') {
      this.add({ ...allergy, patientId: this.patientId() });
    } else if (action === 'EDIT') {
      this.editAction(allergy, this.selectedBadge()?.id);
    }
  }

  private handleConditionSubmit(formValue: FormValues, action: ModalAction): void {
    const condition: Condition = {
      conditionName: formValue.conditionName ?? '',
      description: formValue.description,
      severity: formValue.severity,
      treatmentPlan: formValue.treatmentPlan,
      diagnosisDate: formValue.diagnosisDate ? new Date(formValue.diagnosisDate).toISOString() : '',
      notes: formValue.notes,
    };
    if (action === 'ADD') {
      this.add({ ...condition, patientId: this.patientId() });
    } else if (action === 'EDIT') {
      this.editAction(condition, this.selectedBadge()?.id);
    }
  }

  handleModalSubmit(): void {
    if (this.modalAction() === 'DELETE') {
      const badge = this.selectedBadge();
      if (badge?.original) {
        this.deleteAction(badge.original);
      }
      return;
    }

    if (!this.formData.valid) {
      this.formData.markAllAsTouched();
      return;
    }

    const formValue = this.formData.value;
    const action = this.modalAction();
    const type = this.selectedType();

    if (type === 'ALLERGY' && action) {
      this.handleAllergySubmit(formValue, action);
    } else if (type === 'CONDITION' && action) {
      this.handleConditionSubmit(formValue, action);
    }
  }

  private readonly handleOutsideClick = (event: MouseEvent) => {
    const clickedElement = event.target as HTMLElement;
    const isInsideMenu = clickedElement.closest('.relative') !== null;
    if (!isInsideMenu) {
      this.selectedBadge.set(null);
    }
  };

  ngOnInit(): void {
    this.initializeFrom();
    this.fetchAllergies();
    this.fetchConditions();
  }
}
