import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ListContainerComponent } from '@shared/components/list-container/list-container.component';
import { LabResultsService } from '@core/services/lab-results/lab-results.service';
import { LabResultsData } from '@shared/models/labResults';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';
import { RecordSkelectonComponent } from '../record-skelecton/record-skelecton.component';
import { formatDate } from '@shared/utils/helpers/dates';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DatePickerComponent, InputComponent, ModalComponent } from '@shared/components';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';

@Component({
  selector: 'app-lab-results',
  standalone: true,
  imports: [
    CommonModule,
    ListContainerComponent,
    ReactiveFormsModule,
    RecordSkelectonComponent,
    ModalComponent,
    DatePickerComponent,
    InputComponent,
  ],
  templateUrl: './lab-results.component.html',
})
export class LabResultsComponent implements OnInit {
  public readonly labResults = signal<LabResultsData[] | []>([]);
  public labResultsFrom!: FormGroup;
  public checkFieldErrors = checkFieldErrors;
  public readonly paginated = input<boolean>(false);
  public readonly patientId = input<string>('');
  public readonly loading = signal<boolean>(false);
  public readonly creating = signal<boolean>(false);
  private readonly router = inject(Router);
  private readonly labResultsService = inject(LabResultsService);
  private readonly toast = inject(ToastService);
  protected readonly formatDate = formatDate;
  public readonly filteredResults = computed(() =>
    this.paginated() ? this.labResults() : this.labResults().slice(0, 3),
  );
  public isAddLabResultsModalOpen = signal<boolean>(false);

  getLabResults(id: string): void {
    this.loading.set(true);
    this.labResultsService.getLabResults(id).subscribe({
      next: (response) => {
        this.labResults.set(response.data);
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

  createLabResult(data: LabResultsData, form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      this.toast.show(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        'Please fill all required fields.',
      );
      return;
    }
    this.creating.set(true);
    this.labResultsService.addLabResults(data).subscribe({
      next: () => {
        this.creating.set(false);
        this.labResultsFrom.reset();
        this.toast.show(
          toastNotifications.operations.create,
          toastNotifications.status.success,
          toastNotifications.messages.recordCreated,
        );
        if (this.labResults().length < 3) {
          this.getLabResults(this.patientId());
        }
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

  constructor() {
    this.labResultsFrom = new FormGroup({
      labTest: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
      resultDate: new FormControl('', Validators.required),
      unit: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      notes: new FormControl(''),
    });
  }

  saveChanges() {
    const payload: LabResultsData = {
      ...this.labResultsFrom.value,
      patientId: this.patientId(),
    };
    this.createLabResult(payload, this.labResultsFrom);
  }

  toggleAddModal() {
    this.isAddLabResultsModalOpen.set(!this.isAddLabResultsModalOpen());
  }

  cancelAddModal() {
    this.isAddLabResultsModalOpen.set(false);
    this.labResultsFrom.reset();
  }

  get labTest() {
    return this.labResultsFrom.get('labTest') as FormControl;
  }
  get value() {
    return this.labResultsFrom.get('value') as FormControl;
  }
  get resultDate() {
    return this.labResultsFrom.get('resultDate') as FormControl;
  }
  get unit() {
    return this.labResultsFrom.get('unit') as FormControl;
  }
  get referenceRange() {
    return this.labResultsFrom.get('referenceRange') as FormControl;
  }
  get status() {
    return this.labResultsFrom.get('status') as FormControl;
  }
  get notes() {
    return this.labResultsFrom.get('notes') as FormControl;
  }

  visitAllLabResults() {
    this.router.navigate(['/provider', 'patients', this.patientId(), 'lab-results']);
  }

  ngOnInit(): void {
    this.getLabResults(this.patientId());
  }
}
