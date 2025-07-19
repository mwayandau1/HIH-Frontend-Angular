import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ImmunizationsService } from '@core/services/immunizations/immunizations.service';
import { ToastService } from '@core/services/toast/toast.service';
import { ListContainerComponent, InputComponent, ModalComponent } from '@shared/components';
import { toastNotifications } from '@shared/constants/toast';
import { Immunization } from '@shared/models/immunizations';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { LucideAngularModule, X } from 'lucide-angular';
import { RecordSkelectonComponent } from '../record-skelecton/record-skelecton.component';
import { formatDate } from '@shared/utils/helpers/dates';

@Component({
  selector: 'app-immunization',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    InputComponent,
    ReactiveFormsModule,
    ListContainerComponent,
    ModalComponent,
    RecordSkelectonComponent,
  ],
  templateUrl: './immunization.component.html',
})
export class ImmunizationComponent implements OnInit {
  public immunizations = signal<Immunization[] | []>([]);
  public immunizationFrom!: FormGroup;
  public checkFieldErrors = checkFieldErrors;
  public isAddMedicationModalOpen = false;
  public paginated = input<boolean>(false);
  public loading = signal<boolean>(false);
  public creating = signal<boolean>(false);
  protected formatDate = formatDate;
  public patientId = input<string>('');
  private readonly router = inject(Router);
  private readonly immunizationService = inject(ImmunizationsService);
  private readonly toast = inject(ToastService);
  protected readonly filteredImmunizations = computed(() =>
    this.paginated() ? this.immunizations() : this.immunizations().slice(0, 3),
  );
  public icons = { X };
  toggleAddModal() {
    this.isAddMedicationModalOpen = !this.isAddMedicationModalOpen;
  }

  visitAllImmunizations() {
    this.router.navigate(['/provider', 'patients', this.patientId(), 'immunizations']);
  }

  createImmunization(data: Immunization, form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    this.immunizationService.addImmunization(data).subscribe({
      next: () => {
        this.creating.set(false);
        this.immunizationFrom.reset();
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

  getImmunizations(id: string): void {
    this.loading.set(true);
    this.immunizationService.getImmunizations(id).subscribe({
      next: (response) => {
        this.immunizations.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show(
          toastNotifications.operations.fail,
          toastNotifications.status.error,
          toastNotifications.messages.failsToload,
        );
      },
    });
  }

  constructor() {
    this.immunizationFrom = new FormGroup({
      vaccineName: new FormControl('', Validators.required),
      doseNumber: new FormControl(''),
      dateAdministered: new FormControl(new Date().toISOString()),
    });
  }

  get vaccineName() {
    return this.immunizationFrom.get('vaccineName') as FormControl;
  }
  get doseNumber() {
    return this.immunizationFrom.get('doseNumber') as FormControl;
  }
  saveChanges() {
    const payload: Immunization = {
      ...this.immunizationFrom.value,
      patientId: this.patientId(),
    };
    this.createImmunization(payload, this.immunizationFrom);
  }

  cancelAddModal() {
    this.toggleAddModal();
    this.immunizationFrom.reset();
    this.loading.set(false);
  }

  ngOnInit(): void {
    if (this.patientId()) {
      this.getImmunizations(this.patientId());
    }
  }
}
