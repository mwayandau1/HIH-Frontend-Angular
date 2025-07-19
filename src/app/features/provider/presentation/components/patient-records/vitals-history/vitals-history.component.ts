import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListContainerComponent, InputComponent, ModalComponent } from '@shared/components';
import { LucideAngularModule, X } from 'lucide-angular';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { Router } from '@angular/router';
import { VitalsService } from '@core/services/vitals/vitals.service';
import { Vital } from '@shared/models/vitals';
import { toastNotifications } from '@shared/constants/toast';
import { ToastService } from '@core/services/toast/toast.service';
import { RecordSkelectonComponent } from '../record-skelecton/record-skelecton.component';
import { formatDate } from '@shared/utils/helpers/dates';

@Component({
  selector: 'app-vitals-history',
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
  templateUrl: './vitals-history.component.html',
})
export class VitalsHistoryComponent implements OnInit {
  protected readonly vitals = signal<Vital[]>([]);
  public readonly isAddMedicationModalOpen = signal(false);
  public patientId = input<string>('');
  public loading = signal<boolean>(false);
  public creating = signal<boolean>(false);
  private readonly router = inject(Router);
  private readonly vitalsService = inject(VitalsService);
  public readonly paginated = input(false);
  public toast = inject(ToastService);
  protected formatDate = formatDate;
  public readonly checkFieldErrors = checkFieldErrors;
  public readonly filteredVitals = computed(() =>
    this.paginated() ? this.vitals() : this.vitals().slice(0, 3),
  );
  public vitalsForm!: FormGroup;
  public readonly icons = { X };

  ngOnInit(): void {
    this.initForm();
    this.fetchVitals();
  }

  private initForm(): void {
    this.vitalsForm = new FormGroup({
      height: new FormControl(null, Validators.required),
      weight: new FormControl(null, Validators.required),
      age: new FormControl(null, Validators.required),
      bloodPressure: new FormControl('', Validators.required),
      heartRate: new FormControl('', Validators.required),
      temperature: new FormControl(null, Validators.required),
      recordedAt: new FormControl(new Date().toISOString(), Validators.required),
    });
  }

  private fetchVitals(): void {
    this.loading.set(true);
    this.vitalsService.getVitals(this.patientId()).subscribe({
      next: (response) => {
        this.vitals.set(response.data ?? []);
        this.loading.set(false);
      },
    });
  }

  public visitAllVitals(): void {
    this.router.navigate(['/provider', 'patients', this.patientId(), 'vitals']);
  }

  public toggleAddModal(): void {
    this.isAddMedicationModalOpen.set(!this.isAddMedicationModalOpen());
  }

  public saveChanges(): void {
    this.creating.set(true);
    if (this.vitalsForm.invalid) return;

    const data: Vital = {
      ...this.vitalsForm.value,
      patientId: this.patientId(),
    };

    this.vitalsService.addVital(data).subscribe({
      next: () => {
        this.creating.set(false);
        this.fetchVitals();
        this.toggleAddModal();
        this.vitalsForm.reset();
        this.vitalsForm.patchValue({ recordedAt: new Date().toISOString() });
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

  get height(): FormControl {
    return this.vitalsForm.get('height') as FormControl;
  }

  get weight(): FormControl {
    return this.vitalsForm.get('weight') as FormControl;
  }

  get age(): FormControl {
    return this.vitalsForm.get('age') as FormControl;
  }

  get bloodPressure(): FormControl {
    return this.vitalsForm.get('bloodPressure') as FormControl;
  }

  get heartRate(): FormControl {
    return this.vitalsForm.get('heartRate') as FormControl;
  }

  get temperature(): FormControl {
    return this.vitalsForm.get('temperature') as FormControl;
  }

  get recordedAt(): FormControl {
    return this.vitalsForm.get('recordedAt') as FormControl;
  }
}
