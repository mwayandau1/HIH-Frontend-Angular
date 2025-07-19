import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListContainerComponent, InputComponent, ModalComponent } from '@shared/components';
import { LucideAngularModule, X } from 'lucide-angular';
import { DatePickerComponent } from '@shared/components/datepicker/datepicker.component';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { Router } from '@angular/router';
import { MedicationsData } from '@shared/models/medications';
import { MedicationsService } from '@core/services/medications/medications.service';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';
import { RecordSkelectonComponent } from '../record-skelecton/record-skelecton.component';
import { formatDate } from '@shared/utils/helpers/dates';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    InputComponent,
    ReactiveFormsModule,
    ListContainerComponent,
    ModalComponent,
    DatePickerComponent,
    RecordSkelectonComponent,
  ],
  templateUrl: './medications.component.html',
})
export class MedicationsComponent implements OnInit {
  public medications = signal<MedicationsData[] | []>([]);
  public paginated = input<boolean>(false);
  public checkFieldErrors = checkFieldErrors;
  private readonly router = inject(Router);
  public patientId = input<string>('');
  public loading = signal<boolean>(false);
  protected formatDate = formatDate;
  public creating = signal<boolean>(false);
  private readonly medicationsService = inject(MedicationsService);
  private readonly toast = inject(ToastService);
  protected readonly filteredMedications = computed(() =>
    this.paginated() ? this.medications() : this.medications().slice(0, 3),
  );
  public medicationFrom!: FormGroup;

  public isAddMedicationModalOpen = false;
  public readonly icons = { X };
  toggleAddModal() {
    this.isAddMedicationModalOpen = !this.isAddMedicationModalOpen;
  }

  constructor() {
    this.medicationFrom = new FormGroup({
      name: new FormControl('', Validators.required),
      dosage: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      frequency: new FormControl('', Validators.required),
    });
  }

  getMedications(id: string): void {
    this.loading.set(true);
    this.medicationsService.getMedications(id).subscribe({
      next: (response) => {
        this.medications.set(response.data);
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

  createMedication(form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const medicationData: MedicationsData = {
      medicationName: form.value.name,
      dosage: form.value.dosage,
      patientId: this.patientId(),
      frequency: form.value.frequency,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate: new Date(form.value.endDate).toISOString(),
    };

    this.creating.set(true);
    this.medicationsService.addMedications(medicationData).subscribe({
      next: () => {
        this.creating.set(false);
        this.toast.show(
          toastNotifications.operations.create,
          toastNotifications.status.success,
          toastNotifications.messages.recordCreated,
        );
        form.reset();
        this.getMedications(this.patientId());
      },
      error: () => {
        this.creating.set(false);
        this.toast.show(
          toastNotifications.operations.fail,
          toastNotifications.status.error,
          toastNotifications.messages.failsToload,
        );
      },
    });
  }

  visitAllMedications() {
    this.router.navigate(['/provider', 'patients', this.patientId(), 'medications']);
  }

  get name() {
    return this.medicationFrom.get('name') as FormControl;
  }

  get dosage() {
    return this.medicationFrom.get('dosage') as FormControl;
  }

  get startDate() {
    return this.medicationFrom.get('startDate') as FormControl;
  }
  get endDate() {
    return this.medicationFrom.get('endDate') as FormControl;
  }

  get frequency() {
    return this.medicationFrom.get('frequency') as FormControl;
  }

  saveChanges() {
    this.createMedication(this.medicationFrom);
  }
  cancelAddModal() {
    this.toggleAddModal();
  }
  ngOnInit(): void {
    this.getMedications(this.patientId());
  }
}
